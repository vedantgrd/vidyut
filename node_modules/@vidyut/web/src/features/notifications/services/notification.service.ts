import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface NotificationPayload {
  id: string
  userId: string
  type: 'SYSTEM' | 'APPLICATION_UPDATE' | 'DEADLINE_REMINDER' | 'DOCUMENT_VERIFIED' | 'NEW_MATCH'
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export const notificationService = {
  async fetchNotifications(): Promise<NotificationPayload[]> {
    const res = await ApiClient.get<{ notifications: NotificationPayload[] }>(ENDPOINTS.NOTIFICATIONS.ALL)
    return res.notifications
  },

  async getUnreadCount(): Promise<number> {
    const res = await ApiClient.get<{ count: number }>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)
    return res.count
  },

  async markAsRead(id: string): Promise<void> {
    await ApiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  async markAllAsRead(): Promise<void> {
    await ApiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },
}
