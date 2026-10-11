import { create } from 'zustand'
import { notificationService, type NotificationPayload } from '../services/notification.service'

interface NotificationState {
  notifications: NotificationPayload[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const notifications = await notificationService.fetchNotifications()
      const unreadCount = notifications.filter((n) => !n.isRead).length
      set({ notifications, unreadCount, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount()
      set({ unreadCount: count })
    } catch {
      // non-critical
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
    try {
      await notificationService.markAsRead(id)
    } catch { /* rollback not critical */ }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    try {
      await notificationService.markAllAsRead()
    } catch { /* non-critical */ }
  },
}))
