import { api } from '../lib/api';

export interface AppNotification {
  _id: string;
  kind: 'order' | 'payment' | 'savings' | 'return' | 'general';
  title: string;
  body: string;
  /** Storefront path to open on tap, e.g. `/order/123`. */
  route: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  notifications: AppNotification[];
  unreadCount: number;
}

export const notificationService = {
  /** Newest 50 notifications for the signed-in user. */
  list: async (): Promise<NotificationList> => {
    return api.get<NotificationList>('/users/me/notifications');
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/users/me/notifications/${encodeURIComponent(id)}/read`, {});
  },

  markAllRead: async (): Promise<void> => {
    await api.post('/users/me/notifications/read-all', {});
  },
};
