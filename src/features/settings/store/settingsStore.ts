import { create } from 'zustand';
import { settingsService } from '../services/settings.service';
import type { UserSettings } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  toggleSetting: (key: keyof UserSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await settingsService.fetchSettings();
      set({ settings: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch settings' });
    }
  },

  toggleSetting: async (key: keyof UserSettings) => {
    const prev = get().settings;
    if (!prev) return;
    
    const newValue = !prev[key];
    
    // Optimistic update
    set({ settings: { ...prev, [key]: newValue } });
    
    try {
      await settingsService.updateSetting(key, newValue);
    } catch (error) {
      // Rollback
      set({ settings: prev });
    }
  }
}));
