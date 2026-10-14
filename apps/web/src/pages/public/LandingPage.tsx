import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Banknote,
  ShieldCheck,
  Compass,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Scholarship } from '@/types'

function fmtAmt(a: number) {
  return a >= 100000 ? `₹${(a / 100000).toFixed(1)} Lakh` : `₹${a.toLocaleString('en-IN')}`
}

export function LandingPage() {
  const { data } = useApi(() => api.get<{ scholarships: Scholarship[] }>(`/scholarships?limit=6&sortBy=amount`))
  const featured = data?.scholarships ?? []

  // Interactive Student Journey Stage state
  const [activeStage, setActiveStage] = useState(0)

  const studentJourney = [
    {
      num: '01',
      title: 'Build Profile Once',
      subtitle: 'Reusable Dossier',
      desc: 'Enter personal details, family income, academic marks, and caste category once. Stored securely and automatically reused across every application.',
      badge: 'Single Profile',
      highlight: 'Zero redundant typing across 10+ schemes'
    },
    {
      num: '02',
      title: 'Discover Matches',
      subtitle: 'Rule-Based Engine',
      desc: 'Our deterministic rule engine matches your profile against official central and state scholarship criteria. Clear explanation of why you qualify.',
      badge: 'Transparent Rules',
      highlight: 'No opaque black-box AI scores'
    },
    {
      num: '03',
      title: 'Store in Vault',
      subtitle: 'Private Credentials',
      desc: 'Upload Aadhaar, income certificates, caste certificates, and marksheets once. Encrypted and stream-previewed securely without public links.',
      badge: 'Encrypted Storage',
      highlight: 'Zero re-uploads or Xerox shop queues'
    },
    {
      num: '04',
      title: 'Prepare & Submit',
      subtitle: 'Readiness Guidance',
      desc: 'Pre-flight readiness checks flag missing documents and deadline urgency before submission. One-click dossier generation eliminates human error.',
      badge: 'Pre-flight Validation',
      highlight: 'Deadline Rescue mode prioritizes urgent tasks'
    },
    {
      num: '05',
      title: 'Track Pipeline',
      subtitle: 'Live Status Updates',
      desc: 'Real-time visibility from administrative submission to review, document verification, query resolution, and final sanction.',
      badge: 'Full Visibility',
      highlight: 'Direct feedback on any action required'
    },
    {
      num: '06',
      title: 'Follow DBT Tranches',
      subtitle: 'Multi-Installment Aid',
      desc: 'Track sanctioned awards across staged disbursements (e.g. MahaDBT 50/50 tranches). Exact UTR and bank reference numbers recorded.',
      badge: 'Reconciled Payouts',
      highlight: 'Reconciled against total approved awards'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas, #FAFAF8)', color: 'var(--text-primary, #172033)' }}>
      {/* 1. HERO SECTION */}
      <section style={{ padding: '60px 24px 44px', maxWidth: 1180, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {/* Restrained Trust Statement Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--accent-subtle, #EEF4FC)',
              border: '1px solid var(--accent-border, #C7DCF8)',
              padding: '6px 16px',
              borderRadius: 30,
              marginBottom: 22,
              boxShadow: '0 1px 3px rgba(49, 94, 170, 0.06)'
            }}
          >
            <Sparkles size={14} color="var(--primary, #315EAA)" />
            <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--primary, #315EAA)', letterSpacing: '0.01em' }}>
              Built for Indian Students Navigating Financial Assistance
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 5.2vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'var(--text-primary, #172033)',
              maxWidth: 920,
              margin: '0 auto 20px',
              letterSpacing: '-0.025em'
            }}
          >
            Scholarships without the <br />
            <span style={{ color: 'var(--primary, #315EAA)' }}>paperwork headache.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              color: 'var(--text-secondary, #5E6A7E)',
              maxWidth: 720,
              margin: '0 auto 30px',
              lineHeight: 1.6
            }}
          >
            Build your profile once. Upload your documents once. Find scholarships you actually qualify for. Apply without filling the same information again, and track your application and scholarship funds from one place.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                rightIcon={<ArrowRight size={15} />}
                style={{
                  height: 48,
                  padding: '0 28px',
                  fontSize: 14.5,
                  fontWeight: 650,
                  background: 'var(--primary, #315EAA)',
                  boxShadow: '0 4px 12px rgba(49, 94, 170, 0.22)'
                }}
              >
                Find Scholarships
              </Button>
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault()
                const elem = document.getElementById('how-it-works')
                if (elem) {
                  elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  window.history.pushState(null, '', '#how-it-works')
                }
              }}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="outline"
                size="lg"
                style={{
                  height: 48,
                  padding: '0 24px',
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: 'var(--text-primary, #172033)',
                  borderColor: 'var(--border-subtle, #E7E9EE)',
                  background: 'var(--bg-surface, #FFFFFF)'
                }}
              >
                How Vidyut Works
              </Button>
            </a>
          </div>

          {/* Core Trust Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 28,
              flexWrap: 'wrap',
              color: 'var(--text-secondary, #5E6A7E)',
              fontSize: 12.5,
              fontWeight: 550,
              marginBottom: 44
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <ShieldCheck size={16} color="var(--success, #247A55)" /> Private Encrypted Document Vault
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Compass size={16} color="var(--primary, #315EAA)" /> Deterministic Rule Matching
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Banknote size={16} color="var(--success, #247A55)" /> Multi-Tranche DBT Tracking
            </div>
          </div>
        </motion.div>

        {/* HERO PRODUCT PREVIEW: REALISTIC VIDYUT QUIET CONFIDENCE COMMAND CENTER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            background: 'var(--bg-surface, #FFFFFF)',
            borderRadius: 16,
            border: '1px solid var(--border-subtle, #E7E9EE)',
            boxShadow: '0 20px 48px -12px rgba(23, 32, 51, 0.08), 0 1px 3px rgba(23, 32, 51, 0.04)',
            overflow: 'hidden',
            textAlign: 'left'
          }}
        >
          {/* Window Control Header */}
          <div
            style={{
              background: '#F5F6F8',
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--text-secondary, #5E6A7E)', marginLeft: 8 }}>
                Vidyut Command Center · Student Workspace
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--success, #247A55)',
                background: 'var(--success-subtle, #EDF7F2)',
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid var(--success-border, #C7E8D8)',
                fontWeight: 650
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.65, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success, #247A55)', display: 'inline-block' }}
              />
              Direct Benefit Transfer Active
            </div>
          </div>

          {/* Mock Product Dashboard Body */}
          <div style={{ padding: 22, background: 'var(--bg-canvas, #FAFAF8)' }}>
            {/* Top Operational Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 14 }}>
              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #8B95A5)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Eligible Scholarships
                </p>
                <p className="font-tabular" style={{ fontSize: 24, fontWeight: 750, color: 'var(--primary, #315EAA)', margin: '4px 0 0' }}>
                  12
                </p>
                <p style={{ fontSize: 11, color: 'var(--success, #247A55)', margin: '4px 0 0', fontWeight: 600 }}>
                  ✓ 100% Verified Profile Match
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #8B95A5)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Applications In Pipeline
                </p>
                <p className="font-tabular" style={{ fontSize: 24, fontWeight: 750, color: 'var(--text-primary, #172033)', margin: '4px 0 0' }}>
                  4
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary, #5E6A7E)', margin: '4px 0 0' }}>
                  1 Approved · 2 In Review · 1 Draft
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #8B95A5)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Document Readiness
                </p>
                <p className="font-tabular" style={{ fontSize: 24, fontWeight: 750, color: 'var(--text-primary, #172033)', margin: '4px 0 0' }}>
                  100%
                </p>
                <p style={{ fontSize: 11, color: 'var(--success, #247A55)', margin: '4px 0 0', fontWeight: 600 }}>
                  ✓ 4 Key Credentials Verified
                </p>
              </div>

              <div style={{ background: 'var(--success-subtle, #EDF7F2)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--success-border, #C7E8D8)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--success, #247A55)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  DBT Aid Disbursed
                </p>
                <p className="font-tabular" style={{ fontSize: 24, fontWeight: 750, color: 'var(--success, #247A55)', margin: '4px 0 0' }}>
                  ₹25,000
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary, #5E6A7E)', margin: '4px 0 0', fontWeight: 600 }}>
                  Tranche 2 pending: ₹25,000 scheduled
                </p>
              </div>
            </div>

            {/* Segmented Pipeline Bar & DBT Visualizer in Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              {/* Left Widget: Multi-Installment DBT Tracker */}
              <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Banknote size={16} color="var(--success, #247A55)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)' }}>
                      MahaDBT Post-Matric Grant (Staged DBT)
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success, #247A55)', background: 'var(--success-subtle, #EDF7F2)', padding: '2px 8px', borderRadius: 6 }}>
                    50% PAID
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--success-subtle, #EDF7F2)', borderRadius: 8, border: '1px solid var(--success-border, #C7E8D8)', fontSize: 12 }}>
                    <div>
                      <p style={{ fontWeight: 650, color: 'var(--success, #247A55)', margin: 0 }}>
                        Tranche 1: Semester Tuition Grant
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary, #5E6A7E)', margin: '2px 0 0' }}>
                        ✓ Disbursed · Ref: DBT-2026-992147
                      </p>
                    </div>
                    <span className="font-tabular" style={{ fontWeight: 750, color: 'var(--success, #247A55)', fontSize: 13 }}>
                      ₹25,000
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--bg-canvas, #FAFAF8)', borderRadius: 8, border: '1px solid var(--border-subtle, #E7E9EE)', fontSize: 12 }}>
                    <div>
                      <p style={{ fontWeight: 650, color: 'var(--text-primary, #172033)', margin: 0 }}>
                        Tranche 2: Mid-Academic Maintenance
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--warning, #B45309)', margin: '2px 0 0' }}>
                        ○ Scheduled: Nov 15, 2026
                      </p>
                    </div>
                    <span className="font-tabular" style={{ fontWeight: 750, color: 'var(--text-secondary, #5E6A7E)', fontSize: 13 }}>
                      ₹25,000
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Widget: Rule-Based Match Breakdown */}
              <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={16} color="var(--primary, #315EAA)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)' }}>
                      Eligibility Verification
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary, #315EAA)', background: 'var(--accent-subtle, #EEF4FC)', padding: '2px 8px', borderRadius: 6 }}>
                    100% MATCH
                  </span>
                </div>

                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary, #172033)' }}>
                    <CheckCircle2 size={14} color="var(--success, #247A55)" style={{ flexShrink: 0 }} />
                    <span>Domicile: Maharashtra verified by Domicile Certificate</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary, #172033)' }}>
                    <CheckCircle2 size={14} color="var(--success, #247A55)" style={{ flexShrink: 0 }} />
                    <span>Annual Family Income ≤ ₹8,00,000 threshold (₹2.4L recorded)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary, #172033)' }}>
                    <CheckCircle2 size={14} color="var(--success, #247A55)" style={{ flexShrink: 0 }} />
                    <span>Academic Marksheet: 84.6% meets minimum 60% requirement</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary, #172033)' }}>
                    <CheckCircle2 size={14} color="var(--success, #247A55)" style={{ flexShrink: 0 }} />
                    <span>Vault Dossier: All 4 mandatory credentials verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. THE 6-STAGE STUDENT JOURNEY */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: '64px 24px',
          maxWidth: 1140,
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle, #E7E9EE)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--primary, #315EAA)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Connected Architecture
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary, #172033)', margin: '8px 0 10px', letterSpacing: '-0.02em' }}>
            The Student Success Journey
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary, #5E6A7E)', maxWidth: 600, margin: '0 auto' }}>
            From initial registration to multi-installment bank disbursals, Vidyut simplifies each step into a transparent, connected workflow.
          </p>
        </div>

        {/* Interactive Step Navigator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 8,
            marginBottom: 24
          }}
        >
          {studentJourney.map((step, idx) => {
            const isActive = activeStage === idx
            return (
              <motion.button
                key={step.num}
                onClick={() => setActiveStage(idx)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  background: isActive ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                  border: isActive ? '1px solid var(--primary, #315EAA)' : '1px solid var(--border-subtle, #E7E9EE)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(49, 94, 170, 0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span
                    className="font-tabular"
                    style={{
                      fontSize: 11,
                      fontWeight: 750,
                      color: isActive ? 'var(--primary, #315EAA)' : 'var(--text-muted, #8B95A5)'
                    }}
                  >
                    STEP {step.num}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="activeJourneyDot"
                      style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary, #315EAA)' }}
                    />
                  )}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: 0, lineHeight: 1.3 }}>
                  {step.title}
                </p>
              </motion.button>
            )
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E7E9EE)',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 2px 8px rgba(23, 32, 51, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--primary, #315EAA)',
                    background: 'var(--accent-subtle, #EEF4FC)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    textTransform: 'uppercase'
                  }}
                >
                  {studentJourney[activeStage].badge}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 750, color: 'var(--text-primary, #172033)', margin: '8px 0 4px' }}>
                  {studentJourney[activeStage].title}: {studentJourney[activeStage].subtitle}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success, #247A55)', fontSize: 12.5, fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{studentJourney[activeStage].highlight}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.6, margin: 0 }}>
              {studentJourney[activeStage].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* 3. CAPABILITIES / CORE PILLARS */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-surface, #FFFFFF)',
          borderTop: '1px solid var(--border-subtle, #E7E9EE)',
          borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
          padding: '64px 24px'
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--primary, #315EAA)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Platform Capabilities
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary, #172033)', margin: '8px 0 10px', letterSpacing: '-0.02em' }}>
              Three Engineering Pillars Built for Financial Aid
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary, #5E6A7E)', maxWidth: 640, margin: '0 auto' }}>
              No marketing hyperbole or opaque AI claims. Just purposeful software designed to remove friction from every scholarship application.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Pillar 1: Private Document Vault */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 12px 28px rgba(23, 32, 51, 0.07)' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-canvas, #FAFAF8)',
                border: '1px solid var(--border-subtle, #E7E9EE)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--accent-subtle, #EEF4FC)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}
                >
                  <Lock size={20} color="var(--primary, #315EAA)" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-primary, #172033)', marginBottom: 8 }}>
                  1. Encrypted Document Vault
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.6, marginBottom: 14 }}>
                  Upload income proofs, caste validity, and marksheets once. Documents are stored privately and streamed through authenticated sessions without exposing public URLs.
                </p>
                <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.8, margin: 0 }}>
                  <li>Auto-attaches to eligible applications without re-uploading</li>
                  <li>Role-based reviewer access during verification</li>
                  <li>Clear rejection feedback if an official seal is missing</li>
                </ul>
              </div>
              <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--success, #247A55)' }}>
                  ✓ In-browser PDF & Image Stream Preview
                </span>
              </div>
            </motion.div>

            {/* Pillar 2: Transparent Eligibility Matching */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 12px 28px rgba(23, 32, 51, 0.07)' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-canvas, #FAFAF8)',
                border: '1px solid var(--border-subtle, #E7E9EE)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--success-subtle, #EDF7F2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}
                >
                  <Compass size={20} color="var(--success, #247A55)" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-primary, #172033)', marginBottom: 8 }}>
                  2. Rule-Based Eligibility Engine
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.6, marginBottom: 14 }}>
                  Never waste hours reading dense 40-page gazette circulars. Vidyut checks your domicile state, category, family income, and marks against verified scholarship guidelines.
                </p>
                <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.8, margin: 0 }}>
                  <li>100% deterministic rules with clear pass/fail rationale</li>
                  <li>Instant alerts when income or marks fall outside limits</li>
                  <li>Zero arbitrary or unexplainable AI percentages</li>
                </ul>
              </div>
              <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--primary, #315EAA)' }}>
                  ✓ Transparent Matching Criteria
                </span>
              </div>
            </motion.div>

            {/* Pillar 3: Multi-Installment DBT Fund Tracking */}
            <motion.div
              id="dbt"
              whileHover={{ y: -6, boxShadow: '0 12px 28px rgba(23, 32, 51, 0.07)' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-canvas, #FAFAF8)',
                border: '1px solid var(--border-subtle, #E7E9EE)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                scrollMarginTop: 80
              }}
            >
              <div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#FFF9EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}
                >
                  <Banknote size={20} color="var(--warning, #B45309)" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-primary, #172033)', marginBottom: 8 }}>
                  3. Multi-Tranche DBT Disbursement
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.6, marginBottom: 14 }}>
                  Track financial aid disbursements tranche-by-tranche. Supports 1-time awards, MahaDBT 50/50 stage disbursements, and custom schedules with strict award balance reconciliation.
                </p>
                <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.8, margin: 0 }}>
                  <li>Strict financial reconciliation: total tranches = approved award</li>
                  <li>Recorded with official bank transaction reference codes</li>
                  <li>Distinct statuses: Planned / Scheduled vs Recorded Payout</li>
                </ul>
              </div>
              <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border-subtle, #E7E9EE)' }}>
                <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--warning, #B45309)' }}>
                  ✓ Full Treasury & Audit Transparency
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 4. LIVE ACTIVE SCHOLARSHIPS SHOWCASE */}
      <motion.section
        id="scholarships"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '64px 24px', maxWidth: 1140, margin: '0 auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--primary, #315EAA)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Active Grants
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary, #172033)', margin: '6px 0 4px', letterSpacing: '-0.02em' }}>
              Currently Accepting Applications
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary, #5E6A7E)', margin: 0 }}>
              Curated government, merit, and private scholarships with active future deadlines.
            </p>
          </div>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" rightIcon={<ChevronRight size={13} />}>
              Explore Full Catalog
            </Button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {featured.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', padding: 32, borderRadius: 12, border: '1px solid var(--border-subtle, #E7E9EE)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary, #5E6A7E)', fontSize: 14, margin: 0 }}>
                Loading live active scholarships from verified registry...
              </p>
            </div>
          ) : (
            featured.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -5, borderColor: 'var(--primary, #315EAA)', boxShadow: '0 10px 24px rgba(49, 94, 170, 0.08)' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  background: 'var(--bg-surface, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E7E9EE)',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(23, 32, 51, 0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--primary, #315EAA)',
                        background: 'var(--accent-subtle, #EEF4FC)',
                        padding: '2px 8px',
                        borderRadius: 6
                      }}
                    >
                      {s.scholarshipCategory || 'Government'}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 550, color: 'var(--text-muted, #8B95A5)' }}>
                      Deadline: {new Date(s.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 750, color: 'var(--text-primary, #172033)', marginBottom: 4, lineHeight: 1.35 }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary, #5E6A7E)', marginBottom: 10 }}>
                    {s.provider}
                  </p>
                  {s.shortDescription && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted, #8B95A5)', lineHeight: 1.5, marginBottom: 14 }}>
                      {s.shortDescription.slice(0, 100)}...
                    </p>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle, #E7E9EE)',
                    paddingTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted, #8B95A5)', fontWeight: 600, margin: 0 }}>
                      Award Value
                    </p>
                    <p className="font-tabular" style={{ fontSize: 17, fontWeight: 750, color: 'var(--success, #247A55)', margin: '2px 0 0' }}>
                      {fmtAmt(s.amount)}
                    </p>
                  </div>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="ghost" rightIcon={<ArrowRight size={12} />}>
                      Check Eligibility
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* 5. TRUST, PRIVACY & LEGAL INTEGRITY SECTION */}
      <motion.section
        id="security"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-surface, #FFFFFF)',
          borderTop: '1px solid var(--border-subtle, #E7E9EE)',
          borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
          padding: '60px 24px'
        }}
      >
        <div style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--accent-subtle, #EEF4FC)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}
          >
            <ShieldCheck size={24} color="var(--primary, #315EAA)" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary, #172033)', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Data Privacy & Financial Integrity
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary, #5E6A7E)', lineHeight: 1.6, maxWidth: 720, margin: '0 auto 28px' }}>
            Scholarship applications require sensitive personal, caste, and financial information. Vidyut is built on the principle that your documents belong strictly to you.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, textAlign: 'left', marginBottom: 28 }}>
            <motion.div
              whileHover={{ y: -3, boxShadow: '0 8px 18px rgba(23, 32, 51, 0.06)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ padding: '16px 18px', background: 'var(--bg-canvas, #FAFAF8)', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Lock size={15} color="var(--primary, #315EAA)" />
                <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary, #172033)' }}>
                  Private Document Storage
                </h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #5E6A7E)', margin: 0, lineHeight: 1.5 }}>
                Documents uploaded to your Vault are stored privately and streamed only through authenticated, role-verified sessions. No public URLs.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, boxShadow: '0 8px 18px rgba(23, 32, 51, 0.06)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ padding: '16px 18px', background: 'var(--bg-canvas, #FAFAF8)', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Banknote size={15} color="var(--success, #247A55)" />
                <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary, #172033)' }}>
                  Strict Award Reconciliation
                </h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #5E6A7E)', margin: 0, lineHeight: 1.5 }}>
                Disbursement installments are mathematically reconciled against approved awards. Payouts are explicitly recorded with reference numbers.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, boxShadow: '0 8px 18px rgba(23, 32, 51, 0.06)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ padding: '16px 18px', background: 'var(--bg-canvas, #FAFAF8)', borderRadius: 10, border: '1px solid var(--border-subtle, #E7E9EE)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Compass size={15} color="var(--warning, #B45309)" />
                <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--text-primary, #172033)' }}>
                  Independent Platform
                </h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary, #5E6A7E)', margin: 0, lineHeight: 1.5 }}>
                Vidyut is an independent student success platform. We do not claim official government affiliation or guarantee award approval.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 6. CONVERSION CALL TO ACTION BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 840, margin: '0 auto' }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary, #172033)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Ready to simplify your scholarship journey?
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary, #5E6A7E)', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Build your profile once, store verified credentials in your vault, and let Vidyut match you with grants you qualify for.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button
              size="lg"
              rightIcon={<ArrowRight size={15} />}
              style={{
                height: 46,
                padding: '0 26px',
                fontSize: 14,
                fontWeight: 650,
                background: 'var(--primary, #315EAA)'
              }}
            >
              Create Free Student Account
            </Button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              size="lg"
              style={{
                height: 46,
                padding: '0 24px',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary, #172033)',
                borderColor: 'var(--border-subtle, #E7E9EE)',
                background: 'var(--bg-surface, #FFFFFF)'
              }}
            >
              Sign In to Existing Workspace
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle, #E7E9EE)',
          background: 'var(--bg-surface, #FFFFFF)',
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted, #8B95A5)'
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary, #172033)' }}>Vidyut · विद्युत</span>
            <span>— The AI-First Student Success Platform</span>
          </div>
          <div>
            <span>Private Vault Security · Deterministic Rules · DBT Reconciled</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
