import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useLoadsStore } from "./loadsStore"; // Assuming you have this
import { useDriversStore } from "./driversStore"; // Assuming you have this
import { useTrucksStore } from "./trucksStore"; // Assuming you have this
import { useCompaniesStore } from "./companiesStore";
import {
  BaseProcess,
  ChatMessage,
  ProcessStep,
  ProcessStepStatus,
  CaseStatus,
  CaseType,
  MessageSenderType,
  LoadProcess,
  OilChangeProcess,
  StepCompletionSource,
  Driver,
  Load,
  Company,
} from "../types/app";
import { generateId, getCurrentIsoDate } from "./utils";

// Define an "any" process type for the state array
type AnyProcess = LoadProcess | OilChangeProcess;

interface ProcessesState {
  processes: AnyProcess[];
  createProcess: (
    caseId: string,
    type: CaseType,
    initialSteps: ProcessStep[],
    relatedEntityId: string, // loadId or roadEmergencyId
  ) => AnyProcess;
  getProcessById: (processId: string) => AnyProcess | undefined;
  getProcessesByCaseId: (caseId: string) => AnyProcess[];
  advanceProcessStep: (
    processId: string,
    stepId: string,
    completionSource: StepCompletionSource,
  ) => void;
  addMessageToStep: (
    processId: string,
    stepId: string,
    senderId: string,
    senderType: MessageSenderType,
    content: string,
  ) => ChatMessage;
  updateProcessStatus: (processId: string, status: CaseStatus) => void;
  updateProcessStepStatus: (
    processId: string,
    stepId: string,
    status: ProcessStepStatus,
  ) => void;
  setProcessCurrentStep: (processId: string, stepId: string) => void;
  createEntitiesForStep: (processId: string, stepId: string, apiResponse: Record<string, unknown>) => void;
  updateEntitiesForStep: (processId: string, stepId: string) => void;
}

export const useProcessesStore = create<ProcessesState>()(
  devtools(
    immer((set, get) => ({
      processes: [],

      createProcess: (caseId, type, initialSteps, relatedEntityId) => {
        const processId = generateId();
        const commonProcessProps = {
          id: processId,
          caseId,
          type,
          currentStepIndex: 0,
          status: "in_progress",
          startedAt: getCurrentIsoDate(),
          updatedAt: getCurrentIsoDate(),
          steps: initialSteps.map((step, index) => ({
            ...step,
            id: step.id || generateId(), // Ensure step has an ID
            status: index === 0 ? "in_progress" : "pending", // First step is in progress
            startedAt: index === 0 ? getCurrentIsoDate() : undefined,
          })),
        };

        let newProcess: AnyProcess;
        if (type === "load_process") {
          newProcess = {
            ...(commonProcessProps as BaseProcess),
            type: "load_process",
            loadId: relatedEntityId,
            steps: commonProcessProps.steps as LoadProcess["steps"],
          };
        } else if (type === "oil_change") {
          newProcess = {
            ...(commonProcessProps as BaseProcess),
            type: "oil_change",
            roadEmergencyId: relatedEntityId,
            steps: commonProcessProps.steps as OilChangeProcess["steps"],
          };
        } else {
          // Fallback or throw error for unknown process types
          throw new Error(`Unknown process type: ${type}`);
        }

        set((state) => {
          state.processes.push(newProcess);
        });
        return newProcess;
      },

      getProcessById: (processId) => {
        return get().processes.find((p) => p.id === processId);
      },

      getProcessesByCaseId: (caseId) => {
        return get().processes.filter((p) => p.caseId === caseId);
      },

      advanceProcessStep: (processId, stepId, completionSource) => {
        set((state) => {
          const process = state.processes.find((p) => p.id === processId);
          if (!process) return;

          const currentStep = process.steps.find((s) => s.id === stepId);
          if (!currentStep || currentStep.status === "completed") return;

          // Complete the current step
          currentStep.status = "completed";
          currentStep.completedAt = getCurrentIsoDate();
          currentStep.completionSource = completionSource;

          // Find the next step
          const currentStepIndex = process.steps.findIndex((s) => s.id === stepId);
          process.currentStepIndex = currentStepIndex; // Ensure index is correctly set after completion
          const nextStepIndex = currentStepIndex + 1;

          if (nextStepIndex < process.steps.length) {
            const nextStep = process.steps[nextStepIndex];
            nextStep.status = "in_progress";
            nextStep.startedAt = getCurrentIsoDate();
            process.currentStepIndex = nextStepIndex;
          } else {
            // Process completed
            process.status = "resolved";
            process.completedAt = getCurrentIsoDate();
          }
          process.updatedAt = getCurrentIsoDate();
        });
      },

      addMessageToStep: (processId, stepId, senderId, senderType, content) => {
        let newMessage: ChatMessage;
        set((state) => {
          const process = state.processes.find((p) => p.id === processId);
          if (!process) return;

          const step = process.steps.find((s) => s.id === stepId);
          if (step) {
            newMessage = {
              id: generateId(),
              senderId,
              senderType,
              timestamp: getCurrentIsoDate(),
              content,
            };
            step.messages.push(newMessage);
            process.updatedAt = getCurrentIsoDate();
          }
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return newMessage; // Return the new message for immediate use if needed
      },

      updateProcessStatus: (processId, status) => {
        set((state) => {
          const process = state.processes.find((p) => p.id === processId);
          if (process) {
            process.status = status;
            process.updatedAt = getCurrentIsoDate();
            if (status === "resolved" || status === "closed" || status === "cancelled") {
              process.completedAt = getCurrentIsoDate();
            }
          }
        });
      },

      updateProcessStepStatus: (processId, stepId, status) => {
        set((state) => {
          const process = state.processes.find((p) => p.id === processId);
          if (!process) return;

          const step = process.steps.find((s) => s.id === stepId);
          if (step) {
            step.status = status;
            process.updatedAt = getCurrentIsoDate();
            if (status === "completed") {
              step.completedAt = getCurrentIsoDate();
            }
          }
        });
      },

      setProcessCurrentStep: (processId, stepId) => {
        set((state) => {
          const process = state.processes.find((p) => p.id === processId);
          if (!process) return;

          const targetStepIndex = process.steps.findIndex((s) => s.id === stepId);
          if (targetStepIndex !== -1) {
            process.currentStepIndex = targetStepIndex;
            process.updatedAt = getCurrentIsoDate();
            // Optionally, update status of steps
            process.steps.forEach((step, index) => {
              if (index < targetStepIndex && step.status !== "completed") {
                step.status = "completed"; // Mark previous as completed if not
                step.completedAt = step.completedAt || getCurrentIsoDate();
              } else if (index === targetStepIndex) {
                step.status = "in_progress";
                step.startedAt = step.startedAt || getCurrentIsoDate();
              } else if (index > targetStepIndex && step.status !== "pending") {
                step.status = "pending"; // Mark future as pending
                step.startedAt = ""; // Use empty string instead of undefined
                step.completedAt = ""; // Use empty string instead of undefined
              }
            });
          }
        });
      },

      createEntitiesForStep: (processId: string, stepId: string, apiResponse: Record<string, unknown>) => {
        const process = get().processes.find((p) => p.id === processId);
        if (!process) return;

        const step = process.steps.find((s) => s.id === stepId);
        if (!step || !step.createsEntities || !apiResponse) return;

        step.createsEntities.forEach((creationConfig) => {
          const { entityType, dataMap } = creationConfig;
          let entityData: Record<string, unknown> | undefined;

          // Extract data from apiResponse based on dataMap
          if (dataMap) {
            const pathParts = dataMap.split('.');
            let currentData: unknown = apiResponse;
            for (const part of pathParts) {
              if (currentData && typeof currentData === 'object' && !Array.isArray(currentData) && part in currentData) {
                currentData = (currentData as Record<string, unknown>)[part];
              } else {
                currentData = undefined;
                break;
              }
            }
            entityData = currentData as Record<string, unknown>; // Cast to the expected type
          } else {
            entityData = apiResponse; // If no dataMap, assume entire response is entity data
          }

          if (!entityData) return;

          switch (entityType) {
            case 'load':
              useLoadsStore.getState().addLoad(entityData as unknown as Load);
              break;
            case 'driver':
              useDriversStore.getState().addDriver(entityData as unknown as Driver);
              break;
            case 'company':
              useCompaniesStore.getState().addCompany(entityData as unknown as Company);
              break;
            case 'road_emergency':
              // Assuming you have a useRoadEmergenciesStore
              // useRoadEmergoriesStore.getState().addRoadEmergency(entityData as RoadEmergency);
              console.warn(`Entity type 'road_emergency' not yet fully implemented for creation.`);
              break;
            case 'truck':
              // Assuming you have a useTrucksStore
              // useTrucksStore.getState().addTruck(entityData as Truck);
              console.warn(`Entity type 'truck' not yet fully implemented for creation.`);
              break;
            default:
              console.warn(`Unknown entity type for creation: ${entityType}`);
          }
        });
      },

      updateEntitiesForStep: (processId, stepId) => {
        const process = get().processes.find((p) => p.id === processId);
        if (!process) return;

        const step = process.steps.find((s) => s.id === stepId);
        if (!step || !step.updatesEntities) return;

        step.updatesEntities.forEach((update) => {
          let resolvedUpdateData = { ...update.updateData };

          if (process.type === 'load_process') {
            const loadId = process.loadId;
            for (const key in resolvedUpdateData) {
              if (
                typeof resolvedUpdateData[key] === 'string' &&
                (resolvedUpdateData[key] as string).includes('${loadId}')
              ) {
                resolvedUpdateData[key] = (
                  resolvedUpdateData[key] as string
                ).replace('${loadId}', loadId);
              }
              if (
                typeof resolvedUpdateData[key] === 'string' &&
                (resolvedUpdateData[key] as string).includes('${driverId}')
              ) {
                // Handle driverId replacement if needed
              }
              if (
                typeof resolvedUpdateData[key] === 'string' &&
                (resolvedUpdateData[key] as string).includes('${currentDate}')
              ) {
                resolvedUpdateData[key] = getCurrentIsoDate();
              }
            }
          } else if (process.type === 'oil_change') {
            const emergencyId = process.roadEmergencyId;
            for (const key in resolvedUpdateData) {
              if (
                typeof resolvedUpdateData[key] === 'string' &&
                (resolvedUpdateData[key] as string).includes('${emergencyId}')
              ) {
                resolvedUpdateData[key] = (
                  resolvedUpdateData[key] as string
                ).replace('${emergencyId}', emergencyId);
              }
              if (
                typeof resolvedUpdateData[key] === 'string' &&
                (resolvedUpdateData[key] as string).includes('${currentDate}')
              ) {
                resolvedUpdateData[key] = getCurrentIsoDate();
              }
            }
          }

          console.log(
            `[Real Update] Applying update for ${update.entityType} ID ${update.entityId}:`,
            resolvedUpdateData,
          );

          if (update.entityType === 'Load') {
            useLoadsStore
              .getState()
              .updateLoad(update.entityId, resolvedUpdateData as any);
          } else if (update.entityType === 'Driver') {
            useDriversStore
              .getState()
              .updateDriver(update.entityId, resolvedUpdateData as any);
          } else if (update.entityType === 'Truck') {
            useTrucksStore
              .getState()
              .updateTruck(update.entityId, resolvedUpdateData as any);
          } else if (update.entityType === 'Company') {
            useCompaniesStore
              .getState()
              .updateCompany(update.entityId, resolvedUpdateData as any);
          }
        });
      }
    })),
    { name: "ProcessesStore" },
  ),
);