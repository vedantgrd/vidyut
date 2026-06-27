import React from 'react';
import styles from './FooterSection.module.css';

export const FooterSection: React.FC = React.memo(() => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <h3 className={styles.brandName}>Vidyut</h3>
          <p className={styles.brandDesc}>
            The AI-first student success platform powering the next generation of India's scholars.
          </p>
        </div>
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Platform</h4>
          <ul className={styles.linkList}>
            <li><a href="#features">Features</a></li>
            <li><a href="#scholarships">Scholarships</a></li>
            <li><a href="#ai">AI Engine</a></li>
          </ul>
        </div>
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#docs">Documentation</a></li>
            <li><a href="#contact">Contact Support</a></li>
          </ul>
        </div>
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Legal</h4>
          <ul className={styles.linkList}>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} Vidyut Platform. All rights reserved.</p>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';
