import React from 'react';
import { motion } from 'framer-motion';
import { scrollFadeUpVariants } from '@/animations/scrollAnimations';
import styles from './FeaturedScholarshipsSection.module.css';

export const FeaturedScholarshipsSection: React.FC = React.memo(() => {
  return (
    <motion.section 
      className={styles.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollFadeUpVariants}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>High-value opportunities</h2>
        <p className={styles.subtitle}>Discover top scholarships updated in real-time.</p>
      </div>
      
      <div className={styles.grid}>
        {/* Placeholder cards, normally tilted via useMotionValue */}
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.tag}>National</span>
              <span className={styles.amount}>₹1,50,000</span>
            </div>
            <h3 className={styles.cardTitle}>Excellence in STEM Scholarship</h3>
            <p className={styles.cardDesc}>For top-performing students in engineering and mathematics.</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
});

FeaturedScholarshipsSection.displayName = 'FeaturedScholarshipsSection';
