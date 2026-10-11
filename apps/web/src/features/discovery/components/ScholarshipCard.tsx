import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, BookmarkPlus, BookmarkCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useDiscoveryStore } from '../store/discoveryStore';
import type { ScholarshipDetail } from '../services/discovery.service';
import styles from './ScholarshipCard.module.css';

interface ScholarshipCardProps {
  scholarship: ScholarshipDetail;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = React.memo(({ scholarship }) => {
  const toggleSave = useDiscoveryStore(state => state.toggleSave);
  const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 15;

  // Derive a short eligibility bullet list from the eligibility text
  const eligibilityPoints = scholarship.eligibilityText
    .split(/[.;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.matchBadge}>
            <Zap size={14} />
            {scholarship.matchScore}% Match
          </div>
          {isUrgent && (
            <div className={styles.urgentBadge}>
              <Clock size={14} />
              {daysLeft > 0 ? `${daysLeft} Days Left` : 'Closing soon'}
            </div>
          )}
        </div>
        <button
          className={styles.saveBtn}
          onClick={() => toggleSave(scholarship.id)}
          aria-label={scholarship.isSaved ? "Remove from saved" : "Save scholarship"}
        >
          {scholarship.isSaved ? (
            <BookmarkCheck size={20} className={styles.savedIcon} />
          ) : (
            <BookmarkPlus size={20} className={styles.unsavedIcon} />
          )}
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{scholarship.name}</h3>
        <p className={styles.provider}>{scholarship.provider}</p>

        <div className={styles.amountWrapper}>
          <span className={styles.currency}>₹</span>
          <span className={styles.amount}>{scholarship.amount.toLocaleString('en-IN')}</span>
        </div>

        <p className={styles.description}>{scholarship.shortDescription ?? scholarship.description}</p>

        <div className={styles.tags}>
          {(Array.isArray(scholarship?.tags) ? scholarship.tags : []).slice(0, 4).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.eligibilityList}>
          {eligibilityPoints.slice(0, 2).map((req, i) => (
            <span key={i} className={styles.eligibilityItem}>• {req}</span>
          ))}
          {eligibilityPoints.length > 2 && (
            <span className={styles.eligibilityMore}>+{eligibilityPoints.length - 2} more</span>
          )}
        </div>
        <Link to={`/discovery/${scholarship.slug}`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" className={styles.applyBtn}>
            View Details
            <ExternalLink size={16} />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
});

ScholarshipCard.displayName = 'ScholarshipCard';
