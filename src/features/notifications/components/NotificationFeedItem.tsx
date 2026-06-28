import React from 'react';
import { motion } from 'framer-motion';
import { Bell, FileText, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { NotificationPayload } from '../types';
import styles from './Notifications.module.css';

interface NotificationFeedItemProps {
  notification: NotificationPayload;
  onRead: (id: string) => void;
}

const getIcon = (type: NotificationPayload['type']) => {
  switch (type) {
    case 'application': return <FileText size={20} />;
    case 'deadline': return <Clock size={20} />;
    case 'document': return <CheckCircle size={20} />;
    default: return <Bell size={20} />;
  }
};

export const NotificationFeedItem: React.FC<NotificationFeedItemProps> = React.memo(({ notification, onRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <motion.button 
      className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.iconWrapper} data-type={notification.type}>
        {getIcon(notification.type)}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{notification.title}</h4>
          <span className={styles.time}>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
        </div>
        <p className={styles.message}>{notification.message}</p>
      </div>
      {!notification.isRead && <div className={styles.unreadDot} />}
    </motion.button>
  );
});

NotificationFeedItem.displayName = 'NotificationFeedItem';
