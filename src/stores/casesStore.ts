// src/store/useCasesStore.ts (Updated)
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  getLoadProcessSteps,
  getOilChangeProcessSteps,
} from '../processes/processDefinitions'; // Import process definitions
import { Case, CaseStatus, CaseType, ProcessStep } from '../types/app'; // Import ProcessStep

import { useProcessesStore } from './processesStore'; // Import the processes store
import { generateId, getCurrentIsoDate } from './utils';

interface CasesState {
  cases: Case[];
  selectedCaseId: string | null;
  setSelectedCase: (caseId: string | null) => void;
  createCase: (payload: {
    step: 1 | 2
    notificationId: string;
    userId: string;
    type: CaseType;
    title: string;
    description: string;
    relatedEntityId: string; // Made mandatory for process creation
  }) => Case;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  assignProcessToCase: (caseId: string, processId: string) => void; // Still useful if processes are created externally
  getCaseById: (caseId: string | null) => Case | undefined;
  getCasesByUserId: (userId: string) => Case[];
}

export const useCasesStore = create<CasesState>()(
  devtools(
    immer((set, get) => ({
      cases: [],
      selectedCaseId: null,

      setSelectedCase: caseId => {
        set(state => {
          state.selectedCaseId = caseId;
        });
      },

      createCase: ({
        step,
        notificationId,
        userId,
        type,
        title,
        description,
        relatedEntityId,
      }) => {
        const newCase: Case = {
          id: generateId(),
          notificationId,
          userId,
          type,
          status: 'open',
          title,
          description,
          createdAt: getCurrentIsoDate(),
          updatedAt: getCurrentIsoDate(),
          relatedEntityId: relatedEntityId, // Ensure this is always provided
        };

        // Determine which process steps to use based on case type
        let initialSteps: ProcessStep[] = [];
        if (type === 'load_process') {
          initialSteps = getLoadProcessSteps(step);
        } else if (type === 'oil_change') {
          initialSteps = getOilChangeProcessSteps();
        } else {
          console.warn(`No defined process steps for case type: ${type}`);
          // Handle cases with no predefined process or throw an error
          // For now, we'll proceed with an empty array, but this should be prevented.
        }

        // Create the associated process using the processes store
        const newProcess = useProcessesStore
          .getState()
          .createProcess(newCase.id, type, initialSteps, relatedEntityId);

        // Link the newly created process to the case
        newCase.processId = newProcess.id;

        set(state => {
          state.cases.push(newCase);
          state.selectedCaseId = newCase.id;
        });

        // Optionally, add a system message to the first step of the process
        if (newProcess.steps.length > 0) {
          // useProcessesStore.getState().addMessageToStep(
          //   newProcess.id,
          //   newProcess.steps[0].id,
          //   "system",
          //   "system",
          //   description,
          // );
        }

        return newCase;
      },

      updateCaseStatus: (caseId, status) => {
        set(state => {
          const caseToUpdate = state.cases.find(c => c.id === caseId);
          if (caseToUpdate) {
            caseToUpdate.status = status;
            caseToUpdate.updatedAt = getCurrentIsoDate();
            // If the case is resolved/closed/cancelled, update the associated process too
            if (caseToUpdate.processId) {
              const process = useProcessesStore
                .getState()
                .getProcessById(caseToUpdate.processId);
              if (process && process.status !== status) {
                useProcessesStore
                  .getState()
                  .updateProcessStatus(caseToUpdate.processId, status);
              }
            }
          }
        });
      },

      assignProcessToCase: (caseId, processId) => {
        // This function might become less critical if process creation is tightly coupled
        // with case creation, but could be useful for re-assigning or linking existing.
        set(state => {
          const caseToUpdate = state.cases.find(c => c.id === caseId);
          if (caseToUpdate) {
            caseToUpdate.processId = processId;
            caseToUpdate.updatedAt = getCurrentIsoDate();
          }
        });
      },

      getCaseById: caseId => {
        return get().cases.find(c => c.id === caseId);
      },

      getCasesByUserId: userId => {
        return get().cases.filter(c => c.userId === userId);
      },
    })),
    { name: 'CasesStore' }
  )
);
