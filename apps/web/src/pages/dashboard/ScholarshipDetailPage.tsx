import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  Building,
  Calendar,
  Award,
  ChevronRight,
  ShieldCheck,
  Banknote
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { useMutation } from '@/hooks/useMutation'
import { api } from '@/api/client'
import type { ScholarshipDetail } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/Toast'

function fmtAmt(a: number) {
  return a >= 100000 ? `₹${(a / 100000).toFixed(1)} Lakh` : `₹${a.toLocaleString('en-IN')}`
}

export function ScholarshipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useApi(() => api.get<{ scholarship: ScholarshipDetail }>(`/scholarships/${id}`), [id])

  const { mutate: startApp, isLoading: applying } = useMutation(async () => {
    try {
      const res = await api.post<{ application: { id: string } }>('/applications', {
        scholarshipId: data!.scholarship.id
      })
      toast('Application started! Your profile info and documents have been linked.', 'success')
      navigate(`/applications/${res.application.id}`)
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  if (isLoading) return <PageSpinner context="scholarship" />
  if (!data?.scholarship) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Scholarship not found.
      </div>
    )
  }

  const s = data.scholarship
  const days = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / 86400000)
  const missingRequired = s.documentStatus.filter((d) => !d.isOptional && d.status === 'MISSING').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 500,
          padding: 0,
          transition: 'color var(--transition-fast)'
        }}
      >
        <ArrowLeft size={15} /> Back to Scholarships
      </button>

      {/* Hero Header Card */}
      <Card style={{ padding: 24, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <Badge variant={s.isEligible ? 'success' : 'error'} dot>
                {s.isEligible ? (
                  <>
                    <span className="font-tabular">{s.matchScore}%</span> Profile Match
                  </>
                ) : (
                  'Ineligible for your profile'
                )}
              </Badge>
              <Badge variant={days <= 7 ? 'error' : days <= 30 ? 'warning' : 'default'} size="sm">
                {days > 0 ? (
                  <>
                    <span className="font-tabular">{days}</span> days remaining
                  </>
                ) : (
                  'Application closed'
                )}
              </Badge>
              {s.applicationStatus && <StatusBadge status={s.applicationStatus} />}
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: 6,
                letterSpacing: '-0.02em'
              }}
            >
              {s.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={14} color="var(--text-muted)" /> {s.provider}
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              background: 'var(--success-subtle)',
              border: '1px solid var(--success-border)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0
              }}
            >
              Scholarship Grant
            </p>
            <p
              className="font-tabular"
              style={{ fontSize: 26, fontWeight: 700, color: 'var(--success)', lineHeight: 1.1, margin: '4px 0 0' }}
            >
              {fmtAmt(s.amount)}
            </p>
            {s.amountDescription && (
              <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, margin: '4px 0 0' }}>
                {s.amountDescription}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 20,
            paddingTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--text-muted)" /> Deadline:{' '}
              <strong style={{ color: 'var(--text-primary)' }} className="font-tabular">
                {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} color="var(--text-muted)" /> Category:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{s.scholarshipCategory || 'General'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {s.applicationStatus ? (
              <Button onClick={() => navigate('/applications')} variant="secondary" rightIcon={<ChevronRight size={14} />}>
                View Existing Application
              </Button>
            ) : (
              <Button
                isLoading={applying}
                onClick={() => startApp()}
                disabled={days <= 0}
                variant="primary"
                rightIcon={<ChevronRight size={14} />}
              >
                {days <= 0 ? 'Deadline Closed' : 'Apply with Vidyut Profile'}
              </Button>
            )}
            {s.officialWebsite && (
              <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="outline" rightIcon={<ExternalLink size={13} />}>
                  Official Portal
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Explainable Eligibility & Required Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Eligibility Breakdown */}
        <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '-0.01em'
            }}
          >
            <ShieldCheck size={18} color={s.isEligible ? 'var(--success)' : 'var(--error)'} />
            Explainable Eligibility Criteria
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.eligibilityDetail.passedRules.map(
              (r) =>
                r.description && (
                  <div
                    key={r.ruleId}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      background: 'var(--success-subtle)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success-border)'
                    }}
                  >
                    <CheckCircle size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: 'var(--success)', fontWeight: 500, lineHeight: 1.4 }}>
                      {r.description}
                    </span>
                  </div>
                )
            )}
            {s.eligibilityDetail.failedRules.map(
              (r) =>
                r.description && (
                  <div
                    key={r.ruleId}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      background: r.isRequired ? 'var(--error-subtle)' : 'var(--warning-subtle)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${r.isRequired ? 'var(--error-border)' : 'var(--warning-border)'}`
                    }}
                  >
                    {r.isRequired ? (
                      <XCircle size={15} color="var(--error)" style={{ flexShrink: 0, marginTop: 1 }} />
                    ) : (
                      <AlertCircle size={15} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                    )}
                    <span
                      style={{
                        color: r.isRequired ? 'var(--error)' : 'var(--warning)',
                        fontWeight: 500,
                        lineHeight: 1.4
                      }}
                    >
                      {r.description}
                    </span>
                  </div>
                )
            )}
            {!s.eligibilityDetail.passedRules.length && !s.eligibilityDetail.failedRules.length && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Open to all qualifying candidates.</p>
            )}
          </div>
        </Card>

        {/* Required Documents Status */}
        <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '-0.01em'
            }}
          >
            <FileText size={18} color="var(--primary)" />
            Required Credentials & Vault Check
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.documentStatus.map((d) => (
              <div
                key={d.requiredDocumentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 13
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {d.label}
                  {d.isOptional ? ' (Optional)' : ''}
                </span>
                <StatusBadge status={d.status} />
              </div>
            ))}
            {s.documentStatus.length === 0 && (
              <div
                style={{
                  background: 'var(--success-subtle)',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success)',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                ✓ No special documents required. Your basic student profile is sufficient!
              </div>
            )}
          </div>
          {missingRequired > 0 && (
            <div
              style={{
                marginTop: 12,
                background: 'var(--warning-subtle)',
                border: '1px solid var(--warning-border)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {missingRequired} required credential{missingRequired > 1 ? 's' : ''} not in vault
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/documents')}
                style={{ color: 'var(--warning)', fontWeight: 600 }}
              >
                Add to Vault
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Payment Structure Card */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '-0.01em'
          }}
        >
          <Banknote size={18} color="var(--success)" />
          Payment & Disbursement Structure
        </h3>
        {s.paymentType === 'INSTALLMENTS' && s.installments && s.installments.length > 0 ? (
          <div>
            <div
              style={{
                background: 'var(--success-subtle)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 14
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, margin: 0 }}>
                ✓ Total Grant: <span className="font-tabular">₹{s.amount.toLocaleString('en-IN')}</span> paid across{' '}
                <span className="font-tabular">{s.installments.length}</span> installments
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.installments.map((inst) => (
                <div
                  key={inst.id || inst.installmentNo}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      Installment {inst.installmentNo}: {inst.name || `Tranche ${inst.installmentNo}`}
                    </p>
                    {inst.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {inst.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-tabular"
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}
                  >
                    ₹{inst.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                One-Time Scholarship Grant
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Full grant transferred in a single installment upon committee approval.
              </p>
            </div>
            <span
              className="font-tabular"
              style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}
            >
              ₹{s.amount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </Card>

      {/* Description Card */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}>
          Scholarship Description & Guidelines
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {s.description}
        </p>
        {s.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {s.tags.map((t) => (
              <Badge key={t} variant="default" size="sm">
                #{t}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
