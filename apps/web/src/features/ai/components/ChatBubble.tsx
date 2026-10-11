import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div 
      className={`${styles.container} ${isAssistant ? styles.assistant : styles.user}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.avatar}>
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className={styles.messageBox}>
        <p className={styles.content}>{message.content}</p>
        <span className={styles.time}>
          {new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(message.timestamp))}
        </span>
      </div>
    </motion.div>
  );
});

ChatBubble.displayName = 'ChatBubble';
