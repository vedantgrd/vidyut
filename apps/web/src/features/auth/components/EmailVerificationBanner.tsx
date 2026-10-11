import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './EmailVerificationBanner.module.css';

interface BannerProps {
  email: string;
  onDismiss: () => void;
  isVisible: boolean;
}

export const EmailVerificationBanner: React.FC<BannerProps> = ({ email, onDismiss, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.banner}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, padding: 0, margin: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          <div className={styles.content}>
            <Mail className={styles.icon} />
            <div className={styles.textContainer}>
              <h4 className={styles.title}>Please verify your email</h4>
              <p className={styles.description}>
                We've sent a verification link to <strong>{email}</strong>. 
                Please click it to unlock full platform access.
              </p>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" className={styles.resendBtn}>
              Resend email
            </Button>
            <button onClick={onDismiss} className={styles.dismissBtn} aria-label="Dismiss banner">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

EmailVerificationBanner.displayName = 'EmailVerificationBanner';
