import React from 'react';
import { motion } from 'framer-motion';
import { scrollFadeUpVariants } from '@/animations/scrollAnimations';
import styles from './AIShowcaseSection.module.css';

export const AIShowcaseSection: React.FC = React.memo(() => {
  return (
    <motion.section 
      className={styles.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollFadeUpVariants}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Meet your personal AI advisor.</h2>
          <p className={styles.description}>
            Navigating scholarships can be confusing. Our AI understands your profile in plain English and automatically drafts complex applications on your behalf, so you can focus on studying.
          </p>
        </div>
        <div className={styles.visual}>
          {/* Placeholder for future GSAP flowing light form fill animation */}
          <div className={styles.mockTerminal}>
            <p className={styles.codeLine}>Scanning academic profile...</p>
            <p className={styles.codeLine}>Found 12 matching scholarships.</p>
            <p className={styles.codeLine}>Auto-filling National Merit Form...</p>
            <p className={styles.codeLineSuccess}>Ready for submission.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

AIShowcaseSection.displayName = 'AIShowcaseSection';
