import { motion } from 'framer-motion'

export function ProgressBar({
  value,
  max = 100,
  color = 'var(--brand-primary, #315EAA)',
  height = 6,
  showLabel = false,
}: {
  value: number
  max?: number
  color?: string
  height?: number
  showLabel?: boolean
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height,
          background: 'var(--border-subtle, #E7E9EE)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: 999, background: color }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary, #657084)',
            minWidth: 32,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pct}%
        </span>
      )}
    </div>
  )
}
