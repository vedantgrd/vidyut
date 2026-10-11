import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { staggerContainerVariants, staggerItemFadeUpVariants } from '@/animations/stagger';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = React.memo(() => {
  const { scrollY } = useScroll();
  
  // Parallax effects tied natively to browser scroll (no Lenis hijacking required)
  const yParallax = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacityFade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className={styles.heroSection} aria-label="Welcome to Vidyut">
      <motion.div 
        className={styles.contentWrapper}
        style={{ y: yParallax, opacity: opacityFade }}
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItemFadeUpVariants} className={styles.badge}>
          Introducing Vidyut 2.0
        </motion.div>
        
        <motion.h1 variants={staggerItemFadeUpVariants} className={styles.title}>
          The AI-first student <br />
          <span className={styles.highlight}>success platform.</span>
        </motion.h1>
        
        <motion.p variants={staggerItemFadeUpVariants} className={styles.subtitle}>
          Vidyut intelligently connects students with scholarships, automates document verification, and eliminates bureaucratic friction using advanced AI.
        </motion.p>
        
        <motion.div variants={staggerItemFadeUpVariants} className={styles.ctaGroup}>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Start Application
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="lg">
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
