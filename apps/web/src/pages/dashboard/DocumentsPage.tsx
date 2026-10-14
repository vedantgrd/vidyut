import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  AlertTriangle,
  Search,
  SlidersHorizontal
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Document } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Empty } from '@/components/ui/Empty'
import { toast } from '@/components/ui/Toast'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal'
import { DocumentMetadataModal } from '@/components/documents/DocumentMetadataModal'

const DOC_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'INCOME_CERTIFICATE', label: 'Income Certificate' },
  { value: 'CASTE_CERTIFICATE', label: 'Caste Certificate' },
  { value: 'DOMICILE_CERTIFICATE', label: 'Domicile Certificate' },
  { value: 'TENTH_MARKSHEET', label: 'Class 10 Marksheet' },
  { value: 'TWELFTH_MARKSHEET', label: 'Class 12 Marksheet' },
  { value: 'DIPLOMA_MARKSHEET', label: 'Diploma Marksheet' },
  { value: 'DEGREE_CERTIFICATE', label: 'Degree Certificate' },
  { value: 'TRANSCRIPT', label: 'Academic Transcript' },
  { value: 'DISABILITY_CERTIFICATE', label: 'Disability Certificate' },
  { value: 'BANK_PASSBOOK', label: 'Bank Passbook' },
  { value: 'PHOTOGRAPH', label: 'Passport Photo' },
  { value: 'COLLEGE_ID', label: 'College ID / Bonafide' },
  { value: 'OTHER', label: 'Other' }
]

const SI: Record<string, React.ReactNode> = {
  VERIFIED: <CheckCircle size={18} color="#059669" />,
  PENDING: <Clock size={18} color="#d97706" />,
  REJECTED: <XCircle size={18} color="#dc2626" />,
  EXPIRED: <AlertCircle size={18} color="#64748b" />
}

export function DocumentsPage() {
  const [uploadType, setUploadType] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [duplicatePending, setDuplicatePending] = useState<{ file: File; type: string; label: string } | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ id: string; title: string } | null>(null)
  const [editingMetadataDoc, setEditingMetadataDoc] = useState<Document | null>(null)
  const [deleteWarningDoc, setDeleteWarningDoc] = useState<{ id: string; label: string; activeApps: string[] } | null>(null)

  // Vault health summary
  const [vaultSummary, setVaultSummary] = useState<{
    total: number
    verified: number
    pending: number
    rejected: number
    expired: number
    expiringSoon: number
    linkedApplicationsCount: number
  } | null>(null)

  const { data, isLoading, refetch } = useApi(() => api.get<{ documents: Document[] }>('/documents'))

  const fetchVaultSummary = async () => {
    try {
      const res = await api.get<any>('/documents/vault-summary')
      setVaultSummary(res)
    } catch {
      // Graceful fallback
    }
  }

  useEffect(() => {
    fetchVaultSummary()
  }, [data])

  const checkAndDeleteDoc = async (doc: Document) => {
    try {
      const usage = await api.get<{
        isUsedInActiveApplications: boolean
        applications: { applicationId: string; status: string; scholarshipName: string }[]
      }>(`/documents/${doc.id}/usage`)

      if (usage.isUsedInActiveApplications) {
        setDeleteWarningDoc({
          id: doc.id,
          label: doc.label,
          activeApps: usage.applications.map(a => a.scholarshipName)
        })
        return
      }

      if (!window.confirm(`Are you sure you want to remove "${doc.label}" from your vault?`)) return
      await api.delete(`/documents/${doc.id}`)
      toast('Document removed from vault', 'info')
      refetch()
    } catch (err) {
      toast(err, 'error')
    }
  }

  const confirmDangerousDelete = async () => {
    if (!deleteWarningDoc) return
    try {
      await api.delete(`/documents/${deleteWarningDoc.id}`)
      toast('Document removed from vault and unlinked from applications', 'info')
      setDeleteWarningDoc(null)
      refetch()
    } catch (err) {
      toast(err, 'error')
    }
  }

  const uploadFile = async (file: File, type: string, replace = false) => {
    setUploading(true)
    try {
      const label = DOC_TYPES.find(d => d.value === type)?.label ?? type
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      fd.append('label', label)
      const url = replace ? '/documents/upload?replace=true' : '/documents/upload'
      await api.upload(url, fd)
      await refetch()
      toast(replace ? `${label} replaced successfully!` : `${label} uploaded to vault!`, 'success')
      setUploadType('')
      setDuplicatePending(null)
    } catch (e: any) {
      const errMsg = e?.message || ''
      if (errMsg.includes('DUPLICATE_DOCUMENT') || errMsg.toLowerCase().includes('already uploaded')) {
        const label = DOC_TYPES.find(d => d.value === type)?.label ?? type
        setDuplicatePending({ file, type, label })
      } else {
        toast(e, 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleInitialUpload = (file: File) => {
    if (!uploadType) {
      toast('Please select a document type first', 'error')
      return
    }
    uploadFile(file, uploadType, false)
  }

  const allDocs = data?.documents ?? []

  // Filtered documents
  const filteredDocs = allDocs.filter(d => {
    const matchesSearch = d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.documentNumber && d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (statusFilter === 'VERIFIED') return d.status === 'VERIFIED'
    if (statusFilter === 'PENDING') return d.status === 'PENDING'
    if (statusFilter === 'EXPIRING') {
      if (!d.expiryDate) return false
      const diffDays = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    }
    return true
  })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Intelligent Document Vault
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Secure, reusable credentials with scheme-aware expiry management, instant verification status, and auto-linking.
        </p>
      </div>

      {/* Vault Health Analytics Cards */}
      {vaultSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Card style={{ padding: '14px 18px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Stored</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{vaultSummary.total}</p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Verified Credentials</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: '4px 0 0' }}>{vaultSummary.verified}</p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid #fed7aa', background: '#fffbeb' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Under Verification</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#d97706', margin: '4px 0 0' }}>{vaultSummary.pending}</p>
          </Card>
          <Card style={{ padding: '14px 18px', border: '1px solid #bfdbfe', background: '#eff6ff' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Applications Linked</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1e40af', margin: '4px 0 0' }}>{vaultSummary.linkedApplicationsCount}</p>
          </Card>
        </div>
      )}

      {/* Duplicate Document Conflict Dialog */}
      {duplicatePending && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: 18,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>
                {duplicatePending.label} Already Exists in Vault
              </h4>
              <p style={{ fontSize: 13, color: '#b45309', margin: '0 0 12px' }}>
                You already have a document registered under "{duplicatePending.label}". Would you like to replace the existing file with "{duplicatePending.file.name}"? Replaced files automatically preserve links to active applications.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  size="sm"
                  isLoading={uploading}
                  onClick={() => uploadFile(duplicatePending.file, duplicatePending.type, true)}
                >
                  Replace Existing File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setDuplicatePending(null); setUploadType('') }}
                >
                  Keep Current File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dangerous Deletion Warning Dialog */}
      {deleteWarningDoc && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 12,
          padding: 18,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
                Document Attached to Active Applications
              </h4>
              <p style={{ fontSize: 13, color: '#b91c1c', margin: '0 0 12px' }}>
                "{deleteWarningDoc.label}" is currently referenced by: <strong>{deleteWarningDoc.activeApps.join(', ')}</strong>. Deleting this credential will remove it from those active submissions and may invalidate their completeness.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  size="sm"
                  style={{ background: '#dc2626', color: '#ffffff' }}
                  onClick={confirmDangerousDelete}
                >
                  Confirm Delete & Detach
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteWarningDoc(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Document Card */}
      <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
          Add or Renew Document in Vault
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Select
              label="Select Document Type"
              options={DOC_TYPES}
              placeholder="e.g. Income Certificate, Marksheet..."
              value={uploadType}
              onChange={e => setUploadType(e.target.value)}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleInitialUpload(f)
              if (e.target) e.target.value = ''
            }}
          />
          <Button
            isLoading={uploading}
            disabled={!uploadType}
            onClick={() => fileRef.current?.click()}
            leftIcon={<Upload size={14} />}
            style={{ height: 40 }}
          >
            Choose & Upload File
          </Button>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
          Accepted formats: PDF, JPEG, PNG, WebP · Max size: 5MB · Stored with server-side authentication
        </p>
      </Card>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 11 }} />
            <input
              type="text"
              placeholder="Search documents or certificate IDs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'ALL', label: 'All' },
            { key: 'VERIFIED', label: 'Verified' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'EXPIRING', label: 'Expiring Soon' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
                border: statusFilter === f.key ? '1px solid #1e40af' : '1px solid #e2e8f0',
                background: statusFilter === f.key ? '#eff6ff' : '#ffffff',
                color: statusFilter === f.key ? '#1e40af' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <PageSpinner />
      ) : filteredDocs.length === 0 ? (
        <Empty
          icon={<FileText size={28} />}
          title="No documents matching your search"
          description="Upload essential documents like Aadhaar, Class 10 Marksheet, and Income Certificate so they can be instantly attached to scholarship applications."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredDocs.map((doc, i) => {
            const isExpired = doc.status === 'EXPIRED' || (doc.expiryDate && new Date(doc.expiryDate).getTime() < Date.now())
            const isExpiringSoon = doc.expiryDate && !isExpired && (new Date(doc.expiryDate).getTime() - Date.now()) <= 30 * 86400000

            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card style={{ padding: '16px 20px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: doc.status === 'VERIFIED' ? '#ecfdf5' : doc.status === 'REJECTED' ? '#fef2f2' : '#f8fafc',
                        border: doc.status === 'VERIFIED' ? '1px solid #a7f3d0' : doc.status === 'REJECTED' ? '1px solid #fecaca' : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {SI[doc.status] ?? <FileText size={18} color="#64748b" />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{doc.label}</p>
                          <StatusBadge status={doc.status} />
                          {doc.isMetadataConfirmed && (
                            <Badge variant="success">Confirmed</Badge>
                          )}
                          {isExpired && (
                            <Badge variant="error">Expired</Badge>
                          )}
                          {isExpiringSoon && !isExpired && (
                            <Badge variant="warning">Expiring Soon</Badge>
                          )}
                        </div>

                        <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                          {doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB · Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                        </p>

                        {/* Metadata row: Document ID, Issue Date, Expiry Date */}
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 11, color: '#475569' }}>
                          {doc.documentNumber && (
                            <span><strong>Cert #:</strong> {doc.documentNumber}</span>
                          )}
                          {doc.issueDate && (
                            <span><strong>Issued:</strong> {doc.issueDate.slice(0, 10)}</span>
                          )}
                          {doc.expiryDate && (
                            <span style={{ color: isExpired ? '#dc2626' : (isExpiringSoon ? '#d97706' : '#475569') }}>
                              <strong>Expires:</strong> {doc.expiryDate.slice(0, 10)}
                            </span>
                          )}
                        </div>

                        {doc.rejectionReason && (
                          <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                            <AlertCircle size={12} /> Rejection reason: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<SlidersHorizontal size={13} />}
                        onClick={() => setEditingMetadataDoc(doc)}
                      >
                        Metadata
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ExternalLink size={13} />}
                        onClick={() => setViewingDoc({ id: doc.id, title: doc.label })}
                      >
                        Preview
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkAndDeleteDoc(doc)}
                        leftIcon={<Trash2 size={13} />}
                        style={{ color: '#dc2626' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Document Preview / Stream Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          documentId={viewingDoc.id}
          documentTitle={viewingDoc.title}
          onClose={() => setViewingDoc(null)}
          onDocumentUpdated={refetch}
        />
      )}

      {/* Metadata Inspector Modal */}
      {editingMetadataDoc && (
        <DocumentMetadataModal
          document={editingMetadataDoc}
          onClose={() => setEditingMetadataDoc(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  )
}

export default DocumentsPage
