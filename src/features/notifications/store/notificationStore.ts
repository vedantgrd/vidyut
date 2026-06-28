import { create } from 'zustand';
import { notificationService } from '../services/notification.service';
import type { NotificationPayload } from '../types';

interface NotificationState {
  notifications: NotificationPayload[];
  isLoading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.fetchNotifications();
      set({ notifications: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch notifications' });
    }
  },

  markAsRead: async (id: string) => {
    const prev = get().notifications;
    set({ notifications: prev.map(n => n.id === id ? { ...n, isRead: true } : n) });
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      set({ notifications: prev });
    }
  },

  markAllAsRead: async () => {
    const prev = get().notifications;
    set({ notifications: prev.map(n => ({ ...n, isRead: true })) });
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      set({ notifications: prev });
    }
  }
}));
