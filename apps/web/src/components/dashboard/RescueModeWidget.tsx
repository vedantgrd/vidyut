import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LifeBuoy, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import type { RescueActionCard } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function RescueModeWidget() {
  const [actions, setActions] = useState<RescueActionCard[]>([])
  const [status, setStatus] = useState<string>('ALL_CLEAR')
  const [summary, setSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const fetchActions = async () => {
    try {
      const data = await api.get<{
        status: string
        actions: RescueActionCard[]
        summary: string
      }>('/rescue/actions')
      setActions(data.actions || [])
      setStatus(data.status || 'ALL_CLEAR')
      setSummary(data.summary || '')
    } catch (e) {
      console.error('Failed to load rescue actions', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [])

  if (loading) {
    return (
      <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LifeBuoy size={20} className="animate-spin" color="#1e40af" />
          <span style={{ fontSize: 13, color: '#64748b' }}>Analyzing deadlines, vault status, and application readiness...</span>
        </div>
      </Card>
    )
  }

  if (actions.length === 0) {
    return (
      <Card style={{ padding: '16px 20px', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>
                Deadline Rescue Mode: All Clear
              </h3>
              <p style={{ fontSize: 12, color: '#047857', margin: '2px 0 0' }}>
                All applications are on track. No urgent missing documents or expiring deadlines require intervention.
              </p>
            </div>
          </div>
          <Link to="/calendar" style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="outline" style={{ borderColor: '#86efac', color: '#166534' }}>
              View Calendar
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const displayedActions = expanded ? actions : actions.slice(0, 3)

  const getPriorityStyle = (priority: RescueActionCard['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: 'error' as const }
      case 'URGENT':
        return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: 'warning' as const }
      case 'HIGH':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', badge: 'accent' as const }
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', text: '#334155', badge: 'default' as const }
    }
  }

  return (
    <Card style={{ padding: 20, border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: status === 'URGENT_ACTION_REQUIRED' ? '#fee2e2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LifeBuoy size={22} color={status === 'URGENT_ACTION_REQUIRED' ? '#dc2626' : '#1e40af'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Deadline Rescue Mode
              </h2>
              <Badge variant={status === 'URGENT_ACTION_REQUIRED' ? 'error' : 'accent'} dot>
                {actions.length} action{actions.length > 1 ? 's' : ''} needed
              </Badge>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
              {summary}
            </p>
          </div>
        </div>

        {actions.length > 3 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 12 }}
          >
            {expanded ? 'Show Less' : `View All (${actions.length})`}
          </Button>
        )}
      </div>

      {/* Action Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {displayedActions.map((action, i) => {
            const pStyle = getPriorityStyle(action.priority)
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: pStyle.bg,
                  border: `1px solid ${pStyle.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge variant={pStyle.badge}>
                      {action.priority}
                    </Badge>
                    {action.daysRemaining !== null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: action.daysRemaining <= 3 ? '#dc2626' : '#d97706' }}>
                        ⏳ {action.daysRemaining <= 0 ? 'Due Today' : `${action.daysRemaining} days remaining`}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      ⏱️ ~{action.estimatedEffort}
                    </span>
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
                    {action.title}
                  </h4>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {action.whyItMatters}
                  </p>
                  {action.relatedScholarshipName && (
                    <span style={{ fontSize: 11, color: '#64748b', display: 'inline-block', marginTop: 4 }}>
                      Scheme: <strong>{action.relatedScholarshipName}</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to={action.actionUrl} style={{ textDecoration: 'none' }}>
                    <Button
                      size="sm"
                      style={{
                        background: action.priority === 'CRITICAL' ? '#dc2626' : '#1e40af',
                        color: '#ffffff',
                        fontWeight: 600
                      }}
                      rightIcon={<ArrowRight size={13} />}
                    >
                      {action.actionLabel}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Card>
  )
}
