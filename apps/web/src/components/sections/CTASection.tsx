import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { scrollFadeUpVariants } from '@/animations/scrollAnimations';
import styles from './CTASection.module.css';

export const CTASection: React.FC = React.memo(() => {
  return (
    <motion.section 
      className={styles.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollFadeUpVariants}
    >
      <div className={styles.container}>
        <div className={styles.glow} />
        <h2 className={styles.title}>Ready to secure your future?</h2>
        <p className={styles.subtitle}>
          Join thousands of students who have already claimed their scholarships through Vidyut.
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/signup">
            <Button variant="primary" size="lg">Create Free Account</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
});

CTASection.displayName = 'CTASection';
