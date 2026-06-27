import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import styles from './Topbar.module.css';

export const Topbar: React.FC = () => {
  const { openCommandPalette } = useUIStore();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* Breadcrumbs or Context Title could go here in future */}
      </div>

      <div className={styles.center}>
        <button 
          className={styles.searchButton}
          onClick={openCommandPalette}
          aria-label="Open Command Palette"
        >
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.placeholder}>Search Vidyut...</span>
          <span className={styles.shortcut} aria-hidden="true">
            <kbd>⌘</kbd>K
          </span>
        </button>
      </div>

      <div className={styles.right}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={styles.iconButton}
          aria-label="Notifications"
        >
          <Bell size={20} aria-hidden="true" />
          {/* Notification Indicator Dot */}
          <span className={styles.notificationDot} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={styles.iconButton}
          aria-label="User Profile"
        >
          <User size={20} aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
};
