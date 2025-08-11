import {
  Driver,
  EntityType,
  Load,
  NotificationType,
  Truck,
} from '../types/app';

interface BaseNotificationDefinition {
  step: 1 | 2,
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: EntityType;
}

export interface GenericNotificationDefinition
  extends BaseNotificationDefinition {
  step: 1 | 2,
  type: NotificationType; // Use the actual NotificationType from your types
  title: string;
  message: string;
  relatedEntityType?: EntityType;
}

export interface NewLoadProcessNotificationDefinition
  extends BaseNotificationDefinition {
  step: 1 | 2,
  type: 'new_load';
  title: string;
  message: string;
  relatedEntityType: 'driver';
  driverId: string;
}

export interface OilChangeNotificationDefinition
  extends BaseNotificationDefinition {
  step: 1 | 2,
  type: 'oil_change';
  title: string;
  message: string;
  relatedEntityType: 'driver';
  driverId: string;
}

export type NotificationDefinition =
  | GenericNotificationDefinition
  | NewLoadProcessNotificationDefinition
  | OilChangeNotificationDefinition;

export const NotificationDefinitions = {
  createGeneric: (
    step: 1 | 2,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityType?: EntityType
  ): GenericNotificationDefinition => {
    const notification: GenericNotificationDefinition = {
      step,
      type,
      title,
      message,
    };
    if (relatedEntityType !== undefined) {
      notification.relatedEntityType = relatedEntityType;
    }
    return notification;
  },

  createNewLoadProcess: ({
    driver,
    truck
  }: {
    driver: Driver;
    truck: Truck;
    load: Load;
  }): NewLoadProcessNotificationDefinition => {
    return {
      step: 1,
      type: 'new_load',
      title: `New Load for Driver ${driver.name}`,
      message: `Case for booking load for Driver ${driver.name} (${driver.id}) with Truck (${truck.id})`,
      relatedEntityType: 'driver',
      driverId: driver.id,
    };
  },

  createStep2NewLoadProcess: ({
    driver,
  }: {
    driver: Driver;
    truck: Truck;
    load: Load;
  }): NewLoadProcessNotificationDefinition => {
    return {
      step: 2,
      type: 'new_load',
      title: `New Load for Driver ${driver.name}`,
      message: `Case for booking load for Driver ${driver.name} (${driver.id})`,
      relatedEntityType: 'driver',
      driverId: driver.id,
    };
  },

  creatOilChangeNotification: ({
    driver,
    truck,
  }: {
    driver: Driver;
    truck: Truck;
  }): OilChangeNotificationDefinition => ({
    step: 1,
    type: 'oil_change',
    title: `Oil change required for Truck (${truck.id})`,
    message: `Truck (${truck.id}) currently with ${driver.name} ${driver.id} is about to reach 15.000 miles since its last oil change.`,
    relatedEntityType: 'driver',
    driverId: driver.id,
  }),
};

export const NotificationTemplates = {
  DRIVER_HOURS_WARNING: (driverName: string, remainingHours: number) =>
    NotificationDefinitions.createGeneric(
      1,
      'driver_hours_warning' as NotificationType, // Replace with actual type
      'Driver Hours Warning',
      `${driverName} has ${remainingHours} driving hours remaining`,
      'driver'
    ),
};
