import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageFadeUpVariants } from '@/animations/pageTransitions';
import { Button } from '@/components/ui/Button';
import styles from '@/App.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <motion.div 
      className={styles.notFoundPage}
      variants={pageFadeUpVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h2 className="text-display">404 - Not Found</h2>
      <p className={styles.placeholderSubtitle}>
        The requested route does not exist in the Vidyut application.
      </p>
      <div className={styles.actionContainer}>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
