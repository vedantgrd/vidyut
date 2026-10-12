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

  // Cycle quote every 4 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SPLASH_QUOTES.length)
    }, 4000)

    return () => clearInterval(quoteInterval)
  }, [])

  // Cycle status message every 2.6 seconds
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUS_MESSAGES.length)
    }, 2600)

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
        backgroundColor: '#f8fafc',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Subtle, soft light background vignette */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 520,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 246, 255, 0.9) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 540,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Minimalist Vidyut Brand Emblem matching App Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: '#1e40af',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(30, 64, 175, 0.22)',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Vidyut
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  padding: '1px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                विद्युत
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: '#64748b',
                display: 'block',
                fontWeight: 500,
              }}
            >
              Scholarship Platform
            </span>
          </div>
        </div>

        {/* Premium Minimalist Quote Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '24px 28px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
            marginBottom: 24,
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Category Pill Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: currentQuote.categoryBadgeColor,
                  backgroundColor: currentQuote.categoryBg,
                  border: `1px solid ${currentQuote.categoryBorder}`,
                  marginBottom: 12,
                }}
              >
                <Sparkles size={11} />
                <span>{currentQuote.categoryLabel}</span>
              </div>

              {/* Quote Text */}
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: '#1e293b',
                  fontWeight: 500,
                  fontStyle: currentQuote.category === 'sarcastic' ? 'normal' : 'italic',
                  margin: '0 0 10px',
                  maxWidth: 480,
                }}
              >
                &ldquo;{currentQuote.text}&rdquo;
              </p>

              {/* Author Attribution */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
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
              right: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: 11,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 6,
              transition: 'all 0.15s ease',
            }}
            title="Read next quote"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1e40af'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            <RefreshCw size={10} />
            <span>Next</span>
          </button>
        </div>

        {/* Minimal Progress Bar matching Vidyut Trust Navy */}
        <div
          style={{
            width: '100%',
            maxWidth: 240,
            height: 3,
            backgroundColor: '#e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            marginBottom: 12,
          }}
        >
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #1e40af 40%, #059669 80%, transparent)',
              borderRadius: 3,
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
            transition={{ duration: 0.22 }}
            style={{
              fontSize: 12,
              color: '#64748b',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#059669',
                display: 'inline-block',
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
          bottom: 20,
          fontSize: 11,
          color: '#94a3b8',
          letterSpacing: 0.2,
        }}
      >
        Vidyut · High-Trust Scholarship Platform
      </div>
    </div>
  )
}
