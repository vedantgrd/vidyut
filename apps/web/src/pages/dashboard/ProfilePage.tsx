import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { User, GraduationCap, Home, Edit3, Plus, Trash2, X, Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { toast } from '@/components/ui/Toast'
import type { StudentProfile, FamilyInfo, AcademicRecord } from '@/types'

interface ProfileData {
  user: { fullName: string; email: string }
  studentProfile: StudentProfile | null
  familyInfo: FamilyInfo | null
  academicRecords: AcademicRecord[]
  profileScore: number
}

const LL: Record<string, string> = {
  CLASS_10: 'Class 10',
  CLASS_12: 'Class 12',
  DIPLOMA: 'Diploma',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
  DOCTORATE: 'Doctorate',
  OTHER: 'Other'
}

const CATS = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER'].map((v) => ({ value: v, label: v }))
const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
]
const ACAD_LEVELS = [
  { value: 'CLASS_10', label: 'Class 10' },
  { value: 'CLASS_12', label: 'Class 12' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'OTHER', label: 'Other' }
]

export function ProfilePage() {
  const { data, isLoading, refetch } = useApi(() => api.get<ProfileData>('/profile'))

  // Modal Edit States
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingFamily, setEditingFamily] = useState(false)
  const [editingAcademic, setEditingAcademic] = useState<string | null>(null) // level or 'NEW'
  const [saving, setSaving] = useState(false)

  // Personal Form State
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    domicileState: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  })

  // Family Form State
  const [familyForm, setFamilyForm] = useState({
    fatherName: '',
    fatherOccupation: '',
    fatherIncome: '',
    motherName: '',
    motherOccupation: '',
    annualFamilyIncome: '',
    numberOfDependents: '',
    isBPL: false
  })

  // Academic Form State
  const [academicForm, setAcademicForm] = useState({
    level: 'UNDERGRADUATE',
    institutionName: '',
    boardOrUniversity: '',
    courseName: '',
    branch: '',
    percentage: '',
    cgpa: '',
    maxCgpa: '10',
    passingYear: '',
    admissionYear: '',
    isCurrentlyPursuing: false
  })

  if (isLoading || !data) return <PageSpinner context="profile" />
  const { user, studentProfile: p, familyInfo: fi, academicRecords, profileScore } = data

  const openPersonalModal = () => {
    setPersonalForm({
      fullName: user.fullName || '',
      phone: p?.phone || '',
      dateOfBirth: p?.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: p?.gender || 'MALE',
      category: p?.category || 'GENERAL',
      domicileState: p?.domicileState || '',
      addressLine1: p?.addressLine1 || '',
      city: p?.city || '',
      state: p?.state || '',
      pincode: p?.pincode || ''
    })
    setEditingPersonal(true)
  }

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/profile/personal', {
        fullName: personalForm.fullName.trim(),
        phone: personalForm.phone.trim(),
        dateOfBirth: personalForm.dateOfBirth || null,
        gender: personalForm.gender,
        category: personalForm.category,
        domicileState: personalForm.domicileState.trim(),
        addressLine1: personalForm.addressLine1.trim(),
        city: personalForm.city.trim(),
        state: personalForm.state.trim(),
        pincode: personalForm.pincode.trim()
      })
      await refetch()
      toast('Personal details updated!', 'success')
      setEditingPersonal(false)
    } catch (err: unknown) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  const openFamilyModal = () => {
    setFamilyForm({
      fatherName: fi?.fatherName || '',
      fatherOccupation: fi?.fatherOccupation || '',
      fatherIncome: fi?.fatherIncome != null ? String(fi.fatherIncome) : '',
      motherName: fi?.motherName || '',
      motherOccupation: fi?.motherOccupation || '',
      annualFamilyIncome: fi?.annualFamilyIncome != null ? String(fi.annualFamilyIncome) : '',
      numberOfDependents: fi?.numberOfDependents != null ? String(fi.numberOfDependents) : '',
      isBPL: Boolean(fi?.isBPL)
    })
    setEditingFamily(true)
  }

  const saveFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/profile/family', {
        fatherName: familyForm.fatherName.trim() || null,
        fatherOccupation: familyForm.fatherOccupation.trim() || null,
        fatherIncome: familyForm.fatherIncome ? parseInt(familyForm.fatherIncome) : null,
        motherName: familyForm.motherName.trim() || null,
        motherOccupation: familyForm.motherOccupation.trim() || null,
        annualFamilyIncome: parseInt(familyForm.annualFamilyIncome),
        numberOfDependents: familyForm.numberOfDependents ? parseInt(familyForm.numberOfDependents) : null,
        isBPL: familyForm.isBPL
      })
      await refetch()
      toast('Family details updated!', 'success')
      setEditingFamily(false)
    } catch (err: unknown) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  const openAcademicModal = (record?: AcademicRecord) => {
    if (record) {
      setAcademicForm({
        level: record.level,
        institutionName: record.institutionName || '',
        boardOrUniversity: record.boardOrUniversity || '',
        courseName: record.courseName || '',
        branch: record.branch || '',
        percentage: record.percentage != null ? String(record.percentage) : '',
        cgpa: record.cgpa != null ? String(record.cgpa) : '',
        maxCgpa: record.maxCgpa != null ? String(record.maxCgpa) : '10',
        passingYear: record.passingYear != null ? String(record.passingYear) : '',
        admissionYear: record.admissionYear != null ? String(record.admissionYear) : '',
        isCurrentlyPursuing: Boolean(record.isCurrentlyPursuing)
      })
      setEditingAcademic(record.level)
    } else {
      setAcademicForm({
        level: 'UNDERGRADUATE',
        institutionName: '',
        boardOrUniversity: '',
        courseName: '',
        branch: '',
        percentage: '',
        cgpa: '',
        maxCgpa: '10',
        passingYear: '',
        admissionYear: '',
        isCurrentlyPursuing: false
      })
      setEditingAcademic('NEW')
    }
  }

  const saveAcademic = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/profile/academic/${academicForm.level}`, {
        institutionName: academicForm.institutionName.trim(),
        boardOrUniversity: academicForm.boardOrUniversity.trim() || null,
        courseName: academicForm.courseName.trim() || null,
        branch: academicForm.branch.trim() || null,
        percentage: academicForm.percentage ? parseFloat(academicForm.percentage) : null,
        cgpa: academicForm.cgpa ? parseFloat(academicForm.cgpa) : null,
        maxCgpa: academicForm.maxCgpa ? parseFloat(academicForm.maxCgpa) : 10,
        passingYear: academicForm.passingYear ? parseInt(academicForm.passingYear) : null,
        admissionYear: academicForm.admissionYear ? parseInt(academicForm.admissionYear) : null,
        isCurrentlyPursuing: academicForm.isCurrentlyPursuing
      })
      await refetch()
      toast('Academic record saved!', 'success')
      setEditingAcademic(null)
    } catch (err: unknown) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteAcademic = async (level: string) => {
    if (!window.confirm(`Are you sure you want to remove the ${LL[level] ?? level} academic record?`)) return
    try {
      await api.delete(`/profile/academic/${level}`)
      await refetch()
      toast('Academic record removed', 'info')
    } catch (err: unknown) {
      toast(err, 'error')
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Candidate Profile Dossier
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
            Single source of truth. Updates here automatically sync across all your future scholarship applications.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--accent-subtle)',
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid var(--accent-border)'
          }}
        >
          <ShieldCheck size={16} color="var(--primary)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
            Verified Identity Dossier
          </span>
        </div>
      </div>

      {/* Profile Completeness Bar */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Profile Match Readiness
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Higher scores unlock automatic preflight validation across all matched opportunities
            </p>
          </div>
          <Badge variant={profileScore >= 80 ? 'success' : profileScore >= 50 ? 'warning' : 'error'}>
            <span className="font-tabular">{profileScore}%</span> Complete
          </Badge>
        </div>
        <ProgressBar
          value={profileScore}
          height={8}
          color={profileScore >= 80 ? 'var(--success)' : profileScore >= 50 ? 'var(--warning)' : 'var(--error)'}
        />
      </Card>

      {/* Section 1: Personal Information */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
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
            <User size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Personal Details
            </h3>
          </div>
          <Button variant="outline" size="sm" onClick={openPersonalModal} leftIcon={<Edit3 size={13} />}>
            Edit Personal Info
          </Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            ['Full Name (Legal)', user.fullName],
            ['Email Address', user.email],
            ['Phone Number', p?.phone],
            ['Date of Birth', p?.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN') : null],
            ['Gender', p?.gender],
            ['Social Category', p?.category],
            ['Domicile State', p?.domicileState],
            ['City & State', p?.city && p?.state ? `${p.city}, ${p.state}` : p?.city || p?.state || null],
            ['Pincode', p?.pincode]
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
      </Card>

      {/* Section 2: Academic Records */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
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
            <GraduationCap size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Academic Records (<span className="font-tabular">{academicRecords.length}</span>)
            </h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => openAcademicModal()} leftIcon={<Plus size={13} />}>
            Add Qualification
          </Button>
        </div>
        {academicRecords.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No academic records added yet. Add your 10th, 12th, or College grades to match scholarship score thresholds.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {academicRecords.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: 14,
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
                      {LL[r.level] ?? r.level}
                    </p>
                    {r.isCurrentlyPursuing && (
                      <Badge variant="accent" size="sm">
                        Currently Pursuing
                      </Badge>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                    {r.institutionName}
                  </p>
                  {r.courseName && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {r.courseName}
                      {r.branch ? ` — ${r.branch}` : ''}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                    {r.percentage !== null && (
                      <span
                        className="font-tabular"
                        style={{
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-surface)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        Score: <strong>{r.percentage}%</strong>
                      </span>
                    )}
                    {r.cgpa !== null && (
                      <span
                        className="font-tabular"
                        style={{
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-surface)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        CGPA: <strong>{r.cgpa} / {r.maxCgpa ?? 10}</strong>
                      </span>
                    )}
                    {r.passingYear && (
                      <span className="font-tabular" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Passing Year: <strong>{r.passingYear}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button variant="ghost" size="sm" onClick={() => openAcademicModal(r)} leftIcon={<Edit3 size={12} />}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAcademic(r.level)}
                    leftIcon={<Trash2 size={12} />}
                    style={{ color: 'var(--error)' }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section 3: Family & Income Details */}
      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
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
            <Home size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Family & Financial Background
            </h3>
          </div>
          <Button variant="outline" size="sm" onClick={openFamilyModal} leftIcon={<Edit3 size={13} />}>
            Edit Family Info
          </Button>
        </div>
        {!fi?.annualFamilyIncome ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            Family background not provided. Required for need-based scholarships.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              ["Father's Name", fi.fatherName],
              ["Father's Occupation", fi.fatherOccupation],
              ["Father's Income", fi.fatherIncome ? `₹${fi.fatherIncome.toLocaleString('en-IN')}` : null],
              ["Mother's Name", fi.motherName],
              ["Mother's Occupation", fi.motherOccupation],
              ['Annual Family Income', `₹${fi.annualFamilyIncome.toLocaleString('en-IN')}`],
              ['Family Dependents', fi.numberOfDependents != null ? String(fi.numberOfDependents) : null],
              ['Below Poverty Line (BPL)', fi.isBPL ? 'Yes (BPL Card Holder)' : 'No']
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
        )}
      </Card>

      {/* Personal Edit Modal */}
      {editingPersonal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 32, 51, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              padding: 24
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Edit Personal Information
              </h3>
              <button
                onClick={() => setEditingPersonal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={savePersonal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Full Name *"
                value={personalForm.fullName}
                onChange={(e) => setPersonalForm((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Phone Number *"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                />
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={personalForm.dateOfBirth}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  required
                />
                <Select
                  label="Gender *"
                  options={GENDERS}
                  value={personalForm.gender}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, gender: e.target.value }))}
                />
                <Select
                  label="Category *"
                  options={CATS}
                  value={personalForm.category}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, category: e.target.value }))}
                />
              </div>
              <Input
                label="Domicile State *"
                value={personalForm.domicileState}
                onChange={(e) => setPersonalForm((p) => ({ ...p, domicileState: e.target.value }))}
                required
              />
              <Input
                label="Address Line 1 *"
                value={personalForm.addressLine1}
                onChange={(e) => setPersonalForm((p) => ({ ...p, addressLine1: e.target.value }))}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Input
                  label="City *"
                  value={personalForm.city}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, city: e.target.value }))}
                  required
                />
                <Input
                  label="State *"
                  value={personalForm.state}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, state: e.target.value }))}
                  required
                />
                <Input
                  label="Pincode *"
                  value={personalForm.pincode}
                  onChange={(e) => setPersonalForm((p) => ({ ...p, pincode: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="outline" type="button" onClick={() => setEditingPersonal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={saving} leftIcon={<Check size={14} />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Edit Modal */}
      {editingFamily && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 32, 51, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              padding: 24
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Edit Family & Income Details
              </h3>
              <button
                onClick={() => setEditingFamily(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveFamily} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Father's Name"
                  value={familyForm.fatherName}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, fatherName: e.target.value }))}
                />
                <Input
                  label="Father's Occupation"
                  value={familyForm.fatherOccupation}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, fatherOccupation: e.target.value }))}
                />
                <Input
                  label="Mother's Name"
                  value={familyForm.motherName}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, motherName: e.target.value }))}
                />
                <Input
                  label="Mother's Occupation"
                  value={familyForm.motherOccupation}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, motherOccupation: e.target.value }))}
                />
              </div>
              <Input
                label="Annual Family Income (₹) *"
                type="number"
                value={familyForm.annualFamilyIncome}
                onChange={(e) => setFamilyForm((p) => ({ ...p, annualFamilyIncome: e.target.value }))}
                required
              />
              <Input
                label="Number of Dependents"
                type="number"
                value={familyForm.numberOfDependents}
                onChange={(e) => setFamilyForm((p) => ({ ...p, numberOfDependents: e.target.value }))}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                <input
                  type="checkbox"
                  id="editBpl"
                  checked={familyForm.isBPL}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, isBPL: e.target.checked }))}
                  style={{ width: 17, height: 17, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <label htmlFor="editBpl" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Family is Below Poverty Line (BPL Card Holder)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="outline" type="button" onClick={() => setEditingFamily(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={saving} leftIcon={<Check size={14} />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Add/Edit Modal */}
      {editingAcademic && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 32, 51, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              padding: 24
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                {editingAcademic === 'NEW' ? 'Add Academic Qualification' : `Edit ${LL[academicForm.level] ?? academicForm.level}`}
              </h3>
              <button
                onClick={() => setEditingAcademic(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveAcademic} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Select
                label="Education Level *"
                options={ACAD_LEVELS}
                value={academicForm.level}
                disabled={editingAcademic !== 'NEW'}
                onChange={(e) => setAcademicForm((p) => ({ ...p, level: e.target.value }))}
              />
              <Input
                label="School / College / Institute Name *"
                value={academicForm.institutionName}
                onChange={(e) => setAcademicForm((p) => ({ ...p, institutionName: e.target.value }))}
                required
              />
              <Input
                label="Board / University"
                placeholder="e.g. CBSE / State Board / Delhi University"
                value={academicForm.boardOrUniversity}
                onChange={(e) => setAcademicForm((p) => ({ ...p, boardOrUniversity: e.target.value }))}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Degree / Course Name"
                  placeholder="e.g. B.Tech / B.Sc"
                  value={academicForm.courseName}
                  onChange={(e) => setAcademicForm((p) => ({ ...p, courseName: e.target.value }))}
                />
                <Input
                  label="Branch / Specialization"
                  placeholder="e.g. Computer Science"
                  value={academicForm.branch}
                  onChange={(e) => setAcademicForm((p) => ({ ...p, branch: e.target.value }))}
                />
                <Input
                  label="Percentage (%)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 85.5"
                  value={academicForm.percentage}
                  onChange={(e) => setAcademicForm((p) => ({ ...p, percentage: e.target.value }))}
                />
                <Input
                  label="CGPA"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 8.4"
                  value={academicForm.cgpa}
                  onChange={(e) => setAcademicForm((p) => ({ ...p, cgpa: e.target.value }))}
                />
                <Input
                  label="Passing Year"
                  type="number"
                  placeholder="e.g. 2024"
                  value={academicForm.passingYear}
                  onChange={(e) => setAcademicForm((p) => ({ ...p, passingYear: e.target.value }))}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                  <input
                    type="checkbox"
                    id="currPursuing"
                    checked={academicForm.isCurrentlyPursuing}
                    onChange={(e) => setAcademicForm((p) => ({ ...p, isCurrentlyPursuing: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="currPursuing" style={{ fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Currently pursuing
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="outline" type="button" onClick={() => setEditingAcademic(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={saving} leftIcon={<Check size={14} />}>
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
