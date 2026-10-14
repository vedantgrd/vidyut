import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Upload,
  AlertCircle,
  ShieldCheck,
  FileText,
  Check,
  ExternalLink,
  ChevronRight,
  Banknote
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { useMutation } from '@/hooks/useMutation'
import { api } from '@/api/client'
import type { Document } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { toast } from '@/components/ui/Toast'
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal'
import { ReadinessCard } from '@/components/readiness/ReadinessCard'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1) // 1: Profile Prefill, 2: Documents, 3: Review & Submit
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [uploadingForRd, setUploadingForRd] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ id: string; title: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUploadRdId = useRef<string | null>(null)

  const { data, isLoading, refetch } = useApi(() => api.get<any>(`/applications/${id}`), [id])
  const { data: myDocs, refetch: refetchDocs } = useApi(() => api.get<{ documents: Document[] }>('/documents'))

  const { mutate: submitApp, isLoading: submitting } = useMutation(async () => {
    if (!declarationAccepted) {
      toast('Please confirm the honesty declaration before submitting', 'error')
      return
    }
    try {
      await api.post(`/applications/${id}/submit`, { confirmDeclaration: true })
      await refetch()
      toast('Application submitted successfully! 🎉', 'success')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  const { mutate: withdrawApp, isLoading: withdrawing } = useMutation(async () => {
    if (!window.confirm('Are you sure you want to withdraw or delete this application?')) return
    try {
      await api.delete(`/applications/${id}`)
      toast('Application withdrawn', 'info')
      navigate('/applications')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  const attachVaultDoc = async (requiredDocumentId: string, documentId: string) => {
    try {
      await api.put(`/applications/${id}/documents`, { requiredDocumentId, documentId })
      await refetch()
      toast('Document linked to application!', 'success')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  }

  const handleInSituUpload = async (requiredDocumentId: string, docType: string, docLabel: string, file: File) => {
    setUploadingForRd(requiredDocumentId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', docType)
      fd.append('label', docLabel)
      const uploadRes = await api.upload<{ document: Document }>('/documents/upload?replace=true', fd)
      await refetchDocs()
      await api.put(`/applications/${id}/documents`, {
        requiredDocumentId,
        documentId: uploadRes.document.id
      })
      await refetch()
      toast(`${docLabel} uploaded and attached to application!`, 'success')
    } catch (err: unknown) {
      toast(err, 'error')
    } finally {
      setUploadingForRd(null)
    }
  }

  if (isLoading) return <PageSpinner context="application" />
  if (!data?.application) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Application not found.
      </div>
    )
  }

  const { application: app, prefill } = data
  const sch = app.scholarship
  const isDraft = app.status === 'DRAFT'
  const reqDocs = (sch.requiredDocuments ?? []).filter((r: any) => !r.isOptional)
  const attMap: Record<string, any> = {}
  app.documents.forEach((d: any) => {
    attMap[d.requiredDocumentId] = d.document
  })

  const allRequiredAttached = reqDocs.every((r: any) => Boolean(attMap[r.id]))
  const canSubmit = isDraft && allRequiredAttached

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Navigation */}
      <button
        onClick={() => navigate('/applications')}
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
        <ArrowLeft size={15} /> Back to My Applications
      </button>

      {/* Header Card */}
      <Card style={{ padding: 22, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <StatusBadge status={app.status} />
              <span className="font-tabular" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Application #{app.id.slice(0, 8)}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {sch.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {sch.provider}
            </p>
          </div>

          {isDraft && (
            <Button
              variant="danger"
              size="sm"
              isLoading={withdrawing}
              onClick={() => withdrawApp()}
              leftIcon={<Trash2 size={13} />}
            >
              Discard Draft
            </Button>
          )}
        </div>

        {isDraft && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Application Readiness
              </span>
              <span
                className="font-tabular"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: allRequiredAttached ? 'var(--success)' : 'var(--warning)'
                }}
              >
                {app.completionPercent}%
              </span>
            </div>
            <ProgressBar
              value={app.completionPercent}
              height={7}
              color={allRequiredAttached ? 'var(--success)' : 'var(--warning)'}
            />
          </div>
        )}
      </Card>

      {/* Reviewer Feedback Banner if any */}
      {app.reviewerNotes && (
        <div
          style={{
            background: 'var(--warning-subtle)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: 16
          }}
        >
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={15} /> Official Reviewer Remarks
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {app.reviewerNotes}
          </p>
        </div>
      )}

      {/* Student Fund Disbursement Tracker (Approved Applications) */}
      {app.status === 'APPROVED' && (
        <Card
          style={{
            border: '1px solid var(--success-border)',
            background: 'var(--bg-surface)',
            padding: 20
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Direct Benefit Transfer (DBT) Tracker
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Treasury installments and bank account disbursement records
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Disbursed
              </span>
              <p className="font-tabular" style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', margin: '2px 0 0' }}>
                ₹{(app.disbursedAmount || 0).toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  / ₹{sch.amount.toLocaleString('en-IN')}
                </span>
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <ProgressBar
              value={sch.amount > 0 ? Math.min(100, Math.round(((app.disbursedAmount || 0) / sch.amount) * 100)) : 0}
              height={8}
              color="var(--success)"
              showLabel
            />
          </div>

          {/* Installments Breakdown */}
          {sch.installments && sch.installments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>
                Disbursement Schedule
              </h4>
              {sch.installments.map((inst: any) => {
                const disMatch = (app.disbursements || []).find(
                  (d: any) => d.installmentNo === inst.installmentNo || d.installmentId === inst.id
                )
                const isPaid = !!disMatch && disMatch.status === 'DISBURSED'

                return (
                  <div
                    key={inst.id || inst.installmentNo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isPaid ? 'var(--success-subtle)' : 'var(--bg-canvas)',
                      border: `1px solid ${isPaid ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                      flexWrap: 'wrap',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isPaid ? (
                        <CheckCircle2 size={17} color="var(--success)" />
                      ) : (
                        <Clock size={17} color="var(--text-muted)" />
                      )}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          Installment {inst.installmentNo}: {inst.name || `Tranche ${inst.installmentNo}`}
                        </p>
                        {isPaid && disMatch.referenceCode && (
                          <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500, margin: '2px 0 0' }}>
                            ✓ Paid on {fmtDate(disMatch.disbursedAt || disMatch.createdAt)} · Ref: {disMatch.referenceCode}
                          </p>
                        )}
                        {!isPaid && (
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                            Scheduled for administrative treasury release
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="font-tabular"
                        style={{ fontSize: 14, fontWeight: 700, color: isPaid ? 'var(--success)' : 'var(--text-primary)' }}
                      >
                        ₹{inst.amount.toLocaleString('en-IN')}
                      </span>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: isPaid ? 'var(--success)' : 'var(--warning)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          margin: '2px 0 0'
                        }}
                      >
                        {isPaid ? 'Disbursed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '12px 16px',
                background: app.disbursedAmount > 0 ? 'var(--success-subtle)' : 'var(--bg-canvas)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${app.disbursedAmount > 0 ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  One-Time Treasury Disbursement
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {app.disbursedAmount > 0
                    ? `Disbursed on ${fmtDate(app.disbursementDate || app.updatedAt)}`
                    : 'Awaiting release by scholarship authority'}
                </p>
              </div>
              <span
                className="font-tabular"
                style={{ fontSize: 14, fontWeight: 700, color: app.disbursedAmount > 0 ? 'var(--success)' : 'var(--warning)' }}
              >
                {app.disbursedAmount > 0 ? 'DISBURSED' : 'PENDING'}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Application Readiness Card */}
      {data?.readiness && isDraft && (
        <div>
          <ReadinessCard readiness={data.readiness} />
        </div>
      )}

      {/* Draft Stepper Tabs */}
      {isDraft ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { step: 1, label: '1. Profile Prefill' },
            { step: 2, label: '2. Document Verification' },
            { step: 3, label: '3. Declaration & Submit' }
          ].map((s) => {
            const isActive = activeStep === s.step
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step as any)}
                style={{
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Hidden file upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f && currentUploadRdId.current) {
            const rd = sch.requiredDocuments?.find((r: any) => r.id === currentUploadRdId.current)
            if (rd) {
              handleInSituUpload(rd.id, rd.documentType, rd.label, f)
            }
          }
          if (e.target) e.target.value = ''
        }}
      />

      {/* Step 1 / Post-Submit: Profile Prefill Review */}
      {(isDraft ? activeStep === 1 : true) && (
        <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="var(--success)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                {isDraft ? 'Auto-Prefilled Candidate Dossier' : 'Submitted Candidate Dossier'}
              </h3>
            </div>
            {isDraft && (
              <Button size="sm" variant="ghost" onClick={() => navigate('/profile')}>
                Edit in Profile
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              ['Applicant Name', prefill?.fullName],
              ['Email Address', prefill?.email],
              ['Phone Number', prefill?.phone],
              ['Date of Birth', prefill?.dateOfBirth ? new Date(prefill.dateOfBirth).toLocaleDateString('en-IN') : null],
              ['Gender', prefill?.gender],
              ['Category', prefill?.category],
              ['Domicile State', prefill?.domicileState],
              [
                'Family Income',
                prefill?.familyInfo?.annualFamilyIncome
                  ? `₹${prefill.familyInfo.annualFamilyIncome.toLocaleString('en-IN')}`
                  : null
              ],
              ['Address', prefill?.address]
            ].map(([label, val]) => (
              <div
                key={label as string}
                style={{
                  background: 'var(--bg-canvas)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    margin: '0 0 3px'
                  }}
                >
                  {label}
                </p>
                <p
                  className="font-tabular"
                  style={{
                    fontSize: 13,
                    fontWeight: val ? 600 : 400,
                    color: val ? 'var(--text-primary)' : 'var(--text-muted)',
                    margin: 0
                  }}
                >
                  {val ?? 'Not provided'}
                </p>
              </div>
            ))}
          </div>

          {isDraft && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <Button onClick={() => setActiveStep(2)} variant="primary" rightIcon={<ChevronRight size={14} />}>
                Continue to Document Verification
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 2 / Post-Submit: Required Documents Status */}
      {(isDraft ? activeStep === 2 : true) && (
        <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="var(--primary)" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                {isDraft ? 'Required Document Verification' : 'Attached Application Credentials'}
              </h3>
            </div>
            <span className="font-tabular" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {Object.keys(attMap).length} / {sch.requiredDocuments?.length ?? 0} attached
            </span>
          </div>

          {sch.requiredDocuments?.length === 0 ? (
            <div
              style={{
                background: 'var(--success-subtle)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                color: 'var(--success)',
                fontSize: 13
              }}
            >
              ✓ This scholarship does not require document attachments. You can proceed directly to declaration!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(sch.requiredDocuments ?? []).map((rd: any) => {
                const linkedDoc = attMap[rd.id]
                const availableInVault = (myDocs?.documents ?? []).filter((d: Document) => d.type === rd.documentType)

                return (
                  <div
                    key={rd.id}
                    style={{
                      padding: 14,
                      background: linkedDoc ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${linkedDoc ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          {rd.label}
                        </p>
                        {rd.isOptional ? (
                          <Badge variant="default" size="sm">
                            Optional
                          </Badge>
                        ) : (
                          <Badge variant="error" size="sm">
                            Required
                          </Badge>
                        )}
                      </div>

                      {linkedDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <CheckCircle2 size={15} color="var(--success)" />
                          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
                            Attached: {linkedDoc.fileName}
                          </span>
                          <StatusBadge status={linkedDoc.status} />
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: 'var(--error)', margin: '4px 0 0' }}>
                          ⚠️ Missing. Attach from your vault or upload a new copy.
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {linkedDoc && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<ExternalLink size={12} />}
                          onClick={() => setViewingDoc({ id: linkedDoc.id, title: linkedDoc.label || rd.label })}
                        >
                          View
                        </Button>
                      )}

                      {isDraft && (
                        <>
                          {availableInVault.length > 0 && !linkedDoc && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => attachVaultDoc(rd.id, availableInVault[0].id)}
                              leftIcon={<Check size={13} />}
                            >
                              Use Vault File
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={uploadingForRd === rd.id}
                            onClick={() => {
                              currentUploadRdId.current = rd.id
                              fileInputRef.current?.click()
                            }}
                            leftIcon={<Upload size={13} />}
                          >
                            {linkedDoc ? 'Re-upload' : 'Upload File'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {isDraft && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <Button variant="ghost" onClick={() => setActiveStep(1)} leftIcon={<ArrowLeft size={14} />}>
                Back to Profile
              </Button>
              <Button onClick={() => setActiveStep(3)} variant="primary" rightIcon={<ChevronRight size={14} />}>
                Proceed to Declaration & Submit
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Declaration & Final Submission (Draft) */}
      {isDraft && activeStep === 3 && (
        <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            Candidate Declaration & Submission Confirmation
          </h3>

          <div
            style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 18
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              I hereby certify that all particulars furnished and all documents attached are genuine, correct, and complete to the best of my knowledge. I understand that if any statement or document is found to be false or fabricated, my scholarship will be forfeited, and I shall be subject to legal proceedings.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <input
                type="checkbox"
                id="decl"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                style={{ width: 17, height: 17, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="decl" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                I agree to the declaration and authorize Vidyut to forward my application to the scholarship committee.
              </label>
            </div>
          </div>

          {!allRequiredAttached && (
            <div
              style={{
                background: 'var(--error-subtle)',
                border: '1px solid var(--error-border)',
                color: 'var(--error)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                marginBottom: 16,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={16} />
              Please attach all mandatory required credentials in Step 2 before submitting.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="ghost" onClick={() => setActiveStep(2)} leftIcon={<ArrowLeft size={14} />}>
              Back to Documents
            </Button>
            <Button
              size="lg"
              variant="primary"
              isLoading={submitting}
              disabled={!canSubmit || !declarationAccepted}
              onClick={() => submitApp()}
              leftIcon={<Send size={15} />}
            >
              Submit Application Now
            </Button>
          </div>
        </Card>
      )}

      {/* Post-Submit Status History Timeline */}
      {!isDraft && (
        <>
          {/* DBT Installments Tracker for Approved Scholarships */}
          {app.status === 'APPROVED' && (
            <Card style={{ marginBottom: 16, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--success-subtle)',
                      border: '1px solid var(--success-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success)'
                    }}
                  >
                    <Banknote size={19} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                      Direct Benefit Transfer (DBT) Installments
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Official bank disbursement schedule and tranche audit records.
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Grant Total
                  </span>
                  <p className="font-tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    ₹{(app.scholarship?.amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Tranche Summary */}
              <div style={{ marginBottom: 18, background: 'var(--bg-canvas)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Disbursed: <strong className="font-tabular" style={{ color: 'var(--success)' }}>₹{(app.disbursedAmount || 0).toLocaleString('en-IN')}</strong> of ₹{(app.scholarship?.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="font-tabular" style={{ fontWeight: 700, color: (app.disbursedAmount || 0) >= (app.scholarship?.amount || 0) ? 'var(--success)' : 'var(--brand-primary)' }}>
                    {Math.round(((app.disbursedAmount || 0) / (app.scholarship?.amount || 1)) * 100)}% Settled
                  </span>
                </div>
                <ProgressBar
                  value={(app.disbursedAmount || 0) >= (app.scholarship?.amount || 0) ? 100 : Math.round(((app.disbursedAmount || 0) / (app.scholarship?.amount || 1)) * 100)}
                />
              </div>

              {/* Installment Tranches List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {app.disbursements && app.disbursements.length > 0 ? (
                  app.disbursements.map((d: any, idx: number) => {
                    const isPaid = d.status === 'DISBURSED'
                    return (
                      <div
                        key={d.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: isPaid ? 'var(--success-subtle)' : 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isPaid ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                          flexWrap: 'wrap',
                          gap: 10
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                              Installment {d.installmentNo || idx + 1}: {d.notes || `Tranche ${d.installmentNo || idx + 1}`}
                            </p>
                            <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                              {isPaid ? 'DISBURSED' : 'SCHEDULED'}
                            </Badge>
                          </div>
                          {isPaid && d.referenceCode && (
                            <p style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 500, margin: '3px 0 0' }}>
                              ✓ Transferred on {new Date(d.disbursedAt || d.createdAt).toLocaleDateString('en-IN')} · Ref: {d.referenceCode}
                            </p>
                          )}
                          {!isPaid && (
                            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                              Scheduled tranche awaiting treasury release upon semester verification.
                            </p>
                          )}
                        </div>

                        <span
                          className="font-tabular"
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: isPaid ? 'var(--success)' : 'var(--text-primary)'
                          }}
                        >
                          ₹{d.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ padding: '14px 16px', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {app.disbursedAmount ? 'One-Time Grant Transfer' : 'Scheduled Award Payout'}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {app.disbursedAmount
                          ? `Disbursed to candidate bank account on ${new Date(app.disbursementDate || app.updatedAt).toLocaleDateString('en-IN')}`
                          : 'Award verified by scholarship directorate. Bank transfer tranche pending.'}
                      </p>
                    </div>
                    <span className="font-tabular" style={{ fontSize: 15, fontWeight: 700, color: app.disbursedAmount ? 'var(--success)' : 'var(--text-primary)' }}>
                      ₹{(app.disbursedAmount || app.scholarship?.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' }}>
            <Clock size={16} color="var(--primary)" /> Application Audit Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {app.statusHistory?.map((h: any, i: number) => (
              <div key={h.id} style={{ display: 'flex', gap: 14, paddingBottom: i < app.statusHistory.length - 1 ? 18 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--success-subtle)',
                      border: '2px solid var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={12} color="var(--success)" />
                  </div>
                  {i < app.statusHistory.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: 'var(--border-subtle)', marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 2 }}>
                    <StatusBadge status={h.toStatus} />
                    <span className="font-tabular" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {fmtDate(h.changedAt)}
                    </span>
                    {h.changedByUser?.fullName && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        by {h.changedByUser.fullName}
                      </span>
                    )}
                  </div>
                  {h.note && <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '4px 0 0' }}>{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </>
      )}

      {viewingDoc && (
        <DocumentViewerModal
          documentId={viewingDoc.id}
          documentTitle={viewingDoc.title}
          onClose={() => setViewingDoc(null)}
          onDocumentUpdated={() => {
            refetch()
            refetchDocs()
          }}
        />
      )}
    </motion.div>
  )
}
