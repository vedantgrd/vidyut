import type { UserSettings } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_SETTINGS: UserSettings = {
  emailNotifications: true,
  pushNotifications: false,
  marketingEmails: false,
  darkMode: true,
  twoFactorAuth: false,
  language: 'en'
};

export const settingsService = {
  async fetchSettings(): Promise<UserSettings> {
    await delay(500);
    return MOCK_SETTINGS;
  },

  async updateSetting(_key: keyof UserSettings, _value: any): Promise<boolean> {
    await delay(300);
    return true;
  }
};
