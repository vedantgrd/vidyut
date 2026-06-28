import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-md)', maxWidth: '85%' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(192, 132, 252, 0.15))',
        color: 'var(--brand-magic-start)', border: '1px solid rgba(99, 102, 241, 0.3)', flexShrink: 0
      }}>
        <Bot size={20} />
      </div>
      <div style={{
        background: 'var(--surface-1)', padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-lg)',
        borderTopLeftRadius: 0, border: '1px solid var(--border-subtle)', display: 'flex', gap: 4, alignItems: 'center', height: 44
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
};

TypingIndicator.displayName = 'TypingIndicator';
