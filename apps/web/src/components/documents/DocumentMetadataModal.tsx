import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Info } from 'lucide-react'
import { api } from '@/api/client'
import type { Document } from '@/types'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

interface DocumentMetadataModalProps {
  document: Document
  onClose: () => void
  onUpdated: () => void
}

export function DocumentMetadataModal({ document, onClose, onUpdated }: DocumentMetadataModalProps) {
  const [issueDate, setIssueDate] = useState(document.issueDate ? document.issueDate.slice(0, 10) : '')
  const [expiryDate, setExpiryDate] = useState(document.expiryDate ? document.expiryDate.slice(0, 10) : '')
  const [docNumber, setDocNumber] = useState(document.documentNumber || '')
  const [isConfirmed, setIsConfirmed] = useState(document.isMetadataConfirmed ?? false)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractionNote, setExtractionNote] = useState<string | null>(null)

  // Trigger safe rule-based extraction suggestion
  const handleExtractSuggestions = async () => {
    setExtracting(true)
    try {
      const res = await api.post<{
        extraction: {
          suggestedIssueDate: string | null
          suggestedExpiryDate: string | null
          suggestedDocumentNumber: string | null
          formatGuide: string
          note: string
        }
      }>(`/documents/${document.id}/extract-metadata`)

      if (res.extraction) {
        if (res.extraction.suggestedIssueDate && !issueDate) {
          setIssueDate(res.extraction.suggestedIssueDate)
        }
        if (res.extraction.suggestedExpiryDate && !expiryDate) {
          setExpiryDate(res.extraction.suggestedExpiryDate)
        }
        if (res.extraction.suggestedDocumentNumber && !docNumber) {
          setDocNumber(res.extraction.suggestedDocumentNumber)
        }
        setExtractionNote(res.extraction.formatGuide || res.extraction.note)
        toast('Smart metadata suggestions loaded! Review and confirm.', 'info')
      }
    } catch {
      toast('Could not extract suggestions', 'error')
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/documents/${document.id}/metadata`, {
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        documentNumber: docNumber.trim() || null,
        isMetadataConfirmed: isConfirmed
      })
      toast('Document metadata saved!', 'success')
      onUpdated()
      onClose()
    } catch (err) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Document Metadata & Expiry
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              {document.label} ({document.fileName})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Suggestion extraction trigger banner */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', margin: 0 }}>
              Smart Metadata Assist
            </p>
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
              Infer scheme-specific validity and format standards
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            isLoading={extracting}
            onClick={handleExtractSuggestions}
            leftIcon={<Sparkles size={12} color="#1e40af" />}
            style={{ fontSize: 11, height: 28 }}
          >
            Auto-Detect
          </Button>
        </div>

        {extractionNote && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            marginBottom: 14,
            fontSize: 11,
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Info size={13} />
            <span>{extractionNote}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
              Document / Certificate Number
            </label>
            <input
              type="text"
              placeholder="e.g. INC/2026/918239 or last 4 digits"
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Expiry Date (if applicable)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <input
              type="checkbox"
              id="confirmMetadata"
              checked={isConfirmed}
              onChange={e => setIsConfirmed(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="confirmMetadata" style={{ fontSize: 12, color: '#334155', cursor: 'pointer' }}>
              I confirm that these metadata details accurately reflect my original physical document.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} style={{ background: '#1e40af', color: '#ffffff' }}>
              Save Metadata
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
