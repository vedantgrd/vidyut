import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award,
  ArrowRight,
  CheckCircle2,
  Search,
  ChevronRight,
  Sparkles,
  Banknote,
  Bot,
  ShieldCheck,
  Compass
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Hero Section */}
      <section style={{ padding: '64px 24px 50px', maxWidth: 1180, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {/* Tagline / Original Vidyut personality banner */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '6px 18px',
              borderRadius: 30,
              marginBottom: 24,
              boxShadow: '0 1px 2px rgba(30,64,175,0.05)'
            }}
          >
            <Sparkles size={15} color="#1e40af" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              Building Vidyut because filling government forms manually is a personality test no one asked for.
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 5.2vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#0f172a',
              maxWidth: 920,
              margin: '0 auto 20px',
              letterSpacing: '-0.025em'
            }}
          >
            Scholarships without the <br />
            <span style={{ color: '#1e40af' }}>paperwork headache.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: '#475569',
              maxWidth: 720,
              margin: '0 auto 32px',
              lineHeight: 1.6
            }}
          >
            Build your profile once. Upload your documents once. Find scholarships you actually qualify for. Apply without filling the same information again, and track your application and scholarship funds from one place.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button size="lg" rightIcon={<ArrowRight size={16} />} style={{ height: 48, padding: '0 28px', fontSize: 15, background: '#1e40af' }}>
                Find Scholarships
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg" style={{ height: 48, padding: '0 26px', fontSize: 15 }}>
                Create Your Profile
              </Button>
            </Link>
          </div>

          {/* Core Trust Pillars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', color: '#475569', fontSize: 13, fontWeight: 500, marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={17} color="#059669" /> Encrypted Vault & Zero Re-uploads
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={17} color="#059669" /> Transparent Rule-Based Match
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Banknote size={17} color="#059669" /> Multi-Installment DBT Tracking
            </div>
          </div>
        </motion.div>

        {/* HERO PRODUCT VISUAL: Realistic Vidyut Command Center Preview */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            textAlign: 'left'
          }}
        >
          {/* Mock Browser Header */}
          <div
            style={{
              background: '#f1f5f9',
              padding: '12px 18px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginLeft: 8 }}>
                Vidyut Command Center · Student Workspace
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b', background: '#ffffff', padding: '3px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Live System Connected
            </div>
          </div>

          {/* Command Center Workspace Preview Body */}
          <div style={{ padding: 24, background: '#f8fafc' }}>
            {/* Top Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 18 }}>
              <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Scholarships Matched</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#1e40af', margin: '4px 0 0' }}>12</p>
                <p style={{ fontSize: 11, color: '#059669', margin: '4px 0 0', fontWeight: 600 }}>✓ 100% Eligible by Profile</p>
              </div>

              <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Applications</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>3</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>1 Approved · 2 In Review</p>
              </div>

              <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Vault Credentials</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>8</p>
                <p style={{ fontSize: 11, color: '#059669', margin: '4px 0 0', fontWeight: 600 }}>✓ Encrypted & Verified</p>
              </div>

              <div style={{ background: '#f0fdf4', padding: '16px 18px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Funds Disbursed (DBT)</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#15803d', margin: '4px 0 0' }}>₹10,000</p>
                <p style={{ fontSize: 11, color: '#166534', margin: '4px 0 0', fontWeight: 600 }}>Next: ₹10,000 Installment pending</p>
              </div>
            </div>

            {/* Live Card Previews Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              {/* Card 1: Fund Tracker Breakdown */}
              <div style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Banknote size={16} color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Direct Benefit Transfer Timeline</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>
                    50% PAID
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0', fontSize: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#166534', margin: 0 }}>Installment 1: First Semester Grant</p>
                      <p style={{ fontSize: 11, color: '#15803d', margin: 0 }}>✓ Ref: DBT-2026-894102</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>₹10,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#334155', margin: 0 }}>Installment 2: Midterm Study Grant</p>
                      <p style={{ fontSize: 11, color: '#d97706', margin: 0 }}>○ Scheduled upon midterm check</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#64748b' }}>₹10,000</span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Match Breakdown Preview */}
              <div style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bot size={16} color="#1e40af" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>AI Match Breakdown</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
                    100% MATCH
                  </span>
                </div>
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
                    <CheckCircle2 size={13} color="#059669" /> Category matches: OBC / Maharashtra
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
                    <CheckCircle2 size={13} color="#059669" /> Family Income ≤ ₹8,00,000 threshold (₹2.5L recorded)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
                    <CheckCircle2 size={13} color="#059669" /> Education: Undergraduate Engineering B.Tech
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
                    <CheckCircle2 size={13} color="#059669" /> Vault credentials: All 3 mandatory documents ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Flagship Pillars Section (AI Verification, Smart Matching, DBT Installment Tracking) */}
      <section id="features" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '70px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Three Pillars Built for Indian Students
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 620, margin: '0 auto' }}>
              No fake government seals. No cluttered portals that crash before deadlines. Just reliable, end-to-end scholarship management.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 26 }}>
            {/* Pillar 1: AI Document Verification */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldCheck size={24} color="#1e40af" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                1. AI Document Vault
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                Upload your income certificate, caste certificate, marksheets, and Aadhaar once. Your credentials stay secure and auto-attach across every application without re-scanning.
              </p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.8, margin: 0 }}>
                <li>Encrypted storage with secure streaming preview</li>
                <li>Clear verification status & actionable rejection reasons</li>
                <li>Automatic duplicate detection preventing clutter</li>
              </ul>
            </div>

            {/* Pillar 2: Smart Matching */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Search size={24} color="#059669" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                2. Smart Eligibility Matching
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                Never waste hours reading complex 40-page gazette notices. Vidyut checks your actual domicile state, annual income, category, and marks against every official rule.
              </p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.8, margin: 0 }}>
                <li>Transparent match explanations showing why you qualify</li>
                <li>Clear warnings if income or education rules fail</li>
                <li>Zero vague percentage estimates — 100% data-driven</li>
              </ul>
            </div>

            {/* Pillar 3: DBT / Multi-Installment Tracking */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Banknote size={24} color="#d97706" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                3. Direct Benefit Transfer (DBT)
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                Track every rupee from administrative approval to your bank account. Built-in support for multi-installment schemes like MahaDBT with transparent reference numbers.
              </p>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.8, margin: 0 }}>
                <li>Multi-installment timelines (e.g. ₹10K + ₹10K tranches)</li>
                <li>Official transaction reference codes (DBT-XXXXXX)</li>
                <li>Real-time notifications whenever payouts are dispatched</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section id="how-it-works" style={{ padding: '70px 24px', maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
            How Vidyut Works in Practice
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 540, margin: '0 auto' }}>
            A complete lifecycle built around the student, not the bureaucratic form.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            {
              step: '01',
              title: 'Build Profile Once',
              desc: 'Fill your personal, family, and marks records once. Stored persistently in PostgreSQL.'
            },
            {
              step: '02',
              title: 'Store Credentials',
              desc: 'Upload certificates to your vault. Stream authenticated previews anytime.'
            },
            {
              step: '03',
              title: 'Instant Discovery',
              desc: 'Browse curated central and state scholarships filtered strictly to what you qualify for.'
            },
            {
              step: '04',
              title: '1-Click Apply & DBT',
              desc: 'Submit with pre-filled dossiers and follow transparent installment disbursement.'
            }
          ].map((item) => (
            <div key={item.step} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                STEP {item.step}
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '14px 0 8px' }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section id="scholarships" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '70px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Live Active Grants
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
                Explore scholarships currently accepting applications with verified future deadlines.
              </p>
            </div>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="outline" rightIcon={<ChevronRight size={14} />}>
                View All Scholarships
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 20 }}>
            {featured.map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                      {s.scholarshipCategory || 'Government'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                      Deadline: {new Date(s.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{s.provider}</p>
                  {s.shortDescription && (
                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
                      {s.shortDescription.slice(0, 110)}...
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, margin: 0 }}>Award Amount</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#059669', margin: '2px 0 0' }}>{fmtAmt(s.amount)}</p>
                  </div>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight size={12} />}>
                      Check Eligibility
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & CTA Footer Banner */}
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1e293b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Award size={24} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>
            Take control of your scholarship journey
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
            Build your profile once, store verified credentials in your vault, and let Vidyut match you with grants you actually qualify for.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button size="lg" style={{ background: '#1e40af', color: '#ffffff', height: 46, padding: '0 28px' }}>
                Create Free Student Account
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="outline"
                size="lg"
                style={{
                  color: '#0f172a',
                  borderColor: '#475569',
                  backgroundColor: '#ffffff',
                  height: 46,
                  padding: '0 24px',
                }}
              >
                Sign In to Vault
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

