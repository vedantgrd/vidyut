import { useEffect, useState } from 'react'
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'

interface DocumentViewerModalProps {
  documentId: string | null
  documentTitle?: string
  onClose: () => void
}

export function DocumentViewerModal({
  documentId,
  documentTitle = 'Document Preview',
  onClose,
}: DocumentViewerModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('')
  const [fileName, setFileName] = useState<string>('document')

  useEffect(() => {
    if (!documentId) return

    let active = true
    let createdUrl: string | null = null
    setLoading(true)
    setError(null)

    api.getBlob(`/documents/${documentId}/file`)
      .then(({ blob, mimeType: fetchedMime, fileName: fetchedName }) => {
        if (!active) return
        createdUrl = URL.createObjectURL(blob)
        setBlobUrl(createdUrl)
        setMimeType(fetchedMime.toLowerCase())
        if (fetchedName) setFileName(fetchedName)
        setLoading(false)
      })
      .catch((err: any) => {
        if (!active) return
        setError(err.message || 'Failed to load document. Please check your credentials or try again.')
        setLoading(false)
      })

    return () => {
      active = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [documentId])

  if (!documentId) return null

  const isPdf = mimeType.includes('pdf')
  const isImage = mimeType.startsWith('image/')

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName || 'vidyut-document'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 960,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e40af',
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {documentTitle}
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                {fileName} {mimeType ? `· ${mimeType}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {blobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download size={14} />}
              >
                Download
              </Button>
            )}
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            minHeight: 480,
            maxHeight: 'calc(92vh - 120px)',
            backgroundColor: '#0f172a08',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: isPdf ? 0 : 20,
            position: 'relative',
          }}
        >
          {loading && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: '#1e40af' }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Decrypting and loading document securely...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                maxWidth: 420,
                textAlign: 'center',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: 24,
                borderRadius: 12,
              }}
            >
              <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>
                Unable to Display Document
              </h4>
              <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 16 }}>{error}</p>
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <>
              {isPdf ? (
                <iframe
                  src={blobUrl}
                  title="PDF Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 520,
                    border: 'none',
                  }}
                />
              ) : isImage ? (
                <img
                  src={blobUrl}
                  alt={documentTitle}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(92vh - 160px)',
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    padding: 32,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    maxWidth: 400,
                  }}
                >
                  <FileText size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    Preview Unavailable
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                    This file format ({mimeType}) cannot be rendered directly in the browser preview. Download the original file to view it.
                  </p>
                  <Button onClick={handleDownload} leftIcon={<Download size={14} />}>
                    Download Original File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
