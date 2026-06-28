import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { ToggleSwitch } from '@/features/settings/components/ToggleSwitch';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from '@/features/settings/components/Settings.module.css';

const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, fetchSettings, toggleSetting } = useSettingsStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading || !settings) {
    return (
      <div>
        <DashboardHeader title="Settings" subtitle="Manage your account preferences." />
        <SkeletonCard height={300} />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        title="Settings"
        subtitle="Manage your account preferences."
      />

      <DashboardSection style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && (
          <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {error}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notifications</h3>
          <ToggleSwitch 
            label="Email Notifications" 
            description="Receive daily summaries of new matching scholarships."
            checked={settings.emailNotifications}
            onChange={() => toggleSetting('emailNotifications')}
          />
          <ToggleSwitch 
            label="Push Notifications" 
            description="Get instant alerts for upcoming deadlines and messages."
            checked={settings.pushNotifications}
            onChange={() => toggleSetting('pushNotifications')}
          />
          <ToggleSwitch 
            label="Marketing Emails" 
            description="Receive promotional offers and news from Vidyut."
            checked={settings.marketingEmails}
            onChange={() => toggleSetting('marketingEmails')}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Appearance & Security</h3>
          <ToggleSwitch 
            label="Dark Mode" 
            description="Switch between light and dark themes."
            checked={settings.darkMode}
            onChange={() => toggleSetting('darkMode')}
          />
          <ToggleSwitch 
            label="Two-Factor Authentication" 
            description="Add an extra layer of security to your account."
            checked={settings.twoFactorAuth}
            onChange={() => toggleSetting('twoFactorAuth')}
          />
        </div>

        <div className={styles.dangerZone}>
          <div className={styles.dangerInfo}>
            <h4 className={styles.dangerTitle}>Log out of all devices</h4>
            <span className={styles.dangerDesc}>You will be logged out of your current session.</span>
          </div>
          <Button variant="secondary" onClick={() => logout()} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <LogOut size={16} />
            Log Out
          </Button>
        </div>
      </DashboardSection>
    </div>
  );
};

export default SettingsPage;
