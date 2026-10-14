import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import type { CalendarEvent } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function DashboardCalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ events: CalendarEvent[] }>('/calendar/events')
      .then(res => setEvents(res.events || []))
      .catch(err => console.error('Error fetching calendar events', err))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter(e => e.date >= todayStr && !e.isCompleted)
    .slice(0, 4)

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'SCHOLARSHIP_DEADLINE':
        return <Badge variant="error" dot>Deadline</Badge>
      case 'PERSONAL_TASK':
        return <Badge variant="accent" dot>Task</Badge>
      case 'DOCUMENT_EXPIRY':
        return <Badge variant="warning" dot>Expiry</Badge>
      case 'EXPECTED_INSTALLMENT':
        return <Badge variant="success" dot>Payout</Badge>
      default:
        return <Badge variant="default">Event</Badge>
    }
  }

  const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  const getDayAndMonth = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      const day = parts[2] ? String(parseInt(parts[2], 10)) : ''
      const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : 0
      const month = MONTH_SHORT[monthIdx] || 'DATE'
      return { day, month }
    } catch {
      return { day: '', month: '' }
    }
  }

  return (
    <Card
      style={{
        padding: 20,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarIcon size={16} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Upcoming Deadlines & Agenda
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                Scholarship milestones and verified task deadlines
              </p>
            </div>
          </div>
          <Link to="/calendar" style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="ghost" rightIcon={<ChevronRight size={13} />}>
              Full Calendar
            </Button>
          </Link>
        </div>

        {loading ? (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>
            Loading calendar events...
          </p>
        ) : upcomingEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 12px',
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <CheckCircle2 size={24} color="var(--success)" style={{ margin: '0 auto 6px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              No approaching deadlines
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Explore eligible scholarships or create personal reminder tasks.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingEvents.map((e) => (
              <Link
                key={e.id}
                to={e.actionUrl}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {(() => {
                      const { day, month } = getDayAndMonth(e.date)
                      return (
                        <>
                          <span
                            className="font-tabular"
                            style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}
                          >
                            {day}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {month}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {e.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                      {e.description || e.date}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {getEventBadge(e.type)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 12,
          marginTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          <span className="font-tabular">{events.length}</span> tracked event{events.length !== 1 ? 's' : ''} in calendar
        </span>
        <Link to="/calendar" style={{ textDecoration: 'none' }}>
          <Button size="sm" variant="outline" rightIcon={<ArrowRight size={12} />}>
            Manage Agenda
          </Button>
        </Link>
      </div>
    </Card>
  )
}
