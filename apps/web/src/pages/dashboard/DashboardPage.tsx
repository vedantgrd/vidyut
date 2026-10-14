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

  if (isLoading || !data) return <PageSpinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner: Vidyut Command Center */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: 20, marginBottom: 8 }}>
            <Sparkles size={12} color="#1e40af" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Vidyut Command Center
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {data.greeting}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Unified workspace for your scholarships, document credentials, and Direct Benefit Transfer (DBT) funds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/scholarships?onlyEligible=true" style={{ textDecoration: 'none' }}>
            <Button size="sm" style={{ background: '#1e40af', color: '#ffffff' }} rightIcon={<ArrowRight size={13} />}>
              Explore Matches
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {data.stats.map((stat, i) => {
          const Icon = ICONS[stat.icon] ?? Award
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card style={{ padding: '16px 20px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color="#1e40af" />
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stat.value}</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0 }}>{stat.label}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Fund Disbursement (DBT) Banner if student has approved scholarships or payouts */}
      {data.funds && (data.funds.totalDisbursed > 0 || data.funds.approvedCount > 0) && (
        <Card style={{ padding: 20, border: '1px solid #bbf7d0', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Banknote size={20} color="#15803d" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Direct Benefit Transfer (DBT) Overview
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  {data.funds.approvedCount} approved grant{data.funds.approvedCount > 1 ? 's' : ''} with active treasury disbursement
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DISBURSED TO BANK</span>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#15803d', margin: 0 }}>
                  ₹{data.funds.totalDisbursed.toLocaleString('en-IN')}
                </p>
              </div>
              {data.funds.pendingDisbursement > 0 && (
                <>
                  <div style={{ width: 1, height: 26, background: '#cbd5e1' }} />
                  <div>
                    <span style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>PENDING TRANCHES</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#b45309', margin: 0 }}>
                      ₹{data.funds.pendingDisbursement.toLocaleString('en-IN')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick tracker for approved grants */}
          {data.approvedApplications && data.approvedApplications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {data.approvedApplications.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{app.scholarshipName}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                        {app.paymentType === 'INSTALLMENTS' ? 'Multi-Installment Grant' : 'One-Time Grant'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>
                      ₹{app.disbursedAmount.toLocaleString('en-IN')} / ₹{app.amount.toLocaleString('en-IN')}
                    </span>
                    <Link to={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="ghost">View Details</Button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {/* Profile Completeness & Vault Overview */}
        <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="#1e40af" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Profile & Vault Readiness</h3>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Key certificates for pre-submission checks</p>
                </div>
              </div>
              <Badge variant={data.profileScore >= 80 ? 'success' : data.profileScore >= 50 ? 'warning' : 'error'}>
                {data.profileScore}% Complete
              </Badge>
            </div>
            
            <ProgressBar value={data.profileScore} height={8} color={data.profileScore >= 80 ? '#059669' : data.profileScore >= 50 ? '#d97706' : '#dc2626'} />

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
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isVerified ? (
                        <CheckCircle2 size={15} color="#059669" />
                      ) : isPending ? (
                        <Clock size={15} color="#d97706" />
                      ) : (
                        <FileText size={15} color="#64748b" />
                      )}
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                        {doc.label}
                      </span>
                    </div>

                    <div>
                      {isVerified ? (
                        <Badge variant="success" dot>Verified</Badge>
                      ) : isPending ? (
                        <Badge variant="warning" dot>Pending Review</Badge>
                      ) : (
                        <Link to="/documents" style={{ textDecoration: 'none' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>+ Upload</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Auto-Attach Callout Banner */}
            <div style={{
              marginTop: 12,
              padding: '9px 12px',
              borderRadius: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: '#1e3a8a'
            }}>
              <Sparkles size={14} color="#1e40af" style={{ flexShrink: 0 }} />
              <span>
                <strong>Smart Vault:</strong> Documents are automatically linked across all matched schemes.
              </span>
            </div>
          </div>

          {/* Footer stats and links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 12 }}>
            <span style={{ color: '#64748b', fontSize: 11 }}>
              Vault: <strong>{data.vault?.verified || 0} Verified</strong> · {data.vault?.pending || 0} Pending
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/profile" style={{ color: '#64748b', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                Edit Profile
              </Link>
              <Link to="/documents" style={{ color: '#1e40af', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
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
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Matched Scholarships</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Discovered automatically using your academic, category & income profile</p>
          </div>
          <Link to="/scholarships?onlyEligible=true">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>
              View all matches
            </Button>
          </Link>
        </div>

        {data.eligibleScholarships.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40, border: '1px solid #e2e8f0' }}>
            <Award size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>Complete your profile details to unlock eligible matches.</p>
            <Link to="/profile" style={{ textDecoration: 'none', marginTop: 10, display: 'inline-block' }}>
              <Button size="sm" variant="outline">Update Profile</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {data.eligibleScholarships.map((s, i) => {
              const days = daysUntil(s.deadline)
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card hover style={{ padding: 18, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Badge variant="accent">✓ {s.matchScore}% match</Badge>
                        {days <= 30 && <Badge variant={days <= 7 ? 'error' : 'warning'} dot>{days}d left</Badge>}
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.4 }}>{s.name}</h4>
                      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{s.provider}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>{fmt(s.amount)}</span>
                      <Link to={`/scholarships/${s.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight size={12} />}>Apply</Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Applications */}
      {data.activeApplications.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Active Applications</h2>
            <Link to="/applications">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>View all</Button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.activeApplications.map((app) => (
              <Link to={`/applications/${app.id}`} key={app.id} style={{ textDecoration: 'none' }}>
                <Card hover style={{ padding: '14px 18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{app.scholarshipName}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{daysUntil(app.deadline)} days until deadline</p>
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

