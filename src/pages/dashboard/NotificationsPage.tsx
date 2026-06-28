import React, { useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { NotificationFeedItem } from '@/features/notifications/components/NotificationFeedItem';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { Button } from '@/components/ui/Button';

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, error, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <DashboardHeader 
        title="Notifications"
        subtitle={`You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.`}
        actions={
          <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle2 size={16} />
            Mark all as read
          </Button>
        }
      />

      <DashboardSection style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && (
          <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState 
            icon={Bell}
            title="All caught up!"
            description="You don't have any new notifications right now."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {notifications.map(notif => (
              <NotificationFeedItem 
                key={notif.id} 
                notification={notif} 
                onRead={markAsRead} 
              />
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

export default NotificationsPage;
