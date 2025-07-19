import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Truck, TruckStatus } from '../types/app';

import mockData from '../mock-data';
import { generateId } from './utils';

interface TrucksState {
  trucks: Truck[];
  addTruck: (newTruck: Truck) => Truck;
  getTruckById: (id: string) => Truck | undefined;
  updateTruck: (truckId: string, updates: Partial<Truck>) => void;
  deleteTruck: (truckId: string) => void;
  setTruckStatus: (truckId: string, status: TruckStatus) => void;
}

export const useTrucksStore = create<TrucksState>()(
  devtools(
    immer((set, get) => ({
      trucks: mockData.trucks as Truck[],

      addTruck: newTruckData => {
        const truck: Truck = {
          ...newTruckData,
          id: newTruckData.id ?? generateId(),
        };
        set(state => {
          state.trucks.push(truck);
        });
        return truck;
      },

      getTruckById: id => {
        return get().trucks.find(t => t.id === id);
      },

      updateTruck: (truckId, updates) => {
        set(state => {
          const truck = state.trucks.find(t => t.id === truckId);
          if (truck) {
            Object.assign(truck, updates);
          }
        });
      },

      deleteTruck: truckId => {
        set(state => {
          state.trucks = state.trucks.filter(t => t.id !== truckId);
        });
      },

      setTruckStatus: (truckId, status) => {
        set(state => {
          const truck = state.trucks.find(t => t.id === truckId);
          if (truck) {
            truck.status = status;
          }
        });
      },
    })),
    { name: 'TrucksStore' }
  )
);
