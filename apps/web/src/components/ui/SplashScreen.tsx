import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Sparkles, RefreshCw } from 'lucide-react'
import { SPLASH_QUOTES, LOADING_STATUS_MESSAGES, SplashQuote } from '@/data/splashQuotes'

interface SplashScreenProps {
  statusMessage?: string
}

export function SplashScreen({ statusMessage }: SplashScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * SPLASH_QUOTES.length))
  const [statusIndex, setStatusIndex] = useState(0)

  // Cycle quote periodically
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SPLASH_QUOTES.length)
    }, 4500)

    return () => clearInterval(quoteInterval)
  }, [])

  // Cycle status message smoothly
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUS_MESSAGES.length)
    }, 2400)

    return () => clearInterval(statusInterval)
  }, [])

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % SPLASH_QUOTES.length)
  }

  const currentQuote: SplashQuote = SPLASH_QUOTES[quoteIndex] || SPLASH_QUOTES[0]
  const currentStatus = statusMessage || LOADING_STATUS_MESSAGES[statusIndex]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-canvas, #FAFAF8)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Minimalist Vidyut Brand Emblem matching App Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 38,
              height: 38,
              background: 'var(--primary, #315EAA)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(49, 94, 170, 0.2)'
            }}
          >
            <GraduationCap size={21} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 750,
                  color: 'var(--text-primary, #172033)',
                  letterSpacing: '-0.025em'
                }}
              >
                Vidyut
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: 'var(--success, #247A55)',
                  backgroundColor: 'var(--success-subtle, #EDF7F2)',
                  border: '1px solid var(--success-border, #C7E8D8)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                विद्युत
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted, #8B95A5)',
                display: 'block',
                fontWeight: 500
              }}
            >
              Student Success Platform
            </span>
          </div>
        </div>

        {/* Quiet Confidence Quote Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E7E9EE)',
            borderRadius: 14,
            padding: '24px 26px',
            boxShadow: '0 8px 24px -4px rgba(23, 32, 51, 0.05), 0 1px 3px rgba(23, 32, 51, 0.03)',
            marginBottom: 20,
            minHeight: 154,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Category Pill Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 9px',
                  borderRadius: 20,
                  fontSize: 10.5,
                  fontWeight: 650,
                  letterSpacing: '0.02em',
                  color: 'var(--primary, #315EAA)',
                  backgroundColor: 'var(--accent-subtle, #EEF4FC)',
                  border: '1px solid var(--accent-border, #C7DCF8)',
                  marginBottom: 10
                }}
              >
                <Sparkles size={11} />
                <span>{currentQuote.categoryLabel}</span>
              </div>

              {/* Quote Text */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text-primary, #172033)',
                  fontWeight: 500,
                  fontStyle: currentQuote.category === 'sarcastic' ? 'normal' : 'italic',
                  margin: '0 0 8px',
                  maxWidth: 460
                }}
              >
                &ldquo;{currentQuote.text}&rdquo;
              </p>

              {/* Author Attribution */}
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--text-secondary, #5E6A7E)'
                }}
              >
                — {currentQuote.author}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Interactive Next Quote button */}
          <button
            onClick={handleNextQuote}
            style={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              background: 'var(--bg-canvas, #FAFAF8)',
              border: '1px solid var(--border-subtle, #E7E9EE)',
              cursor: 'pointer',
              color: 'var(--text-muted, #8B95A5)',
              fontSize: 10.5,
              fontWeight: 550,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 6,
              transition: 'all 0.15s ease'
            }}
            title="Read next quote"
          >
            <RefreshCw size={10} />
            <span>Next</span>
          </button>
        </div>

        {/* Restrained Indeterminate Loader Line (Quiet Confidence) */}
        <div
          style={{
            width: '100%',
            maxWidth: 200,
            height: 2.5,
            backgroundColor: 'var(--border-subtle, #E7E9EE)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            marginBottom: 10
          }}
        >
          <motion.div
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '45%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, var(--primary, #315EAA) 50%, transparent)',
              borderRadius: 3
            }}
          />
        </div>

        {/* Rotating Status Indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: 12,
              color: 'var(--text-secondary, #5E6A7E)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--success, #247A55)',
                display: 'inline-block'
              }}
            />
            <span>{currentStatus}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle bottom note */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          fontSize: 11,
          color: 'var(--text-muted, #8B95A5)',
          letterSpacing: 0.1
        }}
      >
        Vidyut · High-Trust Scholarship Platform
      </div>
    </div>
  )
}
