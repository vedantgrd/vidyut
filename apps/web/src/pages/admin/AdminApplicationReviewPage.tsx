import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  UserCheck,
  Banknote,
  Plus,
  Trash2,
  Settings2,
  Check
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { useMutation } from '@/hooks/useMutation'
import { api } from '@/api/client'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/Toast'
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal'

interface InstallmentRow {
  installmentNo: number
  amount: number | ''
  name: string
  notes?: string
  expectedDate?: string
}

export function AdminApplicationReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewingDoc, setViewingDoc] = useState<{ id: string; title: string } | null>(null)

  // Disbursement modal state
  const [disburseModal, setDisburseModal] = useState<{
    installmentNo?: number
    installmentId?: string
    amount: number
    name: string
  } | null>(null)
  const [disburseRef, setDisburseRef] = useState('')
  const [disburseNotes, setDisburseNotes] = useState('')

  // Schedule editor state
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [scheduleDraft, setScheduleDraft] = useState<InstallmentRow[]>([])

  const { data, isLoading, refetch } = useApi(
    () => api.get<{ application: any; studentProfile: any; familyInfo: any; academicRecords: any[] }>(`/admin/applications/${id}`),
    [id]
  )

  const app = data?.application

  // Initialize schedule draft when entering edit mode or when application loads
  useEffect(() => {
    if (app && app.status === 'APPROVED') {
      const existingDisb = app.disbursements || []
      if (existingDisb.length > 0) {
        setScheduleDraft(
          existingDisb.map((d: any) => ({
            installmentNo: d.installmentNo || 1,
            amount: d.amount,
            name: d.notes || `Installment ${d.installmentNo || 1}`,
            notes: d.notes || '',
            expectedDate: d.disbursedAt ? new Date(d.disbursedAt).toISOString().slice(0, 10) : ''
          }))
        )
      } else {
        // Default to a 2-tranche 50/50 MahaDBT schedule
        const total = app.scholarship?.amount || 0
        const half = Math.floor(total / 2)
        setScheduleDraft([
          {
            installmentNo: 1,
            amount: half,
            name: 'Tranche 1: Academic Fee Reimbursement'
          },
          {
            installmentNo: 2,
            amount: total - half,
            name: 'Tranche 2: Maintenance & Study Allowance'
          }
        ])
      }
    }
  }, [app])

  const { mutate: review, isLoading: reviewing } = useMutation(async (status: string) => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      toast('Please enter a rejection reason before rejecting', 'error')
      return
    }
    try {
      await api.patch(`/admin/applications/${id}/review`, {
        status,
        note: note.trim() || undefined,
        rejectionReason: rejectionReason.trim() || undefined
      })
      await refetch()
      toast(`Application status updated to ${status.replace(/_/g, ' ').toLowerCase()}`, 'success')
      setNote('')
      setRejectionReason('')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  // Save Installment Schedule mutation
  const { mutate: saveSchedule, isLoading: savingSchedule } = useMutation(async () => {
    if (!app) return
    const cleanedInstallments = scheduleDraft.map((s, idx) => ({
      installmentNo: idx + 1,
      amount: Number(s.amount),
      name: s.name.trim() || `Installment ${idx + 1}`,
      notes: s.notes?.trim() || undefined,
      expectedDate: s.expectedDate || undefined
    }))

    try {
      await api.post(`/admin/applications/${id}/schedule`, {
        installments: cleanedInstallments
      })
      await refetch()
      toast('Disbursement schedule saved and reconciled successfully', 'success')
      setIsEditingSchedule(false)
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  // Record Disbursement mutation
  const { mutate: recordDisbursement, isLoading: disbursing } = useMutation(async () => {
    if (!disburseModal) return
    try {
      await api.post(`/admin/applications/${id}/disburse`, {
        installmentNo: disburseModal.installmentNo,
        installmentId: disburseModal.installmentId,
        amount: disburseModal.amount,
        referenceCode: disburseRef.trim() || undefined,
        notes: disburseNotes.trim() || undefined
      })
      await refetch()
      toast(`Disbursement of ₹${disburseModal.amount.toLocaleString('en-IN')} recorded successfully!`, 'success')
      setDisburseModal(null)
      setDisburseRef('')
      setDisburseNotes('')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  })

  if (isLoading) return <PageSpinner />
  if (!app) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Application not found.</div>

  const { studentProfile: sp, familyInfo: fi, academicRecords: ar } = data
  const isDraft = app.status === 'DRAFT'
  const scholarshipAmount = app.scholarship?.amount || 0
  const totalDisbursed = app.disbursedAmount || 0
  const remainingToDisburse = Math.max(0, scholarshipAmount - totalDisbursed)

  // Reconciliation calculations for schedule draft
  const draftTotalAllocated = scheduleDraft.reduce((acc, row) => acc + (Number(row.amount) || 0), 0)
  const draftDifference = scholarshipAmount - draftTotalAllocated
  const isDraftReconciled = draftDifference === 0 && scheduleDraft.length > 0 && scheduleDraft.every(r => Number(r.amount) > 0)

  // Presets helper
  const applyPreset = (presetType: 'ONE_TIME' | 'MAHADBT_50_50' | 'MAHADBT_60_40' | 'THREE_TRANCHES') => {
    if (presetType === 'ONE_TIME') {
      setScheduleDraft([
        {
          installmentNo: 1,
          amount: scholarshipAmount,
          name: 'Full Scholarship Grant'
        }
      ])
    } else if (presetType === 'MAHADBT_50_50') {
      const half = Math.floor(scholarshipAmount / 2)
      setScheduleDraft([
        {
          installmentNo: 1,
          amount: half,
          name: 'Tranche 1: Academic Fee Reimbursement'
        },
        {
          installmentNo: 2,
          amount: scholarshipAmount - half,
          name: 'Tranche 2: Maintenance & Study Allowance'
        }
      ])
    } else if (presetType === 'MAHADBT_60_40') {
      const p60 = Math.round(scholarshipAmount * 0.6)
      setScheduleDraft([
        {
          installmentNo: 1,
          amount: p60,
          name: 'Tranche 1: Primary Academic Grant (60%)'
        },
        {
          installmentNo: 2,
          amount: scholarshipAmount - p60,
          name: 'Tranche 2: Performance & Midterm Grant (40%)'
        }
      ])
    } else if (presetType === 'THREE_TRANCHES') {
      const t1 = Math.round(scholarshipAmount * 0.4)
      const t2 = Math.round(scholarshipAmount * 0.3)
      setScheduleDraft([
        {
          installmentNo: 1,
          amount: t1,
          name: 'Tranche 1: Semester 1 Grant (40%)'
        },
        {
          installmentNo: 2,
          amount: t2,
          name: 'Tranche 2: Semester 2 Grant (30%)'
        },
        {
          installmentNo: 3,
          amount: scholarshipAmount - t1 - t2,
          name: 'Tranche 3: Project & Book Grant (30%)'
        }
      ])
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 60 }}>
      <button
        onClick={() => navigate('/admin/applications')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary, #657084)',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 18,
          padding: 0
        }}
      >
        <ArrowLeft size={15} /> Back to Application Queue
      </button>

      {/* Header Summary Card */}
      <Card
        style={{
          marginBottom: 20,
          border: '1px solid var(--border-subtle, #E7E9EE)',
          background: 'var(--surface-1, #FFFFFF)',
          padding: 22
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <StatusBadge status={app.status} />
              <span className="font-tabular" style={{ fontSize: 12, color: 'var(--text-muted, #8A93A3)' }}>
                Tracking ID: {app.id}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {app.scholarship?.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #657084)', margin: 0 }}>
              Applicant: <strong>{app.user?.fullName}</strong> ({app.user?.email}) · Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : 'Not submitted'}
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              background: 'var(--brand-subtle, #EDF3FC)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--brand-border, rgba(49, 94, 170, 0.22))'
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-primary, #315EAA)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Approved Award Value
            </span>
            <p className="font-tabular" style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-primary, #315EAA)', margin: '2px 0 0' }}>
              ₹{scholarshipAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </Card>

      {/* Candidate Dossier Overview (Personal, Academic, Family) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Personal Details */}
        <Card style={{ border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 18 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={15} color="var(--brand-primary, #315EAA)" /> Candidate Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-secondary, #657084)' }}>
            <div>Category: <strong style={{ color: 'var(--text-primary)' }}>{sp?.category || 'Not specified'}</strong></div>
            <div>Domicile State: <strong style={{ color: 'var(--text-primary)' }}>{sp?.domicileState || 'Not specified'}</strong></div>
            <div>Phone: <span className="font-tabular" style={{ color: 'var(--text-primary)' }}>{sp?.phone || 'Not specified'}</span></div>
            <div>Gender: <span style={{ color: 'var(--text-primary)' }}>{sp?.gender || 'Not specified'}</span></div>
          </div>
        </Card>

        {/* Financial Info */}
        <Card style={{ border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 18 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Banknote size={15} color="var(--success, #247A55)" /> Family & Income
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-secondary, #657084)' }}>
            <div>Annual Income: <strong className="font-tabular" style={{ color: 'var(--text-primary)' }}>₹{(fi?.annualFamilyIncome || 0).toLocaleString('en-IN')}</strong></div>
            <div>Father: <span style={{ color: 'var(--text-primary)' }}>{fi?.fatherName || 'Not specified'} ({fi?.fatherOccupation || 'N/A'})</span></div>
            <div>Mother: <span style={{ color: 'var(--text-primary)' }}>{fi?.motherName || 'Not specified'} ({fi?.motherOccupation || 'N/A'})</span></div>
            <div>BPL Status: <span style={{ color: 'var(--text-primary)' }}>{fi?.isBPL ? 'Yes (Below Poverty Line)' : 'No'}</span></div>
          </div>
        </Card>

        {/* Academic Qualification */}
        <Card style={{ border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 18 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={15} color="var(--brand-primary, #315EAA)" /> Academic Track
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-secondary, #657084)' }}>
            {ar?.map((r: any, idx: number) => (
              <div key={idx} style={{ paddingBottom: 4, borderBottom: idx < ar.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.level?.replace(/_/g, ' ')}</span>
                  <span className="font-tabular" style={{ color: 'var(--success, #247A55)', fontWeight: 600 }}>
                    {r.percentage != null ? `${r.percentage}%` : r.cgpa != null ? `CGPA ${r.cgpa}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.institutionName}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Submitted Credentials Section */}
      <Card style={{ marginBottom: 20, border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: '0 0 14px' }}>
          Submitted Application Credentials ({app.documents?.length ?? 0})
        </h3>
        {!app.documents?.length ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No documents attached to this application.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {app.documents.map((d: any) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-canvas, #FAFAF8)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-subtle, #E7E9EE)',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #172033)', margin: 0 }}>
                      {d.document?.label}
                    </p>
                    <StatusBadge status={d.document?.status} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary, #657084)', margin: '3px 0 0' }}>
                    {d.document?.fileName} · {(d.document?.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>

                {d.document?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ExternalLink size={12} />}
                    onClick={() => setViewingDoc({ id: d.document.id, title: `${d.document.label} - ${app.user?.fullName || 'Applicant'}` })}
                  >
                    View Document
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Decision Controls */}
      {!isDraft && (
        <Card style={{ marginBottom: 20, border: '1px solid var(--border-subtle, #E7E9EE)', background: 'var(--surface-1, #FFFFFF)', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: '0 0 14px' }}>
            Officer Decision & Status Updates
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Reviewer Internal / Feedback Note
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Provide constructive feedback or audit notes visible to candidate..."
                style={{
                  width: '100%',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--error, #B83E45)', display: 'block', marginBottom: 4 }}>
                Rejection Reason (Mandatory if marking REJECTED)
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="State explicit grounds for rejection (e.g. Income exceeds eligibility threshold)..."
                style={{
                  width: '100%',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {app.status === 'SUBMITTED' && (
              <Button size="sm" variant="secondary" isLoading={reviewing} onClick={() => review('DOCUMENTS_VERIFIED')} leftIcon={<CheckCircle2 size={14} />}>
                Mark Documents Verified
              </Button>
            )}
            {['SUBMITTED', 'DOCUMENTS_VERIFIED'].includes(app.status) && (
              <Button size="sm" isLoading={reviewing} onClick={() => review('UNDER_REVIEW')} leftIcon={<Clock size={14} />}>
                Mark Under Review
              </Button>
            )}
            {!['APPROVED', 'REJECTED'].includes(app.status) && (
              <>
                <Button size="sm" variant="outline" isLoading={reviewing} onClick={() => review('ADDITIONAL_INFO_REQUESTED')} leftIcon={<AlertCircle size={14} />}>
                  Request Additional Info
                </Button>
                <Button size="sm" isLoading={reviewing} onClick={() => review('APPROVED')} leftIcon={<CheckCircle2 size={14} />} style={{ background: 'var(--success, #247A55)', color: '#ffffff' }}>
                  Approve Application
                </Button>
                <Button size="sm" variant="danger" isLoading={reviewing} onClick={() => review('REJECTED')} leftIcon={<XCircle size={14} />}>
                  Reject Application
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================
          MULTI-INSTALLMENT DISBURSEMENT (DBT) WORKSPACE
          ======================================================== */}
      {app.status === 'APPROVED' ? (
        <Card
          style={{
            marginBottom: 20,
            border: '1px solid var(--border-subtle, #E7E9EE)',
            background: 'var(--surface-1, #FFFFFF)',
            padding: 22
          }}
        >
          {/* Header & Treasury Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Banknote size={18} color="var(--success, #247A55)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: 0 }}>
                  Multi-Installment Disbursement & DBT Treasury
                </h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #657084)', margin: '4px 0 0' }}>
                Configure multi-tranche disbursement schedules and record Direct Benefit Transfer payouts with full audit trail.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {!isEditingSchedule && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Settings2 size={13} />}
                  onClick={() => setIsEditingSchedule(true)}
                >
                  Configure Schedule
                </Button>
              )}
            </div>
          </div>

          {/* Reconciliation Balance Meter */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              background: 'var(--bg-canvas, #FAFAF8)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-subtle, #E7E9EE)',
              marginBottom: 20
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Approved Award
              </span>
              <p className="font-tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                ₹{scholarshipAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--success, #247A55)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Disbursed
              </span>
              <p className="font-tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--success, #247A55)', margin: '2px 0 0' }}>
                ₹{totalDisbursed.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--warning, #996416)', fontWeight: 600, textTransform: 'uppercase' }}>
                Pending Disbursement
              </span>
              <p className="font-tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning, #996416)', margin: '2px 0 0' }}>
                ₹{remainingToDisburse.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--brand-primary, #315EAA)', fontWeight: 600, textTransform: 'uppercase' }}>
                Settlement Status
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: totalDisbursed >= scholarshipAmount ? 'var(--success)' : totalDisbursed > 0 ? 'var(--brand-primary)' : 'var(--text-secondary)', margin: '4px 0 0' }}>
                {totalDisbursed >= scholarshipAmount
                  ? '✓ 100% Fully Settled'
                  : totalDisbursed > 0
                  ? `${Math.round((totalDisbursed / scholarshipAmount) * 100)}% Disbursed`
                  : 'Pending First Tranche'}
              </p>
            </div>
          </div>

          {/* ========================================================
              MODE A: SCHEDULE EDITOR (Interactive Tranche Builder)
              ======================================================== */}
          {isEditingSchedule ? (
            <div
              style={{
                border: '1px solid var(--brand-border, rgba(49, 94, 170, 0.22))',
                borderRadius: 'var(--radius-lg, 12px)',
                background: '#FFFFFF',
                padding: 18,
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Configure Disbursement Schedule
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Define the number of tranches, amounts, and planned timeline. All installments must reconcile with the approved award.
                  </p>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Button size="sm" variant="ghost" onClick={() => applyPreset('ONE_TIME')} style={{ fontSize: 11.5 }}>
                    1 Tranche (100%)
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyPreset('MAHADBT_50_50')} style={{ fontSize: 11.5 }}>
                    MahaDBT 2-Tranche (50/50)
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyPreset('MAHADBT_60_40')} style={{ fontSize: 11.5 }}>
                    MahaDBT (60/40)
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyPreset('THREE_TRANCHES')} style={{ fontSize: 11.5 }}>
                    3 Tranches
                  </Button>
                </div>
              </div>

              {/* Installments Table / List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {scheduleDraft.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1.5fr 1fr 1fr 40px',
                      gap: 10,
                      alignItems: 'center',
                      background: 'var(--bg-canvas, #FAFAF8)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid var(--border-subtle, #E7E9EE)'
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      #{idx + 1}
                    </span>
                    <input
                      value={row.name}
                      onChange={e => {
                        const updated = [...scheduleDraft]
                        updated[idx].name = e.target.value
                        setScheduleDraft(updated)
                      }}
                      placeholder="Tranche Name / Purpose"
                      style={{
                        height: 34,
                        padding: '0 10px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        fontSize: 12.5,
                        outline: 'none'
                      }}
                    />
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 8, top: 8, fontSize: 12, color: 'var(--text-secondary)' }}>₹</span>
                      <input
                        type="number"
                        value={row.amount}
                        onChange={e => {
                          const updated = [...scheduleDraft]
                          updated[idx].amount = e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0
                          setScheduleDraft(updated)
                        }}
                        placeholder="Amount"
                        className="font-tabular"
                        style={{
                          height: 34,
                          padding: '0 10px 0 22px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          width: '100%',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <input
                      type="date"
                      value={row.expectedDate || ''}
                      onChange={e => {
                        const updated = [...scheduleDraft]
                        updated[idx].expectedDate = e.target.value
                        setScheduleDraft(updated)
                      }}
                      style={{
                        height: 34,
                        padding: '0 8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        outline: 'none'
                      }}
                    />
                    {scheduleDraft.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = scheduleDraft.filter((_, i) => i !== idx)
                          setScheduleDraft(updated)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--error, #B83E45)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 4
                        }}
                        title="Remove tranche"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>

              {/* Add row & Reconciliation status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus size={13} />}
                  onClick={() => {
                    setScheduleDraft([
                      ...scheduleDraft,
                      {
                        installmentNo: scheduleDraft.length + 1,
                        amount: draftDifference > 0 ? draftDifference : 0,
                        name: `Tranche ${scheduleDraft.length + 1}`
                      }
                    ])
                  }}
                >
                  Add Another Tranche
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="font-tabular" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Total: <strong>₹{draftTotalAllocated.toLocaleString('en-IN')}</strong> / ₹{scholarshipAmount.toLocaleString('en-IN')}
                  </span>
                  {isDraftReconciled ? (
                    <Badge variant="success" size="sm">
                      ✓ Reconciled (₹0 remaining)
                    </Badge>
                  ) : draftDifference > 0 ? (
                    <Badge variant="warning" size="sm">
                      Unallocated: ₹{draftDifference.toLocaleString('en-IN')}
                    </Badge>
                  ) : (
                    <Badge variant="error" size="sm">
                      Over-allocated by ₹{Math.abs(draftDifference).toLocaleString('en-IN')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingSchedule(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={savingSchedule}
                  disabled={!isDraftReconciled}
                  onClick={() => saveSchedule()}
                >
                  Save & Finalize Schedule
                </Button>
              </div>
            </div>
          ) : (
            /* ========================================================
               MODE B: ACTIVE TRANCHE DISBURSEMENT TRACKER
               ======================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {app.disbursements && app.disbursements.length > 0 ? (
                app.disbursements.map((inst: any, idx: number) => {
                  const isPaid = inst.status === 'DISBURSED'
                  return (
                    <div
                      key={inst.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: isPaid ? 'var(--success-subtle, #EAF5EF)' : 'var(--bg-canvas, #FAFAF8)',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: `1px solid ${isPaid ? 'var(--success-border, rgba(36, 122, 85, 0.2))' : 'var(--border-subtle, #E7E9EE)'}`,
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Installment {inst.installmentNo || idx + 1}: {inst.notes || `Tranche ${inst.installmentNo || idx + 1}`}
                          </p>
                          <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                            {isPaid ? 'DISBURSED' : 'SCHEDULED / PENDING'}
                          </Badge>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                          Tranche Amount: <strong className="font-tabular" style={{ color: isPaid ? 'var(--success)' : 'var(--text-primary)' }}>₹{inst.amount.toLocaleString('en-IN')}</strong>
                        </p>
                        {isPaid && inst.referenceCode && (
                          <p style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 600, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={12} /> Disbursed on {new Date(inst.disbursedAt || inst.createdAt).toLocaleDateString('en-IN')} · Ref: {inst.referenceCode} {inst.notes ? `· ${inst.notes}` : ''}
                          </p>
                        )}
                      </div>

                      <div>
                        {!isPaid ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setDisburseModal({
                                installmentNo: inst.installmentNo || idx + 1,
                                installmentId: inst.id,
                                amount: inst.amount,
                                name: `Installment ${inst.installmentNo || idx + 1}: ${inst.notes || 'Tranche'}`
                              })
                              setDisburseRef(`DBT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`)
                            }}
                          >
                            Record Disbursement
                          </Button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Complete
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                /* Unconfigured state helper */
                <div
                  style={{
                    padding: '24px 20px',
                    textAlign: 'center',
                    background: 'var(--bg-canvas, #FAFAF8)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px dashed var(--border-default, #E7E9EE)'
                  }}
                >
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    No disbursement schedule configured yet for this ₹{scholarshipAmount.toLocaleString('en-IN')} award.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Plus size={13} />}
                    onClick={() => setIsEditingSchedule(true)}
                  >
                    Configure 2-Tranche or Custom Schedule
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ marginBottom: 20, border: '1px solid var(--border-subtle)', background: 'var(--surface-1)', padding: 18 }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            ℹ️ Direct Benefit Transfer (DBT) disbursement and installment scheduling unlock automatically once the application is marked <strong>APPROVED</strong>.
          </p>
        </Card>
      )}

      {/* Disburse Confirmation Modal */}
      {disburseModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 32, 51, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setDisburseModal(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-1, #FFFFFF)',
              borderRadius: 'var(--radius-lg, 12px)',
              boxShadow: 'var(--shadow-lg, 0 12px 24px -4px rgba(16, 24, 40, 0.08))',
              width: '100%',
              maxWidth: 480,
              padding: 24,
              border: '1px solid var(--border-subtle, #E7E9EE)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'var(--success-subtle, #EAF5EF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success, #247A55)'
                }}
              >
                <Banknote size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: 0 }}>
                  Record DBT Disbursement
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary, #657084)', margin: '2px 0 0' }}>
                  Candidate: <strong>{app.user?.fullName}</strong>
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-canvas, #FAFAF8)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-subtle, #E7E9EE)',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Target Tranche:</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{disburseModal.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Payout Amount:</span>
                <span className="font-tabular" style={{ fontSize: 16, fontWeight: 700, color: 'var(--success, #247A55)' }}>
                  ₹{disburseModal.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Transaction / DBT Reference Code
                </label>
                <input
                  value={disburseRef}
                  onChange={e => setDisburseRef(e.target.value)}
                  placeholder="e.g. DBT-2026-948102"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 12px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-default, #E7E9EE)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Audit Note / Bank Advice Details
                </label>
                <input
                  value={disburseNotes}
                  onChange={e => setDisburseNotes(e.target.value)}
                  placeholder="e.g. NEFT transfer processed via Treasury Account"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 12px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-default, #E7E9EE)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setDisburseModal(null)}>
                Cancel
              </Button>
              <Button
                isLoading={disbursing}
                onClick={() => recordDisbursement()}
                style={{ background: 'var(--success, #247A55)', color: '#ffffff' }}
              >
                Confirm Payout Recorded
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewingDoc && (
        <DocumentViewerModal
          documentId={viewingDoc.id}
          documentTitle={viewingDoc.title}
          onClose={() => setViewingDoc(null)}
          onDocumentUpdated={refetch}
        />
      )}
    </div>
  )
}
