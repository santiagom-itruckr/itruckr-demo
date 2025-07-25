// Updated store with fixes and support for notification definitions
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { NotificationDefinition } from '../notifications/notificationDefinitions';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../types/app';

import mockData from '../mock-data';
import { generateId, getCurrentIsoDate } from './utils';

interface NotificationsState {
  notifications: Notification[];

  // Original method - still works for manual notification creation
  addNotification: (payload: {
    step: 1 | 2;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    status?: NotificationStatus;
    relatedEntityType?: string;
    relatedEntityId: string;
  }) => Notification;

  // New method - creates notification from definition
  addNotificationFromDefinition: (
    userId: string,
    definition: NotificationDefinition,
    relatedEntityId: string,
    step: 1 | 2,
    status?: NotificationStatus
  ) => Notification;

  markNotificationAsRead: (notificationId: string) => void;
  markNotificationAsActioned: (notificationId: string, caseId: string) => void;
  archiveNotification: (notificationId: string) => void;
  getUnreadNotifications: (userId: string) => Notification[];
  getNotificationById: (notificationId: string) => Notification | undefined;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    immer((set, get) => ({
      notifications: mockData.notifications as Notification[],

      addNotification: ({
        userId,
        step,
        type,
        title,
        message,
        status,
        relatedEntityType,
        relatedEntityId,
      }) => {
        const newNotification: Notification = {
          id: generateId(),
          step,
          userId,
          type,
          title,
          message,
          timestamp: getCurrentIsoDate(),
          status: status || 'unread',
          relatedEntityType:
            relatedEntityType as Notification['relatedEntityType'],
          relatedEntityId,
        };
        set(state => {
          state.notifications.push(newNotification);
        });
        return newNotification;
      },

      addNotificationFromDefinition: (
        userId,
        definition,
        relatedEntityId,
        step,
        status
      ) => {
        const newNotification: Notification = {
          id: generateId(),
          userId,
          step,
          type: definition.type,
          title: definition.title,
          message: definition.message,
          timestamp: getCurrentIsoDate(),
          status: status || 'unread',
          relatedEntityType: definition.relatedEntityType,
          relatedEntityId,
        };
        set(state => {
          state.notifications.push(newNotification);
        });
        return newNotification;
      },

      markNotificationAsRead: notificationId => {
        set(state => {
          const notification = state.notifications.find(
            n => n.id === notificationId
          );
          if (notification) {
            notification.status = 'read';
          }
        });
      },

      markNotificationAsActioned: (notificationId, caseId) => {
        set(state => {
          const notification = state.notifications.find(
            n => n.id === notificationId
          );
          if (notification) {
            notification.status = 'actioned';
            notification.caseId = caseId;
          }
        });
      },

      archiveNotification: notificationId => {
        set(state => {
          const notification = state.notifications.find(
            n => n.id === notificationId
          );
          if (notification) {
            notification.status = 'archived';
          }
        });
      },

      getUnreadNotifications: userId => {
        return get().notifications.filter(
          n => n.userId === userId && n.status === 'unread'
        );
      },

      getNotificationById: notificationId => {
        return get().notifications.find(n => n.id === notificationId);
      },
    })),
    { name: 'NotificationsStore' }
  )
);
