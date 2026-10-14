import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { normalizeErrorMessage } from '@/api/client'

export type ToastType = 'success' | 'error' | 'info'
export interface ToastData {
  id: string
  type: ToastType
  message: string
}

let toastFn: ((message: unknown, type?: ToastType) => void) | null = null

export function toast(message: unknown, type: ToastType = 'info') {
  const cleanMsg = typeof message === 'string' ? message : normalizeErrorMessage(message)
  toastFn?.(cleanMsg, type)
}

export function useToast() {
  return {
    addToast: (type: ToastType, message: unknown) => toast(message, type),
    toast,
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const addToast = useCallback((rawMessage: unknown, type: ToastType = 'info') => {
    const message = typeof rawMessage === 'string' ? rawMessage : normalizeErrorMessage(rawMessage)
    const id = Math.random().toString(36).slice(2)
    setToasts((p) => [...p, { id, type, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4200)
  }, [])
  toastFn = addToast

  const icons = {
    success: <CheckCircle2 size={16} color="var(--success, #247A55)" />,
    error: <AlertCircle size={16} color="var(--error, #B83E45)" />,
    info: <Info size={16} color="var(--brand-primary, #315EAA)" />,
  }

  const borderColors = {
    success: 'var(--success, #247A55)',
    error: 'var(--error, #B83E45)',
    info: 'var(--brand-primary, #315EAA)',
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--surface-1, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E7E9EE)',
              borderLeft: `3px solid ${borderColors[t.type]}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              minWidth: 280,
              maxWidth: 420,
              boxShadow: 'var(--shadow-lg, 0 12px 20px -4px rgba(16, 24, 40, 0.08))',
              pointerEvents: 'all',
            }}
          >
            {icons[t.type]}
            <span
              style={{
                fontSize: 13,
                color: 'var(--text-primary, #172033)',
                fontWeight: 500,
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {t.message}
            </span>
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary, #8A93A3)',
                padding: 2,
                display: 'flex',
                borderRadius: 4,
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
