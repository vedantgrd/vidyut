import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReadinessResult } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface ReadinessCardProps {
  readiness: ReadinessResult
  onRunPreflight?: () => void
  showFullDetails?: boolean
}

export function ReadinessCard({ readiness, onRunPreflight, showFullDetails = true }: ReadinessCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(showFullDetails)

  const isComplete = readiness.readinessPercentage >= 100
  const hasBlockers = readiness.blockingErrors.length > 0
  const hasWarnings = readiness.warnings.length > 0

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return 'var(--success)'
    if (pct >= 70) return 'var(--primary)'
    if (pct >= 40) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <Card style={{ padding: 20, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
      {/* Top Banner: Score & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="font-tabular"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: isComplete ? 'var(--success-subtle)' : 'var(--accent-subtle)',
              border: `1px solid ${isComplete ? 'var(--success-border)' : 'var(--accent-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              color: getStatusColor(readiness.readinessPercentage)
            }}
          >
            {readiness.readinessPercentage}%
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Application Readiness Preflight
              </h3>
              <Badge variant={readiness.canSubmit ? 'success' : hasBlockers ? 'error' : 'warning'}>
                {readiness.canSubmit ? 'Ready to Submit' : `${readiness.missingRequirements.length} Incomplete`}
              </Badge>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Deterministic scoring: mandatory criteria + required credentials
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onRunPreflight && (
            <Button size="sm" variant="outline" onClick={onRunPreflight} style={{ fontSize: 12, height: 32 }}>
              Re-check
            </Button>
          )}
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {detailsOpen ? 'Hide Checklist' : 'View Checklist'}
            {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      <ProgressBar value={readiness.readinessPercentage} height={7} />

      {/* Recommended Next Action */}
      {readiness.recommendedNextAction && !isComplete && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Next Action
            </span>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0' }}>
              {readiness.recommendedNextAction.title}
            </h4>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {readiness.recommendedNextAction.description}
            </p>
          </div>

          <Link to={readiness.recommendedNextAction.link} style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="primary" rightIcon={<ArrowRight size={12} />}>
              {readiness.recommendedNextAction.actionText}
            </Button>
          </Link>
        </div>
      )}

      {/* Expandable Breakdown Checklist */}
      <AnimatePresence>
        {detailsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: 16 }}
          >
            {/* Blocking Errors */}
            {hasBlockers && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 6px' }}>
                  <AlertCircle size={14} color="var(--error)" />
                  Submission Blockers ({readiness.blockingErrors.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.blockingErrors.map((err) => (
                    <div
                      key={err.code}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--error-subtle)',
                        border: '1px solid var(--error-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ color: 'var(--error)', fontWeight: 500 }}>{err.message}</span>
                      <Link to={err.link} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="ghost" style={{ color: 'var(--error)', fontSize: 11, padding: '2px 6px', height: 24 }}>
                          {err.action} →
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-blocking Warnings */}
            {hasWarnings && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 6px' }}>
                  <AlertTriangle size={14} color="var(--warning)" />
                  Important Notices ({readiness.warnings.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.warnings.map((warn) => (
                    <div
                      key={warn.code}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--warning-subtle)',
                        border: '1px solid var(--warning-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ color: 'var(--warning)', fontWeight: 500 }}>{warn.message}</span>
                      {warn.link && (
                        <Link to={warn.link} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="ghost" style={{ color: 'var(--warning)', fontSize: 11, padding: '2px 6px', height: 24 }}>
                            {warn.action || 'View'} →
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist of all items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {/* Completed Requirements */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 8px' }}>
                  <CheckCircle2 size={14} color="var(--success)" />
                  Completed Requirements ({readiness.completedRequirements.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.completedRequirements.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--success-subtle)',
                        border: '1px solid var(--success-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.label}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 11 }}>{req.statusText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incomplete Requirements */}
              {readiness.missingRequirements.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 8px' }}>
                    <Info size={14} color="var(--text-muted)" />
                    Remaining Checklist ({readiness.missingRequirements.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {readiness.missingRequirements.map((req) => (
                      <div
                        key={req.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-canvas)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{req.label}</span>
                          <span style={{ color: 'var(--error)', fontSize: 10 }}>{req.statusText}</span>
                        </div>
                        {req.actionUrl && (
                          <Link to={req.actionUrl} style={{ textDecoration: 'none' }}>
                            <Button size="sm" variant="outline" style={{ fontSize: 11, padding: '2px 8px', height: 24 }}>
                              Resolve →
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
export default ReadinessCard
