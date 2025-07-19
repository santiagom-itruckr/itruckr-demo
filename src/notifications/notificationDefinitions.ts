import {
  NotificationType,
  EntityType,
  Driver,
  Truck,
  Load,
} from '../types/app';

interface BaseNotificationDefinition {
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: EntityType;
}

export interface GenericNotificationDefinition
  extends BaseNotificationDefinition {
  type: NotificationType; // Use the actual NotificationType from your types
  title: string;
  message: string;
  relatedEntityType?: EntityType;
}

export interface NewLoadProcessNotificationDefinition
  extends BaseNotificationDefinition {
  type: 'new_load';
  title: string;
  message: string;
  relatedEntityType: 'driver';
  driverId: string;
}

export interface OilChangeNotificationDefinition
  extends BaseNotificationDefinition {
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
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityType?: EntityType
  ): GenericNotificationDefinition => ({
    type,
    title,
    message,
    relatedEntityType,
  }),

  createNewLoadProcess: ({
    driver,
  }: {
    driver: Driver;
    truck: Truck;
    load: Load;
  }): NewLoadProcessNotificationDefinition => {
    return {
      type: 'new_load',
      title: `New Load for Driver ${driver.name} (${driver.id})`,
      message: 'Driver ',
      relatedEntityType: 'driver',
      driverId: '',
    };
  },

  creatOilChangeNotification: ({
    driver,
    truck,
  }: {
    driver: Driver;
    truck: Truck;
  }): OilChangeNotificationDefinition => ({
    type: 'oil_change',
    title: `Oil change required for Truck (${truck.id})`,
    message: `Truck (${truck.id}) currently with ${driver.name} ${driver.id} is about to reach 15.000 km since its last oil change.`,
    relatedEntityType: 'driver',
    driverId: driver.id,
  }),
};

export const NotificationTemplates = {
  DRIVER_HOURS_WARNING: (driverName: string, remainingHours: number) =>
    NotificationDefinitions.createGeneric(
      'driver_hours_warning' as NotificationType, // Replace with actual type
      'Driver Hours Warning',
      `${driverName} has ${remainingHours} driving hours remaining`,
      'driver'
    ),
};
