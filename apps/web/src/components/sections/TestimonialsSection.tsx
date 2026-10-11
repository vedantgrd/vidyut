import React from 'react';
import { motion } from 'framer-motion';
import { scrollFadeUpVariants } from '@/animations/scrollAnimations';
import styles from './TestimonialsSection.module.css';

export const TestimonialsSection: React.FC = React.memo(() => {
  return (
    <motion.section 
      className={styles.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollFadeUpVariants}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>What students are saying</h2>
        <div className={styles.grid}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.card}>
              <p className={styles.quote}>
                "Vidyut completely changed how I apply for scholarships. The AI filled out my entire application in under 3 minutes. I didn't even have to hunt for my income certificate—it verified it automatically."
              </p>
              <div className={styles.author}>
                <div className={styles.avatar}></div>
                <div>
                  <div className={styles.name}>Priya Sharma</div>
                  <div className={styles.role}>B.Tech Computer Science</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
