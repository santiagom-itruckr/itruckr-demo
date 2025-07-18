import { useEffect, useState, useRef } from 'react';
import { Bot } from 'lucide-react';
import { useCasesStore } from '@/stores/casesStore';
import { useProcessesStore } from '@/stores/processesStore';
import { useDriversStore } from '@/stores/driversStore';
import IntegratedProcessTimeline from './IntegratedProcessTimeline';
import ProcessInput from './ProcessInput';
import { useConversationsStore } from '@/stores/conversationsStore';
import { useLoadsStore } from '@/stores/loadsStore';
import { DRIVER_1, TRUCK_1 } from '@/constants';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { NotificationDefinitions } from '@/notifications/notificationDefinitions';
import { MessageSenderType } from '@/types/app';
import { useEmailStore } from '@/stores/emailStore';

function ProcessArea() {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCaseId, getCaseById } = useCasesStore();
  const { getProcessById, addMessageToStep, advanceProcessStep, createEntitiesForStep } = useProcessesStore();
  const { getDriverById } = useDriversStore();
  const { addMessageToConversation } = useConversationsStore();
  const { addLoad, updateLoad } = useLoadsStore();
  const { addEmail } = useEmailStore();
  const { addNotification } = useNotificationsStore();

  const timelineCompleteStepRef = useRef<(() => void) | null>(null);

  const setTimelineCompleteStep = (completeStepFn: () => void) => {
    timelineCompleteStepRef.current = completeStepFn;
  };

  const activeCase = selectedCaseId !== undefined ? getCaseById(selectedCaseId) : undefined;
  const process = activeCase && activeCase.processId ? getProcessById(activeCase.processId) : undefined;
  const driver = getDriverById(activeCase?.relatedEntityId!);

  useEffect(() => {
    const performStepActions = async () => {
      if (!process?.steps[process.currentStepIndex]) return;

      const {
        requiredUserInput,
        triggersApiCall,
        updatesEntities,
        createsEntities,
        awaitFor
      } = process?.steps[process.currentStepIndex];

      if (triggersApiCall) {
        setIsLoading(true);

        const currentStep = process.steps[process.currentStepIndex];
        const apiCall = currentStep.triggersApiCall;

        if (!apiCall) {
          console.warn("No API call configuration found for current step");
          setIsLoading(false);
          return;
        }

        const maxRetries = 5;
        let retryCount = 0;

        // Helper function for deep equality
        function deepEqual(obj1: any, obj2: any): boolean {
          if (typeof obj1 !== typeof obj2) return false;
          if (typeof obj1 !== "object" || obj1 === null || obj2 === null) {
            return obj1 === obj2;
          }
          const keys1 = Object.keys(obj1);
          const keys2 = Object.keys(obj2);
          if (keys1.length !== keys2.length) return false;
          for (const key of keys1) {
            if (!deepEqual(obj1[key], obj2[key])) return false;
          }
          return true;
        }

        async function callApiWithRetry(apiCall: any): Promise<void> {
          try {
            const { endpoint, method, expect } = apiCall;

            console.log(`Attempting API call (attempt ${retryCount + 1}/${maxRetries + 1})`);

            const response = await fetch(endpoint, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            // Parse response body only once
            const responseBody = await response.json();

            console.log("Response status:", response.status);
            console.log("Response body:", responseBody);
            console.log("Expected:", expect);

            // Check if expect matches responseBody
            let expectMatched = false;
            if (expect) {
              if (typeof responseBody === "object" && responseBody !== null) {
                expectMatched = deepEqual(expect, responseBody);
              } else if (typeof responseBody === "string") {
                // If responseBody is a string, check if it includes the stringified expect
                expectMatched = responseBody.includes(JSON.stringify(expect));
              } else {
                // For other types, do direct comparison
                expectMatched = responseBody === expect;
              }
            } else {
              expectMatched = true; // No expect condition, always match
            }

            console.log("Expect matched:", expectMatched);

            if (expectMatched) {
              // Success - complete the step
              setTimeout(() => {
                if (timelineCompleteStepRef.current) {
                  timelineCompleteStepRef.current();
                } else {
                  handleCompleteCurrentStep();
                }
                setIsLoading(false);
              }, 100);
            } else {
              // Retry if we haven't reached max retries
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying in 30 seconds... (${retryCount}/${maxRetries})`);
                setTimeout(() => callApiWithRetry(apiCall), 30000);
              } else {
                setIsLoading(false);
                console.error("Max retries reached. Expected value not found in API response.");
                console.error("Expected:", expect);
                console.error("Received:", responseBody);
              }
            }
          } catch (error) {
            console.error("Error in API call:", error);

            // Retry on error if we haven't reached max retries
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying after error in 30 seconds... (${retryCount}/${maxRetries})`);
              setTimeout(() => callApiWithRetry(apiCall), 30000);
            } else {
              setIsLoading(false);
              console.error("Max retries reached after errors.");
            }
          }
        }

        callApiWithRetry(apiCall);
      } else if (awaitFor) {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, awaitFor));
        setIsLoading(false);
        handleCompleteCurrentStep();
      } else if (!requiredUserInput) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (timelineCompleteStepRef.current) {
          timelineCompleteStepRef.current();
        } else {
          handleCompleteCurrentStep();
        }
      }

      if (createsEntities) {
        createsEntities.forEach((entity) => {
          const { entityType, newEntity } = entity;

          switch (entityType) {
            case 'load':
              if (newEntity) {
                addLoad(newEntity)
              }
              break;
            case 'email':
              if (newEntity) {
                addEmail(newEntity)
              }
              break;
            case 'notification':
              const oilChangeNotification = NotificationDefinitions.creatOilChangeNotification({
                driver: DRIVER_1,
                truck: TRUCK_1,
              })

              addNotification({
                userId: '1',
                type: oilChangeNotification.type,
                title: oilChangeNotification.title,
                message: oilChangeNotification.message,
                relatedEntityType: oilChangeNotification.relatedEntityType,
                relatedEntityId: DRIVER_1.id
              })
              break;
          }
        })

        // createEntitiesForStep(process.id, currentStep.id, apiResponse);
      }

      if (updatesEntities) {
        updatesEntities.forEach((entity) => {
          const { entityType, entityId, updateData } = entity;

          switch (entityType) {
            case 'load':
              updateLoad(entityId, updateData)
              break;
            case 'conversation':
              if (updateData.withDelay) {
                setTimeout(() => {
                  addMessageToConversation(driver!.id, {
                    senderId: updateData.senderId as string,
                    senderType: updateData.senderType as MessageSenderType,
                    content: updateData.message as string,
                  });
                }, updateData.withDelay as number);
              } else {
                addMessageToConversation(driver!.id, {
                  senderId: updateData.senderId as string,
                  senderType: updateData.senderType as MessageSenderType,
                  content: updateData.message as string,
                });
              }
              break;
          }

        })

        // createEntitiesForStep(process.id, currentStep.id, apiResponse);
      }
    };

    performStepActions();
  }, [process?.currentStepIndex, process?.id, createEntitiesForStep]);

  if (!activeCase) {
    return (
      <div className="flex-1 flex items-center justify-center text-custom-text-secondary">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-absolute-black rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 text-custom-text-primary">Welcome to the <b>iTruckr</b> Assistant</h3>
            <p className="text-sm text-custom-text-secondary max-w-md">
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
      <div className="flex-1 flex items-center justify-center text-custom-text-secondary">
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
      "1", // TODO: Replace with actual logged-in user ID
      "user",
      content,
    );

    // Simulate AI response after a short delay
    setTimeout(() => {
      const responses = [
        "I understand your request. Let me help you with that.",
        "I'm processing your information and will provide assistance shortly.",
        "Based on your input, here are some recommendations...",
        "I've found some relevant information that might help.",
        "Let me check the current status and get back to you."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessageToStep(
        process.id,
        currentStep.id,
        'ai-assistant',
        'ai_agent',
        randomResponse
      );
    }, 1000 + Math.random() * 2000);
  };

  const handleCompleteCurrentStep = async () => {
    const currentStep = process.steps[process.currentStepIndex];
    if (!currentStep) return;

    advanceProcessStep(process.id, currentStep.id, "user_input");
  };

  return (
    <div className="relative flex-1 flex flex-col">
      <IntegratedProcessTimeline
        process={process}
        onCompleteStep={handleCompleteCurrentStep}
        isLoading={isLoading}
        onTimelineCompleteStepReady={setTimelineCompleteStep}
      />

      <ProcessInput
        activeCase={activeCase}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ProcessArea; 