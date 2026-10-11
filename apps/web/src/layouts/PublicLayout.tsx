import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRouteFocus } from '@/hooks/useRouteFocus';
import styles from './PublicLayout.module.css';

/**
 * PublicLayout
 * Used for non-authenticated pages like the Landing Page, About, or Contact.
 * Provides a clean slate without sidebars, but includes a standard navigation topbar.
 */
export const PublicLayout: React.FC = () => {
  useRouteFocus('main-content');

  return (
    <div className={styles.layout}>
      {/* Accessibility: Skip to main content link for keyboard navigation */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <header className={styles.header}>
        {/* Public Topbar logic will be implemented in Milestone 6 */}
      </header>

      <motion.main
        id="main-content"
        className={styles.main}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        tabIndex={-1} // Allow programmatic focus after skip-link navigation
      >
        <Outlet />
      </motion.main>

      <footer className={styles.footer}>
        {/* Public Footer logic will be implemented in Milestone 6 */}
      </footer>
    </div>
  );
};
