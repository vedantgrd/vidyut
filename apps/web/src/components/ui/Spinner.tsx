import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SpinnerProps {
  /** Size in pixels (default: 20) */
  size?: number
  /** Color of the spinner stroke (default: 'var(--accent)') */
  color?: string
  /** Optional inline text to render below the spinner */
  text?: string
  /** Additional styling */
  style?: React.CSSProperties
  /** Additional class name */
  className?: string
}

export function Spinner({
  size = 20,
  color = 'var(--accent)',
  text,
  style,
  className,
}: SpinnerProps) {
  const svgElement = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={!text ? className : undefined}
      style={{
        animation: 'spin 0.75s linear infinite',
        flexShrink: 0,
        ...(!text ? style : {}),
      }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="2.8" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )

  if (text) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center',
          ...style,
        }}
      >
        {svgElement}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary, #64748b)',
            letterSpacing: '-0.01em',
            fontFamily: "var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif)",
          }}
        >
          {text}
        </span>
      </div>
    )
  }

  return svgElement
}

export const GENERAL_SPINNER_MESSAGES = [
  'Crunching the latest data, just for you. Hang tight...',
  'Consulting our digital compass...',
  'Connecting the dots, just for you...',
  'Brewing the latest updates...',
  'Gathering the good stuff from the vault...',
  'Aligning the stars (and the databases)...',
  'Checking every single criteria for you...',
  'Polishing the scholarship matches...',
  'Double-checking deadlines and documents...',
  'Warming up the verification engines...',
  'Hunting down the best opportunities for you...',
  'Doing some digital heavy lifting...',
  'Almost there, putting on the finishing touches...',
  'Hold tight, good things take a few moments...',
  'Calculating eligibility scores with surgical precision...',
  'Verifying records so you never have to stand in a queue...',
  'Syncing with the mothership...',
  'Making sure everything is in tip-top shape...',
]

export const CONTEXTUAL_MESSAGES: Record<string, string[]> = {
  scholarships: [
    'Scouting scholarships tailored for you. Hang tight...',
    'Matching your academic profile with state & national grants...',
    'Filtering out expired deadlines and invalid criteria...',
    'Polishing your top scholarship recommendations...',
    'Checking eligibility criteria against the stars...',
  ],
  scholarship: [
    'Fetching scheme guidelines and eligibility criteria...',
    'Analyzing grant requirements against your profile...',
    'Retrieving official scholarship source data...',
  ],
  applications: [
    'Fetching your application timeline and DBT statuses...',
    'Synchronizing your grant submissions with the portal...',
    'Checking review milestones. Hang tight...',
    'Retrieving your application dossiers...',
  ],
  application: [
    'Compiling your candidate dossier...',
    'Validating attached credentials from your vault...',
    'Checking preflight readiness indicators...',
  ],
  documents: [
    'Unlocking your encrypted document vault...',
    'Verifying digital signatures and checksums...',
    'Retrieving Aadhaar and income certificates securely...',
    'Preparing your high-trust document records...',
  ],
  dashboard: [
    'Synthesizing your scholarship command center...',
    'Calculating profile completeness and active deadlines...',
    'Checking for newly matched opportunities...',
  ],
  calendar: [
    'Syncing scholarship deadlines and agenda events...',
    'Arranging your personal milestone timeline...',
    'Double-checking verified scheme closing dates...',
  ],
  profile: [
    'Loading your candidate identity dossier...',
    'Calculating eligibility readiness score...',
    'Retrieving verified academic and family records...',
  ],
  settings: [
    'Retrieving notification and security preferences...',
    'Preparing your personalized account controls...',
  ],
  notifications: [
    'Checking for incoming grant alerts and verification updates...',
    'Syncing your inbox with scholarship authorities...',
  ],
  admin: [
    'Crunching administrative analytics and reviewer queues...',
    'Compiling student verifications and scholarship tranches...',
    'Fetching student dossiers from the database...',
    'Preparing operational command center data...',
  ],
  auth: [
    'Restoring your secure Vidyut session...',
    'Verifying credentials against the encrypted vault...',
    'Preparing your student command center...',
  ],
}

export interface PageSpinnerProps {
  /** Optional custom text to display. If omitted, witty GitHub-style personality messages cycle. */
  text?: string
  /** Optional secondary subtitle or hint */
  subtext?: string
  /** Size of the circular spinner in pixels (default: 32) */
  size?: number
  /** Color of the spinner (default: 'var(--accent)') */
  color?: string
  /** Minimum container height (default: '50vh') */
  minHeight?: string | number
  /** Context to pick specific witty messages from */
  context?:
    | 'general'
    | 'scholarships'
    | 'scholarship'
    | 'applications'
    | 'application'
    | 'documents'
    | 'dashboard'
    | 'calendar'
    | 'profile'
    | 'settings'
    | 'notifications'
    | 'admin'
    | 'auth'
  /** Custom list of messages to cycle through */
  messages?: string[]
  /** Whether to pick a random starting message instead of starting from the first one */
  randomInitialMessage?: boolean
  /** Whether to automatically cycle messages every interval (default: true) */
  rotateMessages?: boolean
  /** Interval in milliseconds between message changes (default: 3200ms) */
  interval?: number
  /** Container styling */
  style?: React.CSSProperties
  /** Container class name */
  className?: string
}

export function PageSpinner({
  text,
  subtext,
  size = 32,
  color = 'var(--accent)',
  minHeight = '50vh',
  context = 'general',
  messages,
  randomInitialMessage = false,
  rotateMessages = true,
  interval = 3200,
  style,
  className,
}: PageSpinnerProps = {}) {
  // Determine available message pool
  const pool = messages || (context && CONTEXTUAL_MESSAGES[context]) || GENERAL_SPINNER_MESSAGES

  // Choose starting index - starts with signature message first by default
  const [index, setIndex] = useState(() => {
    if (text) return 0
    return randomInitialMessage ? Math.floor(Math.random() * pool.length) : 0
  })

  // Cycle through messages if no static text is set and rotateMessages is enabled
  useEffect(() => {
    if (text || !rotateMessages || pool.length <= 1) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pool.length)
    }, interval)

    return () => clearInterval(timer)
  }, [text, rotateMessages, pool.length, interval])

  const currentMessage = text || pool[index] || GENERAL_SPINNER_MESSAGES[0]

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '24px 16px',
        textAlign: 'center',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <Spinner size={size} color={color} />
      <div
        style={{
          marginTop: 14,
          minHeight: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              margin: 0,
              fontSize: '13.5px',
              fontWeight: 450,
              color: 'var(--text-secondary, #64748b)',
              maxWidth: 440,
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
              fontFamily: "var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif)",
            }}
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
        {subtext && (
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '11.5px',
              color: 'var(--text-tertiary, #94a3b8)',
              fontFamily: "var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif)",
            }}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
