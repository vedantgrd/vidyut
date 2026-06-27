import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard: React.FC<{ height?: number | string; className?: string }> = ({ 
  height = 200,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      style={{
        height,
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        position: 'relative'
      }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', repeatType: 'reverse' }}
      aria-hidden="true"
    />
  );
};

SkeletonCard.displayName = 'SkeletonCard';
