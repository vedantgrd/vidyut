import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Application } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Empty } from '@/components/ui/Empty'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

const FILTERS = ['All', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function fmtAmt(a: number) {
  return a >= 100000 ? `₹${(a / 100000).toFixed(1)}L` : `₹${a.toLocaleString('en-IN')}`
}

export function ApplicationsPage() {
  const [filter, setFilter] = useState('All')
  const qs = filter !== 'All' ? `?status=${filter}` : ''
  const { data, isLoading } = useApi(() => api.get<{ applications: Application[] }>(`/applications${qs}`), [qs])
  const apps = data?.applications ?? []

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          My Applications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '6px 0 0' }}>
          Track submissions, readiness preflight checks, and disbursement milestones.
        </p>
      </div>

      {/* Segmented Status Filter Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((s) => {
          const isActive = filter === s
          const label = s === 'All' ? 'All Applications' : s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Applications Listing */}
      {isLoading ? (
        <PageSpinner context="applications" />
      ) : apps.length === 0 ? (
        <Empty
          icon={<FileText size={28} />}
          title="No applications in this view"
          description="Browse matched opportunities and apply with your verified candidate dossier."
          action={
            <Link to="/scholarships" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Browse Scholarships</Button>
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apps.map((app, i) => {
            const days = daysLeft(app.scholarship.deadline)
            const isDraft = app.status === 'DRAFT'
            const isReady = app.completionPercent >= 100

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hover
                    style={{
                      padding: '18px 20px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                            {app.scholarship.name}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          {app.scholarship.provider}
                        </p>

                        {isDraft && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: isReady ? 'var(--success)' : 'var(--primary)'
                                }}
                              >
                                {isReady ? '✓ Ready for Preflight & Submit' : 'Application Readiness'}
                              </span>
                              <span
                                className="font-tabular"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: isReady ? 'var(--success)' : 'var(--text-secondary)'
                                }}
                              >
                                {app.completionPercent}%
                              </span>
                            </div>
                            <ProgressBar
                              value={app.completionPercent}
                              height={6}
                              color={isReady ? 'var(--success)' : 'var(--primary)'}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p
                          className="font-tabular"
                          style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', margin: 0 }}
                        >
                          {fmtAmt(app.scholarship.amount)}
                        </p>
                        <div style={{ marginTop: 4 }}>
                          <Badge variant={days <= 7 ? 'error' : days <= 30 ? 'warning' : 'default'} size="sm">
                            {days > 0 ? (
                              <>
                                <span className="font-tabular">{days}d</span> left
                              </>
                            ) : (
                              'Closed'
                            )}
                          </Badge>
                        </div>
                      </div>

                      <ChevronRight
                        size={17}
                        color="var(--text-muted)"
                        style={{ flexShrink: 0, marginTop: 4 }}
                      />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
