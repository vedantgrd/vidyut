import React from 'react';
import { motion } from 'framer-motion';
import type { AIPrompt } from '../types';
import { Sparkles } from 'lucide-react';

interface PromptSuggestionChipProps {
  prompt: AIPrompt;
  onClick: (promptText: string) => void;
}

export const PromptSuggestionChip: React.FC<PromptSuggestionChipProps> = React.memo(({ prompt, onClick }) => {
  return (
    <motion.button
      onClick={() => onClick(prompt.prompt)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)',
        padding: 'var(--space-sm) var(--space-lg)',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-primary)',
        transition: 'border-color var(--duration-fast) ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-magic-start)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <Sparkles size={14} style={{ color: 'var(--brand-magic-start)' }} />
      {prompt.title}
    </motion.button>
  );
});

PromptSuggestionChip.displayName = 'PromptSuggestionChip';
