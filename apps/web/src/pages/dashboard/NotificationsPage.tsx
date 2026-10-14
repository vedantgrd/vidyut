import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Notification } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Empty } from '@/components/ui/Empty'
import { useNotificationStore } from '@/store/notificationStore'

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TC: Record<string, string> = {
  SYSTEM: 'var(--primary)',
  APPLICATION_SUBMITTED: 'var(--success)',
  APPLICATION_STATUS_CHANGED: 'var(--primary)',
  DOCUMENT_VERIFIED: 'var(--success)',
  DOCUMENT_REJECTED: 'var(--error)',
  DEADLINE_REMINDER: 'var(--warning)',
  NEW_ELIGIBLE_SCHOLARSHIP: 'var(--primary)',
  ANNOUNCEMENT: 'var(--text-secondary)'
}

export function NotificationsPage() {
  const { data, isLoading, refetch } = useApi(() => api.get<{ notifications: Notification[] }>('/notifications'))
  const { markAllRead } = useNotificationStore()
  const handleMarkAll = async () => {
    await markAllRead()
    await refetch()
  }
  const markOne = async (id: string) => {
    await api.post(`/notifications/${id}/read`)
    await refetch()
  }
  const notifications = data?.notifications ?? []
  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
            {unread > 0 ? (
              <>
                You have <span className="font-tabular" style={{ fontWeight: 600, color: 'var(--primary)' }}>{unread}</span> unread alert{unread !== 1 ? 's' : ''}
              </>
            ) : (
              'All caught up. No unread alerts.'
            )}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAll} leftIcon={<CheckCheck size={13} />}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner context="notifications" />
      ) : notifications.length === 0 ? (
        <Empty
          icon={<Bell size={28} />}
          title="No notifications"
          description="We will alert you about verified scholarship matches, approaching deadlines, and application status updates here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card
                style={{
                  padding: '14px 18px',
                  opacity: n.isRead ? 0.75 : 1,
                  cursor: n.isRead ? 'default' : 'pointer',
                  borderColor: n.isRead ? 'var(--border-subtle)' : 'var(--accent-border)',
                  background: n.isRead ? 'var(--bg-surface)' : 'var(--accent-subtle)'
                }}
                onClick={() => !n.isRead && markOne(n.id)}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: n.isRead ? 'transparent' : TC[n.type] ?? 'var(--primary)',
                      marginTop: 6,
                      flexShrink: 0,
                      border: n.isRead ? '1px solid var(--border-subtle)' : 'none'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 600, color: 'var(--text-primary)', margin: 0 }}>
                        {n.title}
                      </p>
                      <span className="font-tabular" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '2px 0 0' }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
