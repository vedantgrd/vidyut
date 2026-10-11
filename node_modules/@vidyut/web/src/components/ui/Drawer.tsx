import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { GlassCard } from './GlassCard.js';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Slide Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              className={clsx('w-screen max-w-md h-full focus:outline-none', className)}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <GlassCard
                variant="solid"
                padding="none"
                className="h-full rounded-none border-l border-[var(--border-strong)] bg-[var(--surface-2)] flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] shrink-0">
                  {title ? (
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {title}
                    </h3>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {children}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
