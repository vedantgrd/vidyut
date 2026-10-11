import React from 'react';
import { motion } from 'framer-motion';
import { scrollFadeUpVariants } from '@/animations/scrollAnimations';
import styles from './TrustedBySection.module.css';

export const TrustedBySection: React.FC = React.memo(() => {
  return (
    <motion.section 
      className={styles.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollFadeUpVariants}
    >
      <p className={styles.label}>Trusted by leading institutions across India</p>
      <div className={styles.logoGrid}>
        {/* Placeholder for actual SVG logos */}
        <div className={styles.logoPlaceholder}>Ministry of Education</div>
        <div className={styles.logoPlaceholder}>AICTE</div>
        <div className={styles.logoPlaceholder}>UGC</div>
        <div className={styles.logoPlaceholder}>State Boards</div>
      </div>
    </motion.section>
  );
});

TrustedBySection.displayName = 'TrustedBySection';
