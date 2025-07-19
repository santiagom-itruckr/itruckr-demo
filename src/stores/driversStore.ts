import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Driver, DriverStatus } from '../types/app';

import { generateId } from './utils'; // Assuming utils.ts exists

interface DriversState {
  drivers: Driver[];
  addDriver: (newDriver: Omit<Driver, 'joinDate'>) => Driver;
  getDriverById: (id: string) => Driver | undefined;
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  deleteDriver: (driverId: string) => void;
  setDriverStatus: (driverId: string, status: DriverStatus) => void;
  getDriversByCompany: (companyId: string) => Driver[];
  getDriverByTruckId: (truckId: string) => Driver | undefined;
}

export const useDriversStore = create<DriversState>()(
  devtools(
    immer((set, get) => ({
      drivers: [],

      addDriver: newDriverData => {
        const driver: Driver = {
          ...newDriverData,
          id: newDriverData.id ?? generateId(),
          joinDate: new Date().toISOString(),
        };
        set(state => {
          state.drivers.push(driver);
        });
        return driver;
      },

      getDriverById: id => {
        return get().drivers.find(d => d.id === id);
      },

      updateDriver: (driverId, updates) => {
        set(state => {
          const driver = state.drivers.find(d => d.id === driverId);
          if (driver) {
            Object.assign(driver, updates);
            // Optionally update a 'lastUpdated' timestamp here
          }
        });
      },

      deleteDriver: driverId => {
        set(state => {
          state.drivers = state.drivers.filter(d => d.id !== driverId);
        });
      },

      setDriverStatus: (driverId, status) => {
        set(state => {
          const driver = state.drivers.find(d => d.id === driverId);
          if (driver) {
            driver.status = status;
          }
        });
      },

      getDriversByCompany: companyId => {
        return get().drivers.filter(d => d.companyId === companyId);
      },

      getDriverByTruckId: truckId => {
        return get().drivers.find(d => d.truckId === truckId);
      },
    })),
    { name: 'DriversStore' }
  )
);
