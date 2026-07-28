import { apiClient } from './api-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'RECOMMENDATION';
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  listMine: () => apiClient<Notification[]>('/notifications/mine'),

  getUnreadCount: () =>
    apiClient<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiClient<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiClient<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),

  broadcast: (data: { title: string; message: string; type: string }) =>
    apiClient<{ message: string }>('/notifications/broadcast', { method: 'POST', body: JSON.stringify(data) }),
};
