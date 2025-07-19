import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Load } from '../types/app';

import mockData from '../mock-data';
import { generateId, getCurrentIsoDate } from './utils';

interface LoadsState {
  loads: Load[];
  addLoad: (newLoad: Omit<Load, 'id' | 'createdDate' | 'updatedDate'>) => Load;
  getLoadById: (id: string) => Load | undefined;
  updateLoad: (loadId: string, updates: Partial<Load>) => void;
  deleteLoad: (loadId: string) => void;
  assignDriverToLoad: (loadId: string, driverId: string) => void;
  getLoadsByDriver: (driverId: string) => Load[];
}

export const useLoadsStore = create<LoadsState>()(
  devtools(
    immer((set, get) => ({
      loads: mockData.deliveredLoads as Load[],

      addLoad: newLoadData => {
        const load: Load = {
          ...newLoadData,
          id: generateId(),
          createdDate: getCurrentIsoDate(),
          updatedDate: getCurrentIsoDate(),
        };
        set(state => {
          state.loads.push(load);
        });
        return load;
      },

      getLoadById: id => {
        return get().loads.find(l => l.id === id);
      },

      updateLoad: (loadId, updates) => {
        set(state => {
          const load = state.loads.find(l => l.id === loadId);
          if (load) {
            Object.assign(load, updates);
            load.updatedDate = getCurrentIsoDate();
          }
        });
      },

      deleteLoad: loadId => {
        set(state => {
          state.loads = state.loads.filter(l => l.id !== loadId);
        });
      },

      assignDriverToLoad: (loadId, driverId) => {
        set(state => {
          const load = state.loads.find(l => l.id === loadId);
          if (load) {
            load.driverId = driverId;
            load.updatedDate = getCurrentIsoDate();
          }
        });
      },

      getLoadsByDriver: driverId => {
        return get().loads.filter(l => l.driverId === driverId);
      },
    })),
    { name: 'LoadsStore' }
  )
);
