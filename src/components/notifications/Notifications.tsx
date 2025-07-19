import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Fuel,
  MessageCircle,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCasesStore } from '@/stores/casesStore';
import { useDriversStore } from '@/stores/driversStore';
import { useLoadsStore } from '@/stores/loadsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Notification } from '@/types/app';

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const { markNotificationAsRead, markNotificationAsActioned } =
    useNotificationsStore();
  const { createCase } = useCasesStore();
  const { getLoadById } = useLoadsStore();
  const { getDriverById } = useDriversStore();

  const handleCreateCase = () => {
    // Only creates a case is notification is unread
    if (notification.status !== 'unread') return;

    // Mark notification as read first
    markNotificationAsRead(notification.id);

    // Create a case based on the notification
    const caseType =
      notification.type === 'oil_change' ? 'oil_change' : 'load_process';
    const newCase = createCase({
      notificationId: notification.id,
      userId: notification.userId,
      type: caseType,
      title: notification.title,
      description: notification.message,
      relatedEntityId: notification.relatedEntityId || '',
    });

    // Mark notification as actioned
    markNotificationAsActioned(notification.id, newCase.id);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getNotificationIcon = (className: string) => {
    switch (notification.type) {
      case 'oil_change':
        return <Fuel className={className} />;
      case 'new_load':
        return <Truck className={className} />;
      case 'load_update':
        return <CheckCircle className={className} />;
      case 'driver_alert':
        return <User className={className} />;
      case 'process_update':
        return <AlertCircle className={className} />;
      case 'system_message':
        return <MessageCircle className={className} />;
      default:
        return <AlertCircle className={className} />;
    }
  };

  const getRelatedEntityName = () => {
    if (!notification.relatedEntityId) return '';

    // Try to get related entity name based on notification type
    if (
      notification.type === 'new_load' ||
      notification.type === 'load_update'
    ) {
      const load = getLoadById(notification.relatedEntityId);
      return load
        ? `${load.pickUpLocation.city} → ${load.dropOffLocation.city}`
        : '';
    }

    if (notification.type === 'driver_alert') {
      const driver = getDriverById(notification.relatedEntityId);
      return driver ? driver.name : '';
    }

    return '';
  };

  const getNotificationTypeLabel = () => {
    switch (notification.type) {
      case 'new_load':
        return 'New Load';
      case 'load_update':
        return 'Load Status Update';
      case 'driver_alert':
        return 'Driver Alert';
      case 'emergency_alert':
        return 'Emergency Alert';
      case 'process_update':
        return 'Process Update';
      case 'system_message':
        return 'System Message';
      default:
        return 'Notification';
    }
  };

  const entityName = getRelatedEntityName();

  return (
    <div
      onClick={handleCreateCase}
      className={cn(
        'flex items-center gap-3 py-4 px-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 border-x-4 border-x-transparent last:border-b-0',
        'animate-in slide-in-from-bottom-2 duration-300',
        notification.status === 'unread'
          ? 'border-l-green-accent bg-green-accent/50'
          : ''
      )}
    >
      <div className='flex-shrink-0 text-absolute-gray-400 p-2 rounded-lg border border-absolute-gray-200'>
        {getNotificationIcon('w-6 h-6')}
      </div>

      <div className='flex flex-col items-start gap-1 flex-1'>
        <div className='text-xs text-absolute-gray-400'>
          {getNotificationTypeLabel()}
        </div>
        <div className='text-start text-sm font-medium text-gray-900'>
          {entityName || notification.title}
        </div>
      </div>

      <div className='flex-shrink-0 text-xs text-absolute-gray-400 self-end'>
        {formatTimestamp(notification.timestamp)}
      </div>
    </div>
  );
}

function Notifications() {
  const { notifications, getUnreadNotifications } = useNotificationsStore();
  const [sortBy, setSortBy] = useState('all');

  const currentUserId = '1';
  const userNotifications = notifications.filter(
    n => n.userId === currentUserId
  );
  const unreadCount = getUnreadNotifications(currentUserId).length;

  const sortedNotifications = userNotifications.sort((a, b) => {
    // Unread notifications come before read notifications
    if (a.status === 'unread' && b.status !== 'unread') {
      return -1;
    }
    if (a.status !== 'unread' && b.status === 'unread') {
      return 1;
    }

    // If status is the same, sort by timestamp
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <>
      <CardHeader className='p-4 border-b border-gray-100'>
        <h3 className='text-lg font-medium text-gray-900'>Notifications</h3>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-600'>Sort by</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-20 h-7 text-xs border-0 bg-transparent p-0 focus:ring-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All ({notifications.length})</SelectItem>
              <SelectItem value='unread'>Unread ({unreadCount})</SelectItem>
              <SelectItem value='read'>
                Read ({notifications.length - unreadCount})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='p-0 flex-1 overflow-y-auto'>
        {sortedNotifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <AlertTriangle className='w-12 h-12 text-gray-300' />
            <h4 className='text-lg font-medium text-gray-900'>
              No notifications
            </h4>
            <p className='text-gray-500'>You&apos;re all caught up!</p>
          </div>
        ) : (
          <>
            {sortedNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </>
        )}
      </CardContent>
    </>
  );
}

export default Notifications;
