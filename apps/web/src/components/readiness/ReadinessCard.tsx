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
    if (pct >= 100) return '#059669' // Emerald
    if (pct >= 70) return '#1e40af'  // Navy/blue
    if (pct >= 40) return '#d97706'  // Amber
    return '#dc2626'                 // Red
  }

  return (
    <Card style={{ padding: 20, border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      {/* Top Banner: Score & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isComplete ? '#dcfce7' : '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 16,
            color: getStatusColor(readiness.readinessPercentage)
          }}>
            {readiness.readinessPercentage}%
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Application Readiness
              </h3>
              <Badge variant={readiness.canSubmit ? 'success' : (hasBlockers ? 'error' : 'warning')}>
                {readiness.canSubmit ? 'Ready to Submit' : `${readiness.missingRequirements.length} Item(s) Incomplete`}
              </Badge>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              Deterministic scoring: 85% mandatory requirements + 15% optional polish
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
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            {detailsOpen ? 'Hide Breakdown' : 'View Checklist'}
            {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      <ProgressBar value={readiness.readinessPercentage} height={8} />

      {/* Recommended Next Action */}
      {readiness.recommendedNextAction && !isComplete && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 10,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Next Action
            </span>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: '2px 0 0' }}>
              {readiness.recommendedNextAction.title}
            </h4>
            <p style={{ fontSize: 11, color: '#3b82f6', margin: '2px 0 0' }}>
              {readiness.recommendedNextAction.description}
            </p>
          </div>

          <Link to={readiness.recommendedNextAction.link} style={{ textDecoration: 'none' }}>
            <Button size="sm" style={{ background: '#1e40af', color: '#ffffff' }} rightIcon={<ArrowRight size={12} />}>
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
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AlertCircle size={14} color="#dc2626" />
                  Submission Blockers ({readiness.blockingErrors.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.blockingErrors.map(err => (
                    <div
                      key={err.code}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ color: '#991b1b' }}>{err.message}</span>
                      <Link to={err.link} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="ghost" style={{ color: '#dc2626', fontSize: 11, padding: '2px 6px', height: 24 }}>
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
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AlertTriangle size={14} color="#d97706" />
                  Important Notices ({readiness.warnings.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.warnings.map(warn => (
                    <div
                      key={warn.code}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ color: '#92400e' }}>{warn.message}</span>
                      {warn.link && (
                        <Link to={warn.link} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="ghost" style={{ color: '#d97706', fontSize: 11, padding: '2px 6px', height: 24 }}>
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
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckCircle2 size={14} color="#059669" />
                  Completed Requirements ({readiness.completedRequirements.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {readiness.completedRequirements.map(req => (
                    <div
                      key={req.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{req.label}</span>
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: 11 }}>{req.statusText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incomplete Requirements */}
              {readiness.missingRequirements.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Info size={14} color="#64748b" />
                    Remaining Checklist ({readiness.missingRequirements.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {readiness.missingRequirements.map(req => (
                      <div
                        key={req.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{req.label}</span>
                          <span style={{ color: '#dc2626', fontSize: 10 }}>{req.statusText}</span>
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
