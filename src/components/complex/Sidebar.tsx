import React, { useState, useEffect, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import clsx from 'clsx';
import { SIDEBAR_ROUTES, BOTTOM_SIDEBAR_ROUTES } from '@/constants/routes';
import type { RouteDefinition } from '@/constants/routes';
import styles from './Sidebar.module.css';

interface NavSectionProps {
  routes: RouteDefinition[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const NavSection = memo(({ routes, isCollapsed, onNavigate }: NavSectionProps) => (
  <ul className={styles.navList}>
    {routes.map((route) => {
      const Icon = route.icon;
      return (
        <li key={route.path}>
          <NavLink
            to={route.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(styles.navItem, isActive && styles.activeItem)
            }
            title={isCollapsed ? route.label : undefined}
            aria-label={isCollapsed ? route.label : undefined}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.span 
                  className={styles.navLabel}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {route.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </li>
      );
    })}
  </ul>
));

NavSection.displayName = 'NavSection';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  const handleMobileNav = () => {
    if (isMobile) setIsCollapsed(true);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            className={styles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            role="presentation"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={styles.sidebar}
        // On mobile, collapse means 0 width. On desktop, 80px.
        animate={{ width: isCollapsed ? (isMobile ? 0 : 80) : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        aria-label="Main Navigation"
      >
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.brandMagicOrb} aria-hidden="true" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  className={styles.brandName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Vidyut
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button 
            className={styles.collapseButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
        </div>

        <nav className={styles.navigation}>
          <NavSection routes={SIDEBAR_ROUTES} isCollapsed={isCollapsed} onNavigate={handleMobileNav} />
        </nav>

        <div className={styles.footer}>
          <NavSection routes={BOTTOM_SIDEBAR_ROUTES} isCollapsed={isCollapsed} onNavigate={handleMobileNav} />
        </div>
      </motion.aside>
    </>
  );
};
