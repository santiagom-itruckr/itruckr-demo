import { Bot } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
  const { selectedCaseId, getCaseById } = useCasesStore();
  const {
    getProcessById,
    addMessageToStep,
    advanceProcessStep,
    updateProcessStepExecution,
    setProcessStepLoading,
    updateProcessStepData,
  } = useProcessesStore();
  const { getDriverById } = useDriversStore();
  const { addMessageToConversation } = useConversationsStore();
  const { addLoad, updateLoad } = useLoadsStore();
  const { addEmail } = useEmailStore();
  const { addNotification } = useNotificationsStore();

  const timelineCompleteStepRef = useRef<(() => void) | null>(null);
  const currentStepIdRef = useRef<string | null>(null);

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

  const currentStep = process?.steps[process?.currentStepIndex ?? 0];
  const isLoading = !!currentStep?.isLoading;

  useEffect(() => {
    if (!process) return;

    let isCancelled = false;
    let isProcessing = false;
    const effectProcessId = process.id;

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
            case 'notification': {
              const caseForThisProcess = process?.caseId
                ? getCaseById(process.caseId)
                : undefined;
              const targetRelatedEntityId =
                newEntity.relatedEntityId ||
                caseForThisProcess?.relatedEntityId ||
                activeCase?.relatedEntityId ||
                driver?.id ||
                '';
              addNotification({
                userId: '1',
                step: newEntity.step,
                type: newEntity.type,
                title: newEntity.title,
                message: newEntity.message,
                relatedEntityType: newEntity.relatedEntityType,
                relatedEntityId: targetRelatedEntityId,
              });
              break;
            }
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
              console.log(entityId, updateData);

              updateLoad(entityId, updateData as unknown as Load);
              break;
            case 'conversation': {
              const caseForThisProcess = process?.caseId
                ? getCaseById(process.caseId)
                : undefined;
              const targetConversationId =
                (entityId && entityId.length > 0)
                  ? entityId
                  : caseForThisProcess?.relatedEntityId || activeCase?.relatedEntityId || driver?.id || '';

              if (targetConversationId) {
                const senderType = updateData['senderType'] as MessageSenderType;
                const computedSenderId =
                  senderType === 'user'
                    ? targetConversationId
                    : ((updateData['senderId'] as string) || 'ai_agent');
                addMessageToConversation(targetConversationId, {
                  senderId: computedSenderId,
                  senderType,
                  content: updateData['content'] as string,
                });
              }
              break;
            }
          }
        } catch (error) {
          console.error(`Error updating entity of type ${entityType}:`, error);
        }
      }
    };

    const completeStep = (pid?: string, sid?: string) => {
      if (isCancelled) return;

      // If we have explicit process and step, advance directly to avoid cross-process issues
      if (pid && sid) {
        advanceProcessStep(pid, sid, 'user_input');
        return;
      }

      // Fallback to timeline or handler (used for user-driven actions)
      if (timelineCompleteStepRef.current) {
        timelineCompleteStepRef.current();
      } else {
        handleCompleteCurrentStep();
      }
    };

    const performApiCall = async (
      apiCall: any,
      updatesEntities: EntityUpdateConfig[] | undefined,
      stepIndex: number,
      stepId: string,
      initialRetryCount = 0
    ) => {
      const maxRetries = 180;
      let retryCount = initialRetryCount;

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
            completeStep(effectProcessId, currentStepIdRef.current || undefined);
            if (currentStepIdRef.current) {
              setProcessStepLoading(effectProcessId, currentStepIdRef.current, false);
            }
            // Reset retry count on success
            updateProcessStepData(effectProcessId, stepId, { retryCount: 0 });
          } else if (retryCount < maxRetries && !isCancelled) {
            retryCount++;
            console.log(`Retrying in 10 seconds... (${retryCount}/${maxRetries})`);
            // Persist retry count
            updateProcessStepData(effectProcessId, stepId, { retryCount });
            setTimeout(callApiWithRetry, 10000);
          } else if (!isCancelled) {
            console.error('Max retries reached or expected value not found');
          }
        } catch (error) {
          if (isCancelled) return;
          console.error('Error in API call:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying after error in 10 seconds... (${retryCount}/${maxRetries})`);
            // Persist retry count
            updateProcessStepData(effectProcessId, stepId, { retryCount });
            setTimeout(callApiWithRetry, 10000);
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

      const currentStep = process.steps[process.currentStepIndex]!;
      const {
        id: stepId,
        executionId: stepExecutionId,
        requiredUserInput,
        triggersApiCall,
        updatesEntities,
        createsEntities,
        awaitFor,
      } = currentStep!;

      // Keep a ref of the step id for async callbacks inside this effect
      currentStepIdRef.current = stepId;

      // If step is marked loading (persisted), resume its action without re-marking execution
      if (currentStep.isLoading) {
        try {
          // Keep ref updated
          currentStepIdRef.current = stepId;
          if (triggersApiCall) {
            await performApiCall(
              triggersApiCall,
              updatesEntities,
              process.currentStepIndex,
              stepId,
              currentStep.retryCount || 0
            );
            return;
          }
          if (awaitFor && !triggersApiCall && !requiredUserInput) {
            // Resume await path (cannot know remaining time, so wait full duration again)
            await new Promise(resolve => setTimeout(resolve, awaitFor));
            if (!isCancelled) {
              await updateEntities(updatesEntities, process.currentStepIndex, 'await');
              setProcessStepLoading(effectProcessId, stepId, false);
              updateProcessStepData(effectProcessId, stepId, { retryCount: 0 });
              completeStep(effectProcessId, stepId);
            }
            return;
          }
        } catch (e) {
          console.error('Error resuming step actions:', e);
        }
      }

      // Check if this step has already been executed
      const executionId = `${process.id}-${stepId}-${process.currentStepIndex}`;
      if (stepExecutionId === executionId) {
        console.log('Step already executed, skipping...');
        return;
      }

      isProcessing = true;

      try {
        updateProcessStepExecution(effectProcessId, stepId, executionId);

        // Create entities first (no await to prevent blocking)
        createEntities(createsEntities, process.currentStepIndex);

        if (triggersApiCall) {
          setProcessStepLoading(effectProcessId, stepId, true);
          // Initialize retryCount for a fresh API cycle
          updateProcessStepData(effectProcessId, stepId, { retryCount: 0 });

          if (awaitFor) await new Promise(resolve => setTimeout(resolve, awaitFor));

          await performApiCall(
            triggersApiCall,
            updatesEntities,
            process.currentStepIndex,
            stepId,
            0
          );
        } else if (awaitFor && !triggersApiCall! && !requiredUserInput) {
          setProcessStepLoading(effectProcessId, stepId, true);
          await new Promise(resolve => setTimeout(resolve, awaitFor));

          if (!isCancelled) {
            await updateEntities(
              updatesEntities,
              process.currentStepIndex,
              'await'
            );
            setProcessStepLoading(effectProcessId, stepId, false);
            updateProcessStepData(effectProcessId, stepId, { retryCount: 0 });
            completeStep(effectProcessId, stepId);
          }
        } else if (!requiredUserInput) {
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!isCancelled) {
            await updateEntities(
              updatesEntities,
              process.currentStepIndex,
              'other'
            );
            completeStep(effectProcessId, stepId);
          }
        }
      } catch (error) {
        console.error('Error in performStepActions:', error);
        setProcessStepLoading(effectProcessId, currentStepIdRef.current || stepId, false);
      } finally {
        isProcessing = false;
      }
    };

    performStepActions();
    return () => {
      isCancelled = true;
    };
  }, [process?.id, process?.currentStepIndex]);

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
