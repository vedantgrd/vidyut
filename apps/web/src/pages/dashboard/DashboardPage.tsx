import { motion } from 'framer-motion'
import {
  Award,
  FileText,
  Clock,
  Bell,
  ArrowRight,
  TrendingUp,
  Shield,
  Banknote,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { DashboardData } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { RescueModeWidget } from '@/components/dashboard/RescueModeWidget'
import { DashboardCalendarWidget } from '@/components/dashboard/DashboardCalendarWidget'

const ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Award,
  FileText,
  Clock,
  Bell,
  Shield,
  Banknote
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function fmt(a: number) {
  return a >= 100000 ? `₹${(a / 100000).toFixed(1)}L` : `₹${a.toLocaleString('en-IN')}`
}

export function DashboardPage() {
  const { data, isLoading } = useApi(() => api.get<DashboardData>('/dashboard/home'))

  if (isLoading || !data) return <PageSpinner context="dashboard" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner: Student Workspace Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 4,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              padding: '3px 10px',
              borderRadius: 20,
              marginBottom: 10
            }}
          >
            <Sparkles size={12} color="var(--primary)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Scholarship Workspace
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}
          >
            {data.greeting}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '6px 0 0', lineHeight: 1.5 }}>
            Manage your matched scholarships, verified credentials, and Direct Benefit Transfer (DBT) funds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/scholarships?onlyEligible=true" style={{ textDecoration: 'none' }}>
            <Button size="sm" variant="primary" rightIcon={<ArrowRight size={13} />}>
              Explore Matches
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14
        }}
      >
        {data.stats.map((stat, i) => {
          const Icon = ICONS[stat.icon] ?? Award
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                style={{
                  padding: '16px 18px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                    <Icon size={16} color="var(--primary)" />
                  </div>
                  <span
                    className="font-tabular"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Fund Disbursement (DBT) Banner if student has approved scholarships or payouts */}
      {data.funds && (data.funds.totalDisbursed > 0 || data.funds.approvedCount > 0) && (
        <Card
          style={{
            padding: 20,
            border: '1px solid var(--success-border)',
            background: 'var(--bg-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-subtle)',
                  border: '1px solid var(--success-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Banknote size={19} color="var(--success)" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Direct Benefit Transfer (DBT) Treasury Overview
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {data.funds.approvedCount} approved scholarship{data.funds.approvedCount > 1 ? 's' : ''} with active bank disbursement
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Disbursed to Bank
                </span>
                <p
                  className="font-tabular"
                  style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', margin: '2px 0 0' }}
                >
                  ₹{data.funds.totalDisbursed.toLocaleString('en-IN')}
                </p>
              </div>
              {data.funds.pendingDisbursement > 0 && (
                <>
                  <div style={{ width: 1, height: 26, background: 'var(--border-subtle)' }} />
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Pending Tranches
                    </span>
                    <p
                      className="font-tabular"
                      style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning)', margin: '2px 0 0' }}
                    >
                      ₹{data.funds.pendingDisbursement.toLocaleString('en-IN')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick tracker for approved grants */}
          {data.approvedApplications && data.approvedApplications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {data.approvedApplications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 13
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="var(--success)" />
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {app.scholarshipName}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                        {app.paymentType === 'INSTALLMENTS' ? 'Multi-Installment Grant' : 'One-Time Grant'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span
                      className="font-tabular"
                      style={{ fontWeight: 600, color: 'var(--success)', fontSize: 13 }}
                    >
                      ₹{app.disbursedAmount.toLocaleString('en-IN')} / ₹{app.amount.toLocaleString('en-IN')}
                    </span>
                    <Link to={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Deadline Rescue Mode - Personalized Action Plan */}
      <RescueModeWidget />

      {/* Workspace Grid: Profile Readiness & Smart Deadlines Agenda */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        {/* Profile Completeness & Vault Overview */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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
                  <TrendingUp size={16} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                    Profile & Vault Readiness
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                    Required credentials for preflight validation
                  </p>
                </div>
              </div>
              <Badge variant={data.profileScore >= 80 ? 'success' : data.profileScore >= 50 ? 'warning' : 'error'}>
                <span className="font-tabular">{data.profileScore}%</span> Complete
              </Badge>
            </div>

            <ProgressBar
              value={data.profileScore}
              height={7}
              color={data.profileScore >= 80 ? 'var(--success)' : data.profileScore >= 50 ? 'var(--warning)' : 'var(--error)'}
            />

            {/* Core Document Statuses */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.vault?.keyDocuments && data.vault.keyDocuments.length > 0 ? data.vault.keyDocuments : [
                { key: 'aadhaar', label: 'Aadhaar Card', type: 'AADHAAR', status: 'PENDING' },
                { key: 'income', label: 'Income Certificate', type: 'INCOME_CERTIFICATE', status: 'PENDING' },
                { key: 'marksheet', label: 'Academic Marksheet', type: 'MARKSHEET', status: 'PENDING' },
                { key: 'photo', label: 'Passport Photo', type: 'PHOTOGRAPH', status: 'PENDING' }
              ]).map((doc) => {
                const isVerified = doc.status === 'VERIFIED'
                const isPending = doc.status === 'PENDING'

                return (
                  <div
                    key={doc.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isVerified ? (
                        <CheckCircle2 size={15} color="var(--success)" />
                      ) : isPending ? (
                        <Clock size={15} color="var(--warning)" />
                      ) : (
                        <FileText size={15} color="var(--text-muted)" />
                      )}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {doc.label}
                      </span>
                    </div>

                    <div>
                      {isVerified ? (
                        <Badge variant="success" dot size="sm">Verified</Badge>
                      ) : isPending ? (
                        <Badge variant="warning" dot size="sm">Pending Review</Badge>
                      ) : (
                        <Link to="/documents" style={{ textDecoration: 'none' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>+ Upload</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Auto-Attach Callout Banner */}
            <div
              style={{
                marginTop: 12,
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Smart Vault:</strong> Documents are automatically attached across all matched schemes.
              </span>
            </div>
          </div>

          {/* Footer stats and links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 12
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              Vault: <strong style={{ color: 'var(--text-primary)' }} className="font-tabular">{data.vault?.verified || 0} Verified</strong> · <span className="font-tabular">{data.vault?.pending || 0}</span> Pending
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/profile" style={{ color: 'var(--text-secondary)', fontSize: 11, textDecoration: 'none', fontWeight: 500 }}>
                Edit Profile
              </Link>
              <Link
                to="/documents"
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12
                }}
              >
                Open Vault <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Upcoming Deadlines & Calendar Agenda */}
        <DashboardCalendarWidget />
      </div>

      {/* Eligible Scholarships Match Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Matched Scholarships
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Identified automatically using your academic criteria, category, and income profile.
            </p>
          </div>
          <Link to="/scholarships?onlyEligible=true" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>
              View all matches
            </Button>
          </Link>
        </div>

        {data.eligibleScholarships.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40, border: '1px solid var(--border-subtle)' }}>
            <Award size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
              Complete your profile details to unlock eligible matches.
            </p>
            <Link to="/profile" style={{ textDecoration: 'none', marginTop: 10, display: 'inline-block' }}>
              <Button size="sm" variant="outline">Update Profile</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {data.eligibleScholarships.map((s, i) => {
              const days = daysUntil(s.deadline)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    hover
                    style={{
                      padding: 18,
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Badge variant="accent">
                          ✓ <span className="font-tabular">{s.matchScore}%</span> match
                        </Badge>
                        {days <= 30 && (
                          <Badge variant={days <= 7 ? 'error' : 'warning'} dot size="sm">
                            <span className="font-tabular">{days}d</span> left
                          </Badge>
                        )}
                      </div>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: 4,
                          lineHeight: 1.4
                        }}
                      >
                        {s.name}
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                        {s.provider}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 12
                      }}
                    >
                      <span
                        className="font-tabular"
                        style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)' }}
                      >
                        {fmt(s.amount)}
                      </span>
                      <Link to={`/scholarships/${s.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight size={12} />}>
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Application Pipeline Segmented Distribution Bar */}
      {data.pipeline && data.pipeline.total > 0 && (
        <Card style={{ padding: '18px 20px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Application Pipeline Distribution
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {data.pipeline.total} total application{data.pipeline.total > 1 ? 's' : ''} tracked across lifecycle stages
              </p>
            </div>
            <Link to="/applications" style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight size={12} />}>
                Manage Dossiers
              </Button>
            </Link>
          </div>

          {/* Segmented Bar */}
          <div
            style={{
              width: '100%',
              height: 10,
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 5,
              overflow: 'hidden',
              display: 'flex',
              border: '1px solid var(--border-subtle)',
              marginBottom: 14
            }}
          >
            {[
              { key: 'draft', label: 'Draft', count: data.pipeline.draft, color: '#8B95A5' },
              { key: 'submitted', label: 'Submitted', count: data.pipeline.submitted, color: '#315EAA' },
              { key: 'underReview', label: 'Under Review', count: data.pipeline.underReview, color: '#6366F1' },
              { key: 'actionRequired', label: 'Action Required', count: data.pipeline.actionRequired, color: '#D97706' },
              { key: 'approved', label: 'Approved', count: data.pipeline.approved, color: '#247A55' },
              { key: 'rejected', label: 'Closed / Rejected', count: data.pipeline.rejected, color: '#DC2626' }
            ].map((seg) => {
              if (!seg.count) return null
              const pct = Math.max(3, (seg.count / data.pipeline!.total) * 100)
              return (
                <div
                  key={seg.key}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                    transition: 'width 0.3s ease'
                  }}
                  title={`${seg.label}: ${seg.count} (${Math.round((seg.count / data.pipeline!.total) * 100)}%)`}
                />
              )
            })}
          </div>

          {/* Stage Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Draft', count: data.pipeline.draft, color: '#8B95A5', bg: 'var(--bg-canvas)' },
              { label: 'Submitted', count: data.pipeline.submitted, color: '#315EAA', bg: 'var(--accent-subtle)' },
              { label: 'Under Review', count: data.pipeline.underReview, color: '#6366F1', bg: '#EEF2FF' },
              { label: 'Action Required', count: data.pipeline.actionRequired, color: '#D97706', bg: '#FFFBEB' },
              { label: 'Approved', count: data.pipeline.approved, color: '#247A55', bg: 'var(--success-subtle)' },
              { label: 'Rejected', count: data.pipeline.rejected, color: '#DC2626', bg: '#FEF2F2' }
            ].map((st) => (
              <div
                key={st.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: st.bg,
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{st.label}:</span>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Applications */}
      {data.activeApplications.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Active Applications
            </h2>
            <Link to="/applications" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>
                View all
              </Button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.activeApplications.map((app) => (
              <Link to={`/applications/${app.id}`} key={app.id} style={{ textDecoration: 'none' }}>
                <Card hover style={{ padding: '14px 18px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {app.scholarshipName}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        <span className="font-tabular">{daysUntil(app.deadline)}</span> days until deadline
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <ProgressBar value={app.completionPercent} showLabel height={7} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

