import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/complex/Sidebar';
import { Topbar } from '@/components/complex/Topbar';
import { CommandPalette } from '@/components/complex/CommandPalette';
import { useRouteFocus } from '@/hooks/useRouteFocus';
import styles from './DashboardLayout.module.css';

/**
 * DashboardLayout
 * The primary authenticated layout shell.
 * Coordinates the Sidebar, Topbar, and the main Content routing outlet.
 */
export const DashboardLayout: React.FC = () => {
  useRouteFocus('main-content');

  return (
    <div className={styles.layout}>
      {/* 
        The Command Palette is mounted globally within the authenticated layout
        so it can be summoned from any dashboard screen via CMD+K.
      */}
      <CommandPalette />

      <Sidebar />
      
      <div className={styles.mainWrapper}>
        <Topbar />
        
        <main 
          id="main-content"
          className={styles.content}
          tabIndex={-1}
        >
          {/* Outlet renders the matched child route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
