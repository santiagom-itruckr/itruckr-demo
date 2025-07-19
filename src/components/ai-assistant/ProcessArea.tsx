import { Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DRIVER_1, TRUCK_1 } from '@/constants';
import { NotificationDefinitions } from '@/notifications/notificationDefinitions';
import { useCasesStore } from '@/stores/casesStore';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useDriversStore } from '@/stores/driversStore';
import { useEmailStore } from '@/stores/emailStore';
import { useLoadsStore } from '@/stores/loadsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useProcessesStore } from '@/stores/processesStore';
import {
  EntityCreationConfig,
  EntityUpdateConfig,
  Load,
  MessageSenderType,
} from '@/types/app';

import IntegratedProcessTimeline from './IntegratedProcessTimeline';
import ProcessInput from './ProcessInput';

function ProcessArea() {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCaseId, getCaseById } = useCasesStore();
  const { getProcessById, addMessageToStep, advanceProcessStep } =
    useProcessesStore();
  const { getDriverById } = useDriversStore();
  const { addMessageToConversation } = useConversationsStore();
  const { addLoad, updateLoad } = useLoadsStore();
  const { addEmail } = useEmailStore();
  const { addNotification } = useNotificationsStore();

  const timelineCompleteStepRef = useRef<(() => void) | null>(null);

  const setTimelineCompleteStep = (completeStepFn: () => void) => {
    timelineCompleteStepRef.current = completeStepFn;
  };

  const activeCase =
    selectedCaseId !== undefined ? getCaseById(selectedCaseId) : undefined;
  const process =
    activeCase && activeCase.processId
      ? getProcessById(activeCase.processId)
      : undefined;
  const driver = getDriverById(activeCase?.relatedEntityId!);

  useEffect(() => {
    const isCancelled = false;
    let isProcessing = false;

    const createEntities = async (
      createsEntities: EntityCreationConfig[] | undefined,
      stepIndex: number
    ) => {
      if (!createsEntities || isCancelled) return;

      console.log('CREATE', stepIndex);

      for (const entity of createsEntities) {
        if (isCancelled) break;

        const { entityType, newEntity, withDelay } = entity;

        if (withDelay) {
          await new Promise(resolve => setTimeout(resolve, withDelay));
          if (isCancelled) break;
        }

        try {
          switch (entityType) {
            case 'load':
              if (newEntity) {
                addLoad(newEntity);
              }
              break;
            case 'email':
              if (newEntity) {
                addEmail(newEntity);
              }
              break;
            case 'notification':
              const oilChangeNotification =
                NotificationDefinitions.creatOilChangeNotification({
                  driver: DRIVER_1,
                  truck: TRUCK_1,
                });

              addNotification({
                userId: '1',
                type: oilChangeNotification.type,
                title: oilChangeNotification.title,
                message: oilChangeNotification.message,
                relatedEntityType: oilChangeNotification.relatedEntityType,
                relatedEntityId: DRIVER_1.id,
              });
              break;
          }
        } catch (error) {
          console.error(`Error creating entity of type ${entityType}:`, error);
        }
      }
    };

    const updateEntities = async (
      updatesEntities: EntityUpdateConfig[] | undefined,
      stepIndex: number,
      source: string
    ) => {
      if (!updatesEntities || isCancelled) return;

      console.log('UPDATE', stepIndex, source);

      for (const entity of updatesEntities) {
        if (isCancelled) break;

        const { entityType, entityId, updateData, withDelay } = entity;

        if (withDelay) {
          await new Promise(resolve => setTimeout(resolve, withDelay));
          if (isCancelled) break;
        }

        try {
          switch (entityType) {
            case 'load':
              updateLoad(entityId, updateData as unknown as Load);
              break;
            case 'conversation':
              if (driver?.id) {
                addMessageToConversation(driver.id, {
                  senderId: updateData['senderId'] as string,
                  senderType: updateData['senderType'] as MessageSenderType,
                  content: updateData['content'] as string,
                });
              }
              break;
          }
        } catch (error) {
          console.error(`Error updating entity of type ${entityType}:`, error);
        }
      }
    };

    const completeStep = () => {
      if (isCancelled) return;

      if (timelineCompleteStepRef.current) {
        timelineCompleteStepRef.current();
      } else {
        handleCompleteCurrentStep();
      }
    };

    const performApiCall = async (
      apiCall: any,
      updatesEntities: EntityUpdateConfig[] | undefined,
      stepIndex: number
    ) => {
      const maxRetries = 5;
      let retryCount = 0;

      const deepEqual = (obj1: any, obj2: any): boolean => {
        if (typeof obj1 !== typeof obj2) return false;
        if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
          return obj1 === obj2;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) {
          if (!deepEqual(obj1[key], obj2[key])) return false;
        }
        return true;
      };

      const callApiWithRetry = async (): Promise<void> => {
        if (isCancelled) return;

        try {
          // For now, simulating success - uncomment your actual API call
          const response = await fetch(apiCall.endpoint, {
            method: apiCall.method,
            headers: { 'Content-Type': 'application/json' },
          });
          const responseBody = await response.json();
          const expectMatched = apiCall.expect
            ? deepEqual(apiCall.expect, responseBody)
            : true;

          if (expectMatched && !isCancelled) {
            await updateEntities(updatesEntities, stepIndex, 'api');
            completeStep();
          } else if (retryCount < maxRetries && !isCancelled) {
            retryCount++;
            console.log(
              `Retrying in 30 seconds... (${retryCount}/${maxRetries})`
            );
            setTimeout(callApiWithRetry, 30000);
          } else if (!isCancelled) {
            console.error('Max retries reached or expected value not found');
          }
        } catch (error) {
          if (isCancelled) return;

          console.error('Error in API call:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(
              `Retrying after error in 30 seconds... (${retryCount}/${maxRetries})`
            );
            setTimeout(callApiWithRetry, 30000);
          } else {
            console.error('Max retries reached after errors');
          }
        }
      };

      await callApiWithRetry();
    };

    const performStepActions = async () => {
      if (
        isProcessing ||
        isCancelled ||
        !process?.steps[process.currentStepIndex]
      ) {
        return;
      }

      isProcessing = true;

      try {
        const currentStep = process.steps[process.currentStepIndex];
        const {
          requiredUserInput,
          triggersApiCall,
          updatesEntities,
          createsEntities,
          awaitFor,
        } = currentStep!;

        // Create entities first (no await to prevent blocking)
        createEntities(createsEntities, process.currentStepIndex);

        if (triggersApiCall) {
          setIsLoading(true);
          await performApiCall(
            triggersApiCall,
            updatesEntities,
            process.currentStepIndex
          );
          setIsLoading(false);
        } else if (awaitFor && !requiredUserInput) {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, awaitFor));

          if (!isCancelled) {
            await updateEntities(
              updatesEntities,
              process.currentStepIndex,
              'await'
            );
            setIsLoading(false);
            completeStep();
          }
        } else if (!requiredUserInput) {
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!isCancelled) {
            await updateEntities(
              updatesEntities,
              process.currentStepIndex,
              'other'
            );
            completeStep();
          }
        }
      } catch (error) {
        console.error('Error in performStepActions:', error);
        setIsLoading(false);
      } finally {
        isProcessing = false;
      }
    };

    performStepActions();
  }, [process?.currentStepIndex]);

  if (!activeCase) {
    return (
      <div className='flex-1 flex items-center justify-center text-custom-text-secondary'>
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 mx-auto bg-absolute-black rounded-full flex items-center justify-center'>
            <Bot className='w-8 h-8 text-white' />
          </div>
          <div>
            <h3 className='text-xl font-medium mb-2 text-custom-text-primary'>
              Welcome to the <b>iTruckr</b> Assistant
            </h3>
            <p className='text-sm text-custom-text-secondary max-w-md'>
              Select a case from the sidebar or start a new one to begin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If a case is selected but no process found
  if (!process) {
    return (
      <div className='flex-1 flex items-center justify-center text-custom-text-secondary'>
        Loading process for case: {activeCase.title}...
      </div>
    );
  }

  // Functions for interacting with the process and chat
  const handleSendMessage = async (content: string) => {
    const currentStep = process.steps[process.currentStepIndex];
    if (!currentStep) return;

    addMessageToStep(
      process.id,
      currentStep.id,
      '1', // TODO: Replace with actual logged-in user ID
      'user',
      content
    );

    // Simulate AI response after a short delay
    setTimeout(
      () => {
        const responses = [
          'I understand your request. Let me help you with that.',
          "I'm processing your information and will provide assistance shortly.",
          'Based on your input, here are some recommendations...',
          "I've found some relevant information that might help.",
          'Let me check the current status and get back to you.',
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        addMessageToStep(
          process.id,
          currentStep.id,
          'ai-assistant',
          'ai_agent',
          randomResponse!
        );
      },
      1000 + Math.random() * 2000
    );
  };

  const handleCompleteCurrentStep = async () => {
    const currentStep = process.steps[process.currentStepIndex];
    if (!currentStep) return;

    advanceProcessStep(process.id, currentStep.id, 'user_input');
  };

  return (
    <div className='relative flex-1 flex flex-col'>
      <IntegratedProcessTimeline
        process={process}
        onCompleteStep={handleCompleteCurrentStep}
        isLoading={isLoading}
        onTimelineCompleteStepReady={setTimelineCompleteStep}
      />

      <ProcessInput activeCase={activeCase} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ProcessArea;
