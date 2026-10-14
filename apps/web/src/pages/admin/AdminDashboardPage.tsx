import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  FolderCheck,
  TrendingUp,
  Banknote,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface AdminStats {
  totalStudents: number
  totalScholarships: number
  activeScholarships: number
  totalApplications: number
  pendingReview: number
  pendingDocuments: number
  totalApprovedAwardsValue?: number
  totalDisbursedValue?: number
  pendingDisbursementValue?: number
  disbursedCount?: number
}

interface ApplicationStatusGroup {
  status: string
  _count: number
}

export function AdminDashboardPage() {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')

  const { data, isLoading } = useApi(() =>
    api.get<{
      stats: AdminStats
      applicationsByStatus: ApplicationStatusGroup[]
      recentApplications: any[]
    }>('/admin/dashboard')
  )

  if (isLoading || !data) return <PageSpinner />

  const { stats, applicationsByStatus = [], recentApplications = [] } = data

  const totalApproved = stats.totalApprovedAwardsValue || 0
  const totalDisbursed = stats.totalDisbursedValue || 0
  const pendingDisbursement = stats.pendingDisbursementValue || 0
  const settlementPct = totalApproved > 0 ? Math.round((totalDisbursed / totalApproved) * 100) : 0

  // Calculate pipeline status counts
  const statusCounts: Record<string, number> = {}
  applicationsByStatus.forEach(g => {
    statusCounts[g.status] = g._count
  })

  const pipelineStages = [
    { key: 'SUBMITTED', label: 'Submitted', count: statusCounts['SUBMITTED'] || 0, color: 'var(--brand-primary, #315EAA)' },
    { key: 'DOCUMENTS_VERIFIED', label: 'Docs Verified', count: statusCounts['DOCUMENTS_VERIFIED'] || 0, color: '#0284C7' },
    { key: 'UNDER_REVIEW', label: 'Under Review', count: statusCounts['UNDER_REVIEW'] || 0, color: 'var(--warning, #996416)' },
    { key: 'ADDITIONAL_INFO_REQUESTED', label: 'Info Needed', count: statusCounts['ADDITIONAL_INFO_REQUESTED'] || 0, color: '#D97706' },
    { key: 'APPROVED', label: 'Approved', count: statusCounts['APPROVED'] || 0, color: 'var(--success, #247A55)' },
    { key: 'REJECTED', label: 'Rejected', count: statusCounts['REJECTED'] || 0, color: 'var(--error, #B83E45)' }
  ]

  const totalTrackedApplications = pipelineStages.reduce((sum, s) => sum + s.count, 0) || stats.totalApplications || 1

  const filteredRecent = selectedStatusFilter === 'ALL'
    ? recentApplications
    : recentApplications.filter(a => a.status === selectedStatusFilter)

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Administrative Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary, #657084)', fontSize: 13, margin: 0 }}>
            Operational review queue, application pipeline analytics, and DBT financial reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/scholarships/new" style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="primary">
              + New Scholarship
            </Button>
          </Link>
          <Link to="/admin/applications" style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="outline" rightIcon={<ArrowRight size={13} />}>
              Full Review Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Operational Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
          marginBottom: 20
        }}
      >
        <Card style={{ padding: '16px 18px', border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Students
            </span>
            <Users size={16} color="var(--brand-primary, #315EAA)" />
          </div>
          <p className="font-tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {stats.totalStudents}
          </p>
        </Card>

        <Card style={{ padding: '16px 18px', border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Schemes
            </span>
            <BookOpen size={16} color="var(--success, #247A55)" />
          </div>
          <p className="font-tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {stats.activeScholarships} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>/ {stats.totalScholarships}</span>
          </p>
        </Card>

        <Card style={{ padding: '16px 18px', border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Review Backlog
            </span>
            <Clock size={16} color="var(--warning, #996416)" />
          </div>
          <p className="font-tabular" style={{ fontSize: 24, fontWeight: 700, color: stats.pendingReview > 0 ? 'var(--warning, #996416)' : 'var(--text-primary)', margin: 0 }}>
            {stats.pendingReview}
          </p>
        </Card>

        <Card style={{ padding: '16px 18px', border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Documents
            </span>
            <FolderCheck size={16} color="var(--error, #B83E45)" />
          </div>
          <p className="font-tabular" style={{ fontSize: 24, fontWeight: 700, color: stats.pendingDocuments > 0 ? 'var(--error, #B83E45)' : 'var(--text-primary)', margin: 0 }}>
            {stats.pendingDocuments}
          </p>
        </Card>
      </div>

      {/* Visual Analytics Grid: Pipeline + DBT Treasury */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}
      >
        {/* Analytics 1: Application Review Pipeline Visualizer */}
        <Card
          style={{
            padding: 22,
            border: '1px solid var(--border-subtle, #E7E9EE)',
            background: 'var(--surface-1, #FFFFFF)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="var(--brand-primary, #315EAA)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Application Pipeline Distribution
                </h3>
              </div>
              <Badge variant="default" size="sm">
                {stats.totalApplications} Total
              </Badge>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.4 }}>
              Distribution of candidates across active verification, committee review, and award decision stages.
            </p>

            {/* Segmented Horizontal Distribution Bar */}
            <div
              style={{
                display: 'flex',
                height: 10,
                borderRadius: 9999,
                overflow: 'hidden',
                background: 'var(--bg-canvas, #FAFAF8)',
                marginBottom: 16
              }}
            >
              {pipelineStages.map((stage) => {
                const widthPct = totalTrackedApplications > 0 ? (stage.count / totalTrackedApplications) * 100 : 0
                if (widthPct === 0) return null
                return (
                  <div
                    key={stage.key}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: stage.color,
                      transition: 'width 0.4s ease'
                    }}
                    title={`${stage.label}: ${stage.count} (${widthPct.toFixed(1)}%)`}
                  />
                )
              })}
            </div>

            {/* Pipeline Stage Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {pipelineStages.map((stage) => {
                const isSelected = selectedStatusFilter === stage.key
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setSelectedStatusFilter(isSelected ? 'ALL' : stage.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 10px',
                      background: isSelected ? 'var(--brand-subtle, #EDF3FC)' : 'var(--bg-canvas, #FAFAF8)',
                      border: `1px solid ${isSelected ? 'var(--brand-primary, #315EAA)' : 'var(--border-subtle, #E7E9EE)'}`,
                      borderRadius: 'var(--radius-md, 8px)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {stage.label}
                      </span>
                    </div>
                    <span className="font-tabular" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stage.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Analytics 2: DBT Treasury & Multi-Installment Obligations */}
        <Card
          style={{
            padding: 22,
            border: '1px solid var(--border-subtle, #E7E9EE)',
            background: 'var(--surface-1, #FFFFFF)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Banknote size={16} color="var(--success, #247A55)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  DBT Treasury & Disbursement Obligations
                </h3>
              </div>
              <Badge variant="success" size="sm">
                {stats.disbursedCount || 0} Payouts
              </Badge>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.4 }}>
              Reconciliation of approved scholarship commitments versus recorded bank payouts and scheduled tranches.
            </p>

            {/* Financial Progress Meter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Settlement Rate</span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--success, #247A55)' }}>
                  {settlementPct}% Disbursed
                </span>
              </div>
              <ProgressBar value={settlementPct} />
            </div>

            {/* Financial Totals Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                background: 'var(--bg-canvas, #FAFAF8)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-subtle, #E7E9EE)'
              }}
            >
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Total Approved
                </span>
                <p className="font-tabular" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '3px 0 0' }}>
                  ₹{totalApproved.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--success, #247A55)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Paid via DBT
                </span>
                <p className="font-tabular" style={{ fontSize: 15, fontWeight: 700, color: 'var(--success, #247A55)', margin: '3px 0 0' }}>
                  ₹{totalDisbursed.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--warning, #996416)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Pending Tranches
                </span>
                <p className="font-tabular" style={{ fontSize: 15, fontWeight: 700, color: 'var(--warning, #996416)', margin: '3px 0 0' }}>
                  ₹{pendingDisbursement.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Operational Applications Table */}
      <Card style={{ border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recent Candidate Applications
            </h3>
            {selectedStatusFilter !== 'ALL' && (
              <Badge variant="accent" size="sm">
                Filtered: {selectedStatusFilter}
              </Badge>
            )}
          </div>

          {selectedStatusFilter !== 'ALL' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedStatusFilter('ALL')}
              style={{ fontSize: 12 }}
            >
              Clear Filter
            </Button>
          )}
        </div>

        {filteredRecent.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0, fontSize: 13 }}>No applications found matching the selected status filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredRecent.map((app: any) => {
              const awardAmt = app.scholarship?.amount || 0
              const disbursedList = app.disbursements || []
              const paidCount = disbursedList.filter((d: any) => d.status === 'DISBURSED').length

              return (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-canvas, #FAFAF8)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-subtle, #E7E9EE)',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div style={{ minWidth: 240, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {app.user?.fullName || 'Applicant'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {app.user?.email}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                      {app.scholarship?.name}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className="font-tabular" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{awardAmt.toLocaleString('en-IN')}
                      </span>
                      {paidCount > 0 && (
                        <p style={{ fontSize: 11, color: 'var(--success, #247A55)', margin: 0, fontWeight: 600 }}>
                          ✓ {paidCount} Tranche{paidCount > 1 ? 's' : ''} Paid
                        </p>
                      )}
                    </div>

                    <StatusBadge status={app.status} />

                    <Link to={`/admin/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="outline" rightIcon={<ChevronRight size={13} />}>
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
