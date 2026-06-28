export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
  language: 'en' | 'hi' | 'mr';
}
