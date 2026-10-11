import { create } from 'zustand'
import { settingsService, type UserSettings } from '../services/settings.service'

interface SettingsState {
  settings: UserSettings | null
  isLoading: boolean
  isSaving: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (data: Partial<UserSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await settingsService.fetchSettings()
      set({ settings, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  updateSettings: async (data) => {
    set({ isSaving: true })
    try {
      const settings = await settingsService.updateSettings(data)
      set({ settings, isSaving: false })
    } catch (err: any) {
      set({ isSaving: false })
      throw err
    }
  },
}))
