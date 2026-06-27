import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideInRightVariants } from '@/animations/pageTransitions';
import styles from './AuthLayout.module.css';

/**
 * AuthLayout
 * Used for Login, Signup, and Password Recovery pages.
 * Features a split-screen design with a branding area and a centered form area.
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.brandPanel}>
        {/* Separated decorative background layer for future R3F/GSAP animations */}
        <div className={styles.brandBackgroundLayer} aria-hidden="true" />
        
        <div className={styles.brandContent}>
          {/* Distinct wrapper for Orb to allow independent floating physics */}
          <div className={styles.brandOrbWrapper}>
            <div className={styles.brandMagicOrb} aria-hidden="true" />
          </div>
          
          {/* Typography grouped together for sequential staggering */}
          <div className={styles.brandTypography}>
            <h1 className={styles.brandName}>Vidyut</h1>
            <p className={styles.brandTagline}>The AI-first student success platform.</p>
          </div>
        </div>
      </div>
      
      <div className={styles.formPanel}>
        <motion.div
          className={styles.formContainer}
          variants={slideInRightVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
