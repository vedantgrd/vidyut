import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ArrowRight, Menu, X } from 'lucide-react'

export function PublicLayout() {
  const loc = useLocation()
  const isLanding = loc.pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas, #FAFAF8)', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(250, 250, 248, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
          boxShadow: '0 1px 3px 0 rgba(23, 32, 51, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'var(--primary, #315EAA)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(49, 94, 170, 0.22)'
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-primary, #172033)', letterSpacing: '-0.025em' }}>
                  Vidyut
                </span>
                <span
                  style={{
                    fontSize: 9,
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
              <span style={{ fontSize: 11, color: 'var(--text-muted, #8B95A5)', display: 'block', fontWeight: 500 }}>
                Student Success Platform
              </span>
            </div>
          </Link>

          {isLanding && (
            <nav
              className="desktop-nav"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 8
              }}
            >
              {[
                { id: 'how-it-works', label: 'Student Journey' },
                { id: 'features', label: 'Capabilities' },
                { id: 'scholarships', label: 'Live Grants' },
                { id: 'dbt', label: 'DBT Tracking' },
                { id: 'security', label: 'Trust & Security' }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const elem = document.getElementById(item.id)
                    if (elem) {
                      elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      window.history.pushState(null, '', `#${item.id}`)
                    }
                  }}
                  style={{
                    fontSize: 13,
                    fontWeight: 550,
                    color: 'var(--text-secondary, #5E6A7E)',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary, #172033)'
                    e.currentTarget.style.backgroundColor = 'var(--accent-subtle, #EEF4FC)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary, #5E6A7E)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/login"
            style={{
              fontSize: 13,
              color: 'var(--text-secondary, #5E6A7E)',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '7px 12px',
              borderRadius: 6,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary, #172033)'
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #5E6A7E)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <Link
              to="/signup"
              style={{
                fontSize: 13,
                color: '#ffffff',
                fontWeight: 600,
                background: 'var(--primary, #315EAA)',
                padding: '7px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 5px rgba(49, 94, 170, 0.2)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              Get Started <ArrowRight size={13} />
            </Link>
          </motion.div>

          {isLanding && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-nav-toggle"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                padding: 6,
                color: 'var(--text-primary, #172033)',
                cursor: 'pointer'
              }}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {/* Media query styling inline */}
        <style>{`
          @media (min-width: 820px) {
            .desktop-nav { display: flex !important; }
            .mobile-nav-toggle { display: none !important; }
          }
          @media (max-width: 819px) {
            .mobile-nav-toggle { display: block !important; }
          }
        `}</style>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isLanding && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              background: 'var(--bg-surface, #FFFFFF)',
              borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              zIndex: 40
            }}
          >
            {[
              { id: 'how-it-works', label: 'Student Journey' },
              { id: 'features', label: 'Capabilities' },
              { id: 'scholarships', label: 'Live Grants' },
              { id: 'dbt', label: 'DBT Tracking' },
              { id: 'security', label: 'Trust & Security' }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  const elem = document.getElementById(item.id)
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    window.history.pushState(null, '', `#${item.id}`)
                  }
                }}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary, #172033)',
                  textDecoration: 'none',
                  padding: '6px 0'
                }}
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isLanding ? (
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      ) : (
        <main style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ width: '100%', maxWidth: 460 }}>
            <Outlet />
          </motion.div>
        </main>
      )}
    </div>
  )
}


