import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { ALL_ROUTES } from '@/constants/routes';
import type { RouteDefinition } from '@/constants/routes';
import { useUIStore } from '@/store/uiStore';
import styles from './CommandPalette.module.css';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen: isOpen, closeCommandPalette, toggleCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleCommandPalette]);

  // Handle focus trap and escape
  useEffect(() => {
    const handleDialogKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        closeCommandPalette();
      }

      // Simple focus trap: prevent Tab from leaving the dialog
      if (e.key === 'Tab') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => document.removeEventListener('keydown', handleDialogKeyDown);
  }, [isOpen, closeCommandPalette]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Small delay to ensure render before focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter routes based on query
  const filteredRoutes = query
    ? ALL_ROUTES.filter((route) =>
        route.label.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ROUTES;

  const handleSelectRoute = useCallback((route: RouteDefinition) => {
    navigate(route.path);
    closeCommandPalette();
  }, [navigate, closeCommandPalette]);

  // Handle navigation within palette
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredRoutes.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === 'Enter' && filteredRoutes.length > 0) {
      e.preventDefault();
      handleSelectRoute(filteredRoutes[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeCommandPalette}
          role="presentation"
        >
          <motion.div
            ref={containerRef}
            className={styles.palette}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            <div className={styles.inputContainer}>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Where to? Try 'Discovery' or 'Vault'..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0); // Reset index on search
                }}
                onKeyDown={handleListKeyDown}
                aria-autocomplete="list"
                aria-controls="command-palette-results"
                aria-activedescendant={
                  filteredRoutes.length > 0
                    ? `command-item-${activeIndex}`
                    : undefined
                }
              />
              <span className={styles.escHint} aria-hidden="true">ESC</span>
            </div>

            <ul 
              className={styles.resultsList} 
              id="command-palette-results"
              role="listbox"
            >
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route, index) => {
                  const Icon = route.icon;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={route.path}
                      id={`command-item-${index}`}
                      role="option"
                      aria-selected={isActive}
                      className={clsx(styles.resultItem, isActive && styles.activeItem)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelectRoute(route)}
                    >
                      <Icon className={styles.resultIcon} aria-hidden="true" />
                      <span>{route.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="command-palette-active-bg"
                          className={styles.activeBackground}
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                    </li>
                  );
                })
              ) : (
                <li className={styles.noResults} role="status">No results found.</li>
              )}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
