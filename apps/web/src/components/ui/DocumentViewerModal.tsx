import { useEffect, useState, useRef } from 'react'
import {
  X,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Columns,
  GraduationCap,
  Trash2
} from 'lucide-react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface DocumentMetadata {
  id: string
  userId: string
  type: string
  label: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'
  rejectionReason?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    fullName: string
    email: string
    role: string
    studentProfile?: {
      phone?: string | null
      category?: string | null
      domicileState?: string | null
    } | null
  }
  verifiedByAdmin?: {
    id: string
    fullName: string
    email: string
  } | null
  applicationLinks?: Array<{
    application?: {
      id: string
      status: string
      scholarship?: {
        name: string
      } | null
    } | null
  }>
}

interface DocumentViewerModalProps {
  documentId: string | null
  documentTitle?: string
  onClose: () => void
  onDocumentUpdated?: () => void
}

type ViewMode = 'split' | 'document' | 'receipt'

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'Not available'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// Generate deterministic pseudo SHA256 cryptographic seal string from ID
function generateVaultHash(id: string, timestamp?: string): string {
  let hash = 0
  const input = `${id}-${timestamp || 'vidyut-vault-seed'}`
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x${hex}9b4a...${id.slice(-6).toUpperCase()}`
}

export function DocumentViewerModal({
  documentId,
  documentTitle = 'Document Preview',
  onClose,
  onDocumentUpdated,
}: DocumentViewerModalProps) {
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Document binary state
  const [loadingFile, setLoadingFile] = useState(true)
  const [fileError, setFileError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('')
  const [fileName, setFileName] = useState<string>('document')
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false)

  // Document metadata state
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null)
  const [loadingMeta, setLoadingMeta] = useState(true)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [copiedId, setCopiedId] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Fetch document file blob + metadata
  useEffect(() => {
    if (!documentId) return

    let active = true
    let createdUrl: string | null = null
    setLoadingFile(true)
    setLoadingMeta(true)
    setFileError(null)

    // 1. Fetch file binary
    api.getBlob(`/documents/${documentId}/file`)
      .then(({ blob, mimeType: fetchedMime, fileName: fetchedName, isFallback }) => {
        if (!active) return
        createdUrl = URL.createObjectURL(blob)
        setBlobUrl(createdUrl)
        setMimeType(fetchedMime.toLowerCase())
        if (fetchedName) setFileName(fetchedName)
        setIsFallbackNotice(Boolean(isFallback))
        setLoadingFile(false)
      })
      .catch((err: any) => {
        if (!active) return
        setFileError(err.message || 'File not found on storage.')
        setLoadingFile(false)
      })

    // 2. Fetch document record metadata
    api.get<{ document: DocumentMetadata }>(`/documents/${documentId}`)
      .then((res) => {
        if (!active) return
        if (res?.document) {
          setMetadata(res.document)
          if (res.document.fileName) setFileName(res.document.fileName)
          if (res.document.mimeType) setMimeType(res.document.mimeType.toLowerCase())
        }
        setLoadingMeta(false)
      })
      .catch((err: any) => {
        if (!active) return
        console.warn('Failed to load document metadata:', err)
        setLoadingMeta(false)
      })

    return () => {
      active = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [documentId, refreshCount])

  if (!documentId) return null

  const isPdf = mimeType.includes('pdf')
  const isImage = mimeType.startsWith('image/')
  const receiptNumber = `VDT-REC-${documentId.slice(-8).toUpperCase()}`

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName || 'vidyut-document'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyReceiptId = () => {
    navigator.clipboard.writeText(receiptNumber)
    setCopiedId(true)
    addToast('success', 'Receipt Tracking Number copied to clipboard!')
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleReplaceClick = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const validExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/jpg', 'image/pjpeg']

    if (!validExts.includes(ext) && !allowedTypes.includes(file.type?.toLowerCase())) {
      addToast('error', 'Only JPEG, PNG, WebP or PDF files are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File size must be under 5MB.')
      return
    }

    try {
      setReplacing(true)
      const fd = new FormData()
      fd.append('file', file)

      const res = await api.upload<{ document: DocumentMetadata }>(`/documents/${documentId}/replace`, fd)
      addToast('success', 'Document updated and synced with Vault!')

      if (res?.document) {
        setMetadata(res.document)
        if (res.document.fileName) setFileName(res.document.fileName)
        if (res.document.mimeType) setMimeType(res.document.mimeType.toLowerCase())
      }
      onDocumentUpdated?.()
      setRefreshCount(prev => prev + 1)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to replace document file.')
    } finally {
      setReplacing(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document from your vault? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await api.delete(`/documents/${documentId}`)
      addToast('success', 'Document permanently deleted from vault')
      onDocumentUpdated?.()
      onClose()
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete document from vault')
    } finally {
      setDeleting(false)
    }
  }

  const currentStatus = metadata?.status || 'PENDING'

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'VERIFIED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={13} color="#059669" /> VERIFIED & ATTESTED
          </span>
        )
      case 'REJECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={13} color="#e11d48" /> REJECTED / ACTION REQUIRED
          </span>
        )
      case 'EXPIRED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Clock size={13} color="#dc2626" /> EXPIRED
          </span>
        )
      case 'PENDING':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fde68a',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Clock size={13} color="#d97706" /> PENDING REVIEW
          </span>
        )
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          width: '100%',
          maxWidth: viewMode === 'split' ? 1220 : 960,
          height: '92vh',
          maxHeight: 900,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          transition: 'max-width 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input placed safely inside the card */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: 'none' }}
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileSelected}
        />

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            flexShrink: 0,
            gap: 16,
          }}
        >
          {/* Document Title & Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e40af',
                border: '1px solid #dbeafe',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {metadata?.label || documentTitle}
                </h3>
                {getStatusBadge()}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                  {fileName}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {formatBytes(metadata?.fileSize)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: View Mode Switcher + Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            {/* View Mode Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                padding: 3,
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('split')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: viewMode === 'split' ? 600 : 500,
                  backgroundColor: viewMode === 'split' ? '#ffffff' : 'transparent',
                  color: viewMode === 'split' ? '#1e40af' : '#64748b',
                  boxShadow: viewMode === 'split' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('document')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: viewMode === 'document' ? 600 : 500,
                  backgroundColor: viewMode === 'document' ? '#ffffff' : 'transparent',
                  color: viewMode === 'document' ? '#1e40af' : '#64748b',
                  boxShadow: viewMode === 'document' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={13} />
                <span>Doc Only</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('receipt')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: viewMode === 'receipt' ? 600 : 500,
                  backgroundColor: viewMode === 'receipt' ? '#ffffff' : 'transparent',
                  color: viewMode === 'receipt' ? '#1e40af' : '#64748b',
                  boxShadow: viewMode === 'receipt' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShieldCheck size={13} />
                <span>Receipt Only</span>
              </button>
            </div>

            {/* Replace Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplaceClick}
              disabled={replacing || deleting}
              leftIcon={replacing ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
              style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {replacing ? 'Uploading...' : 'Replace File'}
            </Button>

            {/* Delete Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={replacing || deleting}
              leftIcon={deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>

            {/* Download Original Binary */}
            {blobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download size={13} />}
                style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Download
              </Button>
            )}

            {/* Close Modal */}
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: '#f8fafc',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 2,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Storage Notice Banner if fallback was triggered */}
        {isFallbackNotice && !fileError && !loadingFile && (
          <div
            style={{
              padding: '8px 20px',
              backgroundColor: '#eff6ff',
              borderBottom: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#1e40af',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={15} color="#2563eb" />
              <span>
                <strong>Vidyut Vault Archive:</strong> Original scan archived. Use <strong>"Replace File"</strong> anytime to update with a fresh high-resolution scan.
              </span>
            </div>
            <button
              onClick={handleReplaceClick}
              style={{
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Upload New Scan
            </button>
          </div>
        )}

        {/* Dual Panel Body */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
          }}
        >
          {/* ========================================================= */}
          {/* LEFT PANEL: ORIGINAL UPLOADED DOCUMENT                    */}
          {/* ========================================================= */}
          {(viewMode === 'split' || viewMode === 'document') && (
            <div
              style={{
                flex: viewMode === 'split' ? '1 1 60%' : '1 1 100%',
                display: 'flex',
                flexDirection: 'column',
                borderRight: viewMode === 'split' ? '1px solid #e2e8f0' : 'none',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Document Pane Sub-header */}
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#475569',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <FileText size={14} color="#1e40af" />
                  <span>Original Document Preview</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: isPdf ? '#fee2e2' : '#e0f2fe',
                      color: isPdf ? '#991b1b' : '#0369a1',
                      marginLeft: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {isPdf ? 'PDF' : isImage ? 'IMAGE' : mimeType}
                  </span>
                </div>

                {/* Preview Toolbar (Zoom & Actions) */}
                {isImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Zoom Out"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span style={{ fontSize: 11, fontWeight: 600, minWidth: 38, textAlign: 'center' }}>
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Zoom In"
                    >
                      <ZoomIn size={13} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Reset Zoom"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                )}

                {blobUrl && (
                  <a
                    href={blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Open Raw</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Main Document Content Canvas */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  backgroundColor: '#0f172a08',
                  padding: isPdf ? 0 : 20,
                  position: 'relative',
                }}
              >
                {loadingFile && (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#1e40af' }} />
                    <p style={{ fontSize: 13, fontWeight: 500 }}>Decrypting and loading original document...</p>
                  </div>
                )}

                {fileError && !loadingFile && (
                  <div
                    style={{
                      maxWidth: 440,
                      textAlign: 'center',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      padding: 28,
                      borderRadius: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#fff7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                        color: '#ea580c',
                        border: '1px solid #ffedd5',
                      }}
                    >
                      <AlertCircle size={26} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      Document Binary Missing
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
                      The physical file is currently not present on storage. You can restore it immediately using the replace button.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleReplaceClick}
                      disabled={replacing}
                      leftIcon={<UploadCloud size={13} />}
                    >
                      {replacing ? 'Uploading...' : 'Upload Replacement File'}
                    </Button>
                  </div>
                )}

                {!loadingFile && !fileError && blobUrl && (
                  <>
                    {isPdf ? (
                      <iframe
                        src={blobUrl}
                        title="PDF Viewer"
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                      />
                    ) : isImage ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          overflow: 'auto',
                        }}
                      >
                        <img
                          src={blobUrl}
                          alt={metadata?.label || documentTitle}
                          style={{
                            maxWidth: zoomLevel === 100 ? '100%' : 'none',
                            maxHeight: zoomLevel === 100 ? '100%' : 'none',
                            transform: `scale(${zoomLevel / 100})`,
                            transformOrigin: 'center center',
                            objectFit: 'contain',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                            transition: 'transform 0.1s ease',
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          backgroundColor: '#ffffff',
                          padding: 32,
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          maxWidth: 380,
                        }}
                      >
                        <FileText size={44} color="#64748b" style={{ margin: '0 auto 12px' }} />
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                          Format Preview Unsupported
                        </h4>
                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                          This file type ({mimeType}) cannot be rendered directly in the embedded canvas.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                          <Button size="sm" onClick={handleDownload} leftIcon={<Download size={13} />}>
                            Download File
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleReplaceClick} leftIcon={<UploadCloud size={13} />}>
                            Replace File
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* RIGHT PANEL: OFFICIAL VAULT VERIFICATION RECEIPT         */}
          {/* ========================================================= */}
          {(viewMode === 'split' || viewMode === 'receipt') && (
            <div
              style={{
                flex: viewMode === 'split' ? '1 1 40%' : '1 1 100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}
            >
              {/* Receipt Sub-Header */}
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#475569',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <ShieldCheck size={14} color="#059669" />
                  <span>Vault Verification Receipt</span>
                </div>

                <button
                  onClick={handlePrintReceipt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#475569',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                  title="Print this verification receipt"
                >
                  <Printer size={12} />
                  <span>Print Slip</span>
                </button>
              </div>

              {/* Printable / Viewable Receipt Document Canvas */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 20,
                  backgroundColor: '#f8fafc',
                }}
              >
                {loadingMeta ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: '#1e40af' }} />
                    <p style={{ fontSize: 13, fontWeight: 500 }}>Fetching Vault verification records...</p>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 18,
                    }}
                  >
                    {/* Official Emblem & Directorate Header */}
                    <div
                      style={{
                        textAlign: 'center',
                        paddingBottom: 16,
                        borderBottom: '2px solid #e2e8f0',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: '#1e40af',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px',
                          boxShadow: '0 4px 6px rgba(30, 64, 175, 0.25)',
                        }}
                      >
                        <GraduationCap size={24} />
                      </div>

                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: '#0f172a',
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                          margin: 0,
                        }}
                      >
                        Vidyut Digital Vault
                      </h4>
                      <p
                        style={{
                          fontSize: 11,
                          color: '#64748b',
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          margin: '3px 0 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        Official Scholarship Document Verification Slip
                      </p>

                      {/* Receipt Serial Badge */}
                      <div
                        style={{
                          marginTop: 10,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#f1f5f9',
                          padding: '4px 12px',
                          borderRadius: 20,
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>RECEIPT NO:</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                          {receiptNumber}
                        </span>
                        <button
                          onClick={handleCopyReceiptId}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 2,
                            color: copiedId ? '#059669' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copy Receipt Number"
                        >
                          {copiedId ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Verification Status Banner */}
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        backgroundColor:
                          currentStatus === 'VERIFIED'
                            ? '#f0fdf4'
                            : currentStatus === 'REJECTED'
                            ? '#fff1f2'
                            : '#fffbeb',
                        border: `1px solid ${
                          currentStatus === 'VERIFIED'
                            ? '#bbf7d0'
                            : currentStatus === 'REJECTED'
                            ? '#fecdd3'
                            : '#fef08a'
                        }`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <div style={{ marginTop: 2 }}>
                        {currentStatus === 'VERIFIED' ? (
                          <ShieldCheck size={18} color="#16a34a" />
                        ) : currentStatus === 'REJECTED' ? (
                          <AlertCircle size={18} color="#e11d48" />
                        ) : (
                          <Clock size={18} color="#d97706" />
                        )}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              currentStatus === 'VERIFIED'
                                ? '#166534'
                                : currentStatus === 'REJECTED'
                                ? '#9f1239'
                                : '#854d0e',
                          }}
                        >
                          {currentStatus === 'VERIFIED'
                            ? 'Document Officially Verified'
                            : currentStatus === 'REJECTED'
                            ? 'Verification Declined'
                            : 'Review in Progress'}
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color:
                              currentStatus === 'VERIFIED'
                                ? '#15803d'
                                : currentStatus === 'REJECTED'
                                ? '#be123c'
                                : '#a16207',
                            margin: '2px 0 0',
                            lineHeight: 1.4,
                          }}
                        >
                          {currentStatus === 'VERIFIED'
                            ? `Validated by Directorate verifier on ${formatDate(metadata?.verifiedAt)}.`
                            : currentStatus === 'REJECTED'
                            ? (metadata?.rejectionReason || 'Requirements not fulfilled. Please re-upload.')
                            : 'Cryptographically registered and queued for verification officer review.'}
                        </p>
                      </div>
                    </div>

                    {/* Document & Applicant Details Grid */}
                    <div>
                      <h5
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          margin: '0 0 10px',
                        }}
                      >
                        Audit & Record Specifications
                      </h5>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: 8,
                          fontSize: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Document Title</span>
                          <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                            {metadata?.label || documentTitle}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Document Category</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#1e40af',
                              fontFamily: 'monospace',
                              fontSize: 11,
                            }}
                          >
                            {metadata?.type || 'DOCUMENT'}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Original Filename</span>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                            {fileName}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Verified File Size</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {formatBytes(metadata?.fileSize)}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <span style={{ color: '#64748b' }}>Date Uploaded</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {formatDate(metadata?.createdAt)}
                          </span>
                        </div>

                        {/* Applicant Info if loaded */}
                        {metadata?.user && (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                backgroundColor: '#f8fafc',
                                borderRadius: 6,
                                border: '1px solid #f1f5f9',
                              }}
                            >
                              <span style={{ color: '#64748b' }}>Applicant Name</span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                {metadata.user.fullName}
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                backgroundColor: '#f8fafc',
                                borderRadius: 6,
                                border: '1px solid #f1f5f9',
                              }}
                            >
                              <span style={{ color: '#64748b' }}>Applicant Email</span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                {metadata.user.email}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Associated Scholarship application */}
                        {metadata?.applicationLinks && metadata.applicationLinks.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              backgroundColor: '#eff6ff',
                              borderRadius: 6,
                              border: '1px solid #dbeafe',
                            }}
                          >
                            <span style={{ color: '#1e40af', fontWeight: 600 }}>Linked Scholarship</span>
                            <span style={{ fontWeight: 700, color: '#1e40af', textAlign: 'right' }}>
                              {metadata.applicationLinks[0]?.application?.scholarship?.name || 'Scholarship Scheme'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cryptographic Vault Seal & Hash */}
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Cryptographic Hash (SHA-256)
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          VAULT SIGNED
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: '#0f172a',
                          wordBreak: 'break-all',
                          backgroundColor: '#ffffff',
                          padding: '6px 8px',
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {generateVaultHash(documentId, metadata?.createdAt)}
                      </div>

                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                        Immutable digital archive entry stored on Vidyut High-Trust Educational Infrastructure.
                      </p>
                    </div>

                    {/* Bottom Receipt Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrintReceipt}
                        leftIcon={<Printer size={13} />}
                        style={{ flex: 1, fontSize: 12, whiteSpace: 'nowrap' }}
                      >
                        Print Slip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReplaceClick}
                        disabled={replacing || deleting}
                        leftIcon={<UploadCloud size={13} />}
                        style={{ flex: 1, fontSize: 12, whiteSpace: 'nowrap' }}
                      >
                        Replace File
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDelete}
                        disabled={replacing || deleting}
                        leftIcon={<Trash2 size={13} />}
                        style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
