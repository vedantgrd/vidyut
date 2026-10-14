import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ArrowRight, Clock, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import type { RescueActionCard } from '@/types'
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
      <div
        style={{
          padding: '14px 18px',
          border: '1px solid var(--border-subtle, #E7E9EE)',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface-1, #FFFFFF)',
          boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid var(--brand-primary, #315EAA)',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-secondary, #657084)' }}>
          Checking deadlines, missing credentials, and application readiness...
        </span>
      </div>
    )
  }

  // ALL CLEAR STATE: Calm, reassuring, zero manufactured urgency
  if (actions.length === 0) {
    return (
      <div
        style={{
          padding: '14px 18px',
          border: '1px solid rgba(36, 122, 85, 0.22)',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--success-subtle, #EAF5EF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm, 6px)',
              background: '#FFFFFF',
              border: '1px solid rgba(36, 122, 85, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success, #247A55)',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--success, #247A55)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Deadline Rescue: All Clear
            </h4>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-secondary, #657084)',
                margin: '2px 0 0',
                lineHeight: 1.4,
              }}
            >
              All active applications and required credentials are on track. No urgent interventions needed.
            </p>
          </div>
        </div>

        <Link to="/calendar" style={{ textDecoration: 'none' }}>
          <Button
            size="sm"
            variant="outline"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(36, 122, 85, 0.3)',
              color: 'var(--success, #247A55)',
              fontSize: '12px',
            }}
          >
            View Calendar & Agenda
          </Button>
        </Link>
      </div>
    )
  }

  // ACTION REQUIRED: Clear, prioritized guidance
  const topAction = actions[0]
  const remainingActions = actions.slice(1)
  const isUrgent = status === 'URGENT' || topAction.priorityScore >= 80

  return (
    <div
      style={{
        border: `1px solid ${isUrgent ? 'rgba(184, 62, 69, 0.25)' : 'rgba(153, 100, 22, 0.25)'}`,
        borderRadius: 'var(--radius-lg, 12px)',
        background: isUrgent ? 'var(--error-subtle, #FCEEEF)' : 'var(--warning-subtle, #FFF5E3)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm, 6px)',
              background: '#FFFFFF',
              border: `1px solid ${isUrgent ? 'rgba(184, 62, 69, 0.25)' : 'rgba(153, 100, 22, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isUrgent ? 'var(--error, #B83E45)' : 'var(--warning, #996416)',
              flexShrink: 0,
            }}
          >
            {isUrgent ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isUrgent ? 'var(--error, #B83E45)' : 'var(--warning, #996416)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Deadline Rescue: Action Recommended
              </h4>
              <Badge variant={isUrgent ? 'error' : 'warning'} size="sm">
                {actions.length} {actions.length === 1 ? 'Action Required' : 'Actions Required'}
              </Badge>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary, #657084)', margin: '4px 0 0', lineHeight: 1.4 }}>
              {summary || 'Review critical requirements to prevent missing grant deadlines.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {remainingActions.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              style={{ fontSize: 12 }}
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp size={13} style={{ marginLeft: 4 }} />
                </>
              ) : (
                <>
                  +{remainingActions.length} More <ChevronDown size={13} style={{ marginLeft: 4 }} />
                </>
              )}
            </Button>
          )}
          <Link to={topAction.actionUrl} style={{ textDecoration: 'none' }}>
            <Button size="sm" variant={isUrgent ? 'danger' : 'primary'} rightIcon={<ArrowRight size={13} />}>
              {topAction.actionLabel || 'Resolve Now'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Action Card Preview */}
      <div
        style={{
          background: 'var(--surface-1, #FFFFFF)',
          border: '1px solid var(--border-subtle, #E7E9EE)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #172033)', margin: 0 }}>
            {topAction.title}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary, #657084)', margin: '2px 0 0' }}>
            {topAction.whyItMatters}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {topAction.deadline && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: isUrgent ? 'var(--error, #B83E45)' : 'var(--warning, #996416)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Clock size={12} /> {topAction.daysRemaining} days left
            </span>
          )}
        </div>
      </div>

      {/* Expanded list of additional actions */}
      <AnimatePresence>
        {expanded && remainingActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}
          >
            {remainingActions.map((action) => (
              <div
                key={action.id}
                style={{
                  background: 'var(--surface-1, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E7E9EE)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary, #172033)', margin: 0 }}>
                    {action.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary, #657084)', margin: '2px 0 0' }}>
                    {action.whyItMatters}
                  </p>
                </div>
                <Link to={action.actionUrl} style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline" style={{ fontSize: 11.5, height: 28 }}>
                    {action.actionLabel || 'Fix'}
                  </Button>
                </Link>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
