import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface UserSettings {
  id: string
  userId: string
  emailDeadlineReminders: boolean
  emailApplicationUpdates: boolean
  emailNewMatches: boolean
  pushNotifications: boolean
  theme: string
  language: string
  dateFormat: string
}

export const settingsService = {
  async fetchSettings(): Promise<UserSettings> {
    const res = await ApiClient.get<{ settings: UserSettings }>(ENDPOINTS.SETTINGS.GET)
    return res.settings
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const res = await ApiClient.patch<{ settings: UserSettings }>(ENDPOINTS.SETTINGS.UPDATE, data)
    return res.settings
  },
}
