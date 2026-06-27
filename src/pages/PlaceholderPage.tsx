import React from 'react';
import { motion } from 'framer-motion';
import { pageFadeUpVariants } from '@/animations/pageTransitions';
import styles from '@/App.module.css'; // Reusing global app styles for layout placeholders

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <motion.div 
      className={styles.placeholderPage}
      variants={pageFadeUpVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-display">{title}</h1>
      <p className={styles.placeholderSubtitle}>
        This screen is under construction. Navigate using the Sidebar or press <kbd>⌘</kbd> + <kbd>K</kbd> to open the Command Palette.
      </p>
    </motion.div>
  );
};

export default PlaceholderPage;
