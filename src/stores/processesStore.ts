import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  BaseProcess,
  CaseStatus,
  CaseType,
  ChatMessage,
  LoadProcess,
  MessageSenderType,
  OilChangeProcess,
  ProcessStep,
  ProcessStepStatus,
  StepCompletionSource,
} from '../types/app';

import { generateId, getCurrentIsoDate } from './utils';

// Define an "any" process type for the state array
type AnyProcess = LoadProcess | OilChangeProcess;

interface ProcessesState {
  processes: AnyProcess[];
  createProcess: (
    caseId: string,
    type: CaseType,
    initialSteps: ProcessStep[],
    relatedEntityId: string // loadId or roadEmergencyId
  ) => AnyProcess;
  getProcessById: (processId: string) => AnyProcess | undefined;
  getProcessesByCaseId: (caseId: string) => AnyProcess[];
  advanceProcessStep: (
    processId: string,
    stepId: string,
    completionSource: StepCompletionSource
  ) => void;
  addMessageToStep: (
    processId: string,
    stepId: string,
    senderId: string,
    senderType: MessageSenderType,
    content: string
  ) => ChatMessage;
  updateProcessStatus: (processId: string, status: CaseStatus) => void;
  updateProcessStepStatus: (
    processId: string,
    stepId: string,
    status: ProcessStepStatus
  ) => void;
  setProcessCurrentStep: (processId: string, stepId: string) => void;
  updateProcessStepExecution: (processId: string, stepId: string, executionId: string) => void;
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
          status: 'in_progress',
          startedAt: getCurrentIsoDate(),
          updatedAt: getCurrentIsoDate(),
          steps: initialSteps.map((step, index) => ({
            ...step,
            id: step.id || generateId(), // Ensure step has an ID
            status: index === 0 ? 'in_progress' : 'pending', // First step is in progress
            startedAt: index === 0 ? getCurrentIsoDate() : undefined,
          })),
        };

        let newProcess: AnyProcess;
        if (type === 'load_process') {
          newProcess = {
            ...(commonProcessProps as BaseProcess),
            type: 'load_process',
            loadId: relatedEntityId,
            steps: commonProcessProps.steps as LoadProcess['steps'],
          };
        } else if (type === 'oil_change') {
          newProcess = {
            ...(commonProcessProps as BaseProcess),
            type: 'oil_change',
            roadEmergencyId: relatedEntityId,
            steps: commonProcessProps.steps as OilChangeProcess['steps'],
          };
        } else {
          // Fallback or throw error for unknown process types
          throw new Error(`Unknown process type: ${type}`);
        }

        set(state => {
          state.processes.push(newProcess);
        });
        return newProcess;
      },

      getProcessById: processId => {
        return get().processes.find(p => p.id === processId);
      },

      getProcessesByCaseId: caseId => {
        return get().processes.filter(p => p.caseId === caseId);
      },

      advanceProcessStep: (processId, stepId, completionSource) => {
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (!process) return;

          const currentStep = process.steps.find(s => s.id === stepId);
          if (!currentStep || currentStep.status === 'completed') return;

          // Complete the current step
          currentStep.status = 'completed';
          currentStep.completedAt = getCurrentIsoDate();
          currentStep.completionSource = completionSource;

          // Find the next step
          const currentStepIndex = process.steps.findIndex(
            s => s.id === stepId
          );
          process.currentStepIndex = currentStepIndex; // Ensure index is correctly set after completion
          const nextStepIndex = currentStepIndex + 1;

          if (nextStepIndex < process.steps.length) {
            const nextStep = process.steps[nextStepIndex];
            nextStep!.status = 'in_progress';
            nextStep!.startedAt = getCurrentIsoDate();
            process.currentStepIndex = nextStepIndex;
          } else {
            // Process completed
            process.status = 'resolved';
            process.completedAt = getCurrentIsoDate();
          }
          process.updatedAt = getCurrentIsoDate();
        });
      },

      addMessageToStep: (processId, stepId, senderId, senderType, content) => {
        let newMessage: ChatMessage;
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (!process) return;

          const step = process.steps.find(s => s.id === stepId);
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
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (process) {
            process.status = status;
            process.updatedAt = getCurrentIsoDate();
            if (
              status === 'resolved' ||
              status === 'closed' ||
              status === 'cancelled'
            ) {
              process.completedAt = getCurrentIsoDate();
            }
          }
        });
      },

      updateProcessStepStatus: (processId, stepId, status) => {
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (!process) return;

          const step = process.steps.find(s => s.id === stepId);
          if (step) {
            step.status = status;
            process.updatedAt = getCurrentIsoDate();
            if (status === 'completed') {
              step.completedAt = getCurrentIsoDate();
            }
          }
        });
      },

      setProcessCurrentStep: (processId, stepId) => {
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (!process) return;

          const targetStepIndex = process.steps.findIndex(s => s.id === stepId);
          if (targetStepIndex !== -1) {
            process.currentStepIndex = targetStepIndex;
            process.updatedAt = getCurrentIsoDate();
            // Optionally, update status of steps
            process.steps.forEach((step, index) => {
              if (index < targetStepIndex && step.status !== 'completed') {
                step.status = 'completed'; // Mark previous as completed if not
                step.completedAt = step.completedAt || getCurrentIsoDate();
              } else if (index === targetStepIndex) {
                step.status = 'in_progress';
                step.startedAt = step.startedAt || getCurrentIsoDate();
              } else if (index > targetStepIndex && step.status !== 'pending') {
                step.status = 'pending'; // Mark future as pending
                step.startedAt = ''; // Use empty string instead of undefined
                step.completedAt = ''; // Use empty string instead of undefined
              }
            });
          }
        });
      },

      updateProcessStepExecution: (processId, stepId, executionId) => {
        set(state => {
          const process = state.processes.find(p => p.id === processId);
          if (!process) return;

          const step = process.steps.find(s => s.id === stepId);
          if (step) {
            step.executionId = executionId;
            step.lastExecutedAt = getCurrentIsoDate();
            process.updatedAt = getCurrentIsoDate();
          }
        });
      },
    })),
    { name: 'ProcessesStore' }
  )
);
