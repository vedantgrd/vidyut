import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemFadeUpVariants } from '@/animations/stagger';
import styles from './FeaturesSection.module.css';

const features = [
  {
    title: 'AI Document Verification',
    description: 'Instantly verify income certificates, caste certificates, and marksheets using computer vision.',
    icon: '✨'
  },
  {
    title: 'Smart Matching',
    description: 'Automatically discover scholarships you are eligible for based on your dynamic academic profile.',
    icon: '🎯'
  },
  {
    title: 'Direct Benefit Transfer',
    description: 'Track the flow of funds directly to your bank account with absolute transparency.',
    icon: '💸'
  }
];

export const FeaturesSection: React.FC = React.memo(() => {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.header}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainerVariants}
      >
        <motion.h2 variants={staggerItemFadeUpVariants} className={styles.title}>
          Built for the future.
        </motion.h2>
        <motion.p variants={staggerItemFadeUpVariants} className={styles.subtitle}>
          Vidyut combines cutting-edge artificial intelligence with robust public infrastructure to deliver an unparalleled experience.
        </motion.p>
      </motion.div>

      <motion.div 
        className={styles.grid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainerVariants}
      >
        {features.map((feature, idx) => (
          <motion.div key={idx} className={styles.card} variants={staggerItemFadeUpVariants}>
            <div className={styles.icon}>{feature.icon}</div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
