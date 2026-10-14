import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  Compass,
  FileText,
  FolderLock,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Send,
  Menu,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { api } from '@/api/client'

interface NavItem {
  to: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { to: '/scholarships', icon: Compass, label: 'Scholarships' },
      { to: '/applications', icon: FileText, label: 'Applications' },
    ],
  },
  {
    title: 'Toolkit',
    items: [
      { to: '/calendar', icon: CalendarDays, label: 'Calendar & Agenda' },
      { to: '/documents', icon: FolderLock, label: 'Document Vault' },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMsg, setAiMsg] = useState('')
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aiOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiMessages, aiLoading, aiOpen])

  const sendAiMessage = async (overrideMsg?: string) => {
    const raw = overrideMsg ?? aiMsg
    if (!raw.trim() || aiLoading) return
    const msg = raw.trim()
    if (!overrideMsg) setAiMsg('')
    setAiMessages((p) => [...p, { role: 'user', text: msg }])
    setAiLoading(true)
    try {
      const data = await api.post<{ response: string }>('/ai/assist', { message: msg, context: 'general' })
      setAiMessages((p) => [...p, { role: 'ai', text: data.response }])
    } catch {
      setAiMessages((p) => [
        ...p,
        { role: 'ai', text: 'Sorry, I encountered an error connecting to the assistant. Please try again.' },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  const sidebarWidth = collapsed ? 64 : 240

  const renderNavLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted, #8A93A3)',
                padding: '0 12px 6px',
                margin: 0,
              }}
            >
              {section.title}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {section.items.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 34,
                      padding: collapsed ? '0 10px' : '0 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-sm, 6px)',
                      background: isActive ? 'var(--brand-subtle, #EDF3FC)' : 'transparent',
                      color: isActive ? 'var(--brand-primary, #315EAA)' : 'var(--text-secondary, #657084)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      transition: 'background-color var(--transition), color var(--transition)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover, #F2F4F7)'
                        e.currentTarget.style.color = 'var(--text-primary, #172033)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary, #657084)'
                      }
                    }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Icon size={16} color={isActive ? 'var(--brand-primary, #315EAA)' : 'currentColor'} />
                      {label === 'Notifications' && unreadCount > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -4,
                            right: -6,
                            minWidth: 14,
                            height: 14,
                            padding: '0 3px',
                            background: 'var(--brand-primary, #315EAA)',
                            borderRadius: 99,
                            fontSize: '9px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                          }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas, #FAFAF8)' }}>
      {/* Mobile Header (Hidden on Desktop) */}
      <header
        className="mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          background: 'var(--surface-1, #FFFFFF)',
          borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
          zIndex: 90,
          padding: '0 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary, #172033)',
              display: 'flex',
              padding: 4,
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'var(--brand-primary, #315EAA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <GraduationCap size={16} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #172033)' }}>
              Vidyut
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/notifications" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'relative', padding: 6, display: 'flex' }}>
              <Bell size={18} color="var(--text-secondary, #657084)" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--brand-primary, #315EAA)',
                  }}
                />
              )}
            </div>
          </NavLink>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(23, 32, 51, 0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: 99,
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistent Desktop Sidebar & Responsive Drawer */}
      <motion.aside
        animate={{
          width: sidebarWidth,
          x: typeof window !== 'undefined' && window.innerWidth <= 768 && !mobileMenuOpen ? -sidebarWidth : 0,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          background: 'var(--surface-1, #FFFFFF)',
          borderRight: '1px solid var(--border-subtle, #E7E9EE)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '16px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
            height: 58,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md, 8px)',
                background: 'var(--brand-primary, #315EAA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(49, 94, 170, 0.2)',
              }}
            >
              <GraduationCap size={18} />
            </div>
            {!collapsed && (
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary, #172033)',
                    letterSpacing: 'var(--tracking-tight, -0.01em)',
                    lineHeight: 1.1,
                    display: 'block',
                  }}
                >
                  Vidyut
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: 'var(--text-muted, #8A93A3)',
                    display: 'block',
                    marginTop: 1,
                  }}
                >
                  Scholarship Platform
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary, #8A93A3)',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: '14px 10px',
            overflowY: 'auto',
          }}
        >
          {renderNavLinks()}
        </nav>

        {/* Sidebar Footer: User Card & Collapse Toggle */}
        <div
          style={{
            padding: '12px 10px',
            borderTop: '1px solid var(--border-subtle, #E7E9EE)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            background: 'var(--surface-2, #F7F8F9)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm, 6px)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--brand-subtle, #EDF3FC)',
                border: '1px solid var(--border-subtle, #E7E9EE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--brand-primary, #315EAA)',
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary, #172033)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.fullName}
                </p>
                <p
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-muted, #8A93A3)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary, #657084)',
                width: '100%',
                fontSize: 12,
                fontWeight: 500,
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover, #F2F4F7)'
                e.currentTarget.style.color = 'var(--text-primary, #172033)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary, #657084)'
              }}
              title="Sign out"
            >
              <LogOut size={14} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Sign out</span>}
            </button>

            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary, #8A93A3)',
                }}
                title="Expand sidebar"
              >
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0 : sidebarWidth,
          flex: 1,
          transition: 'margin-left 0.18s ease',
          minHeight: '100vh',
          background: 'var(--bg-canvas, #FAFAF8)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main
          style={{
            padding: '32px 36px',
            maxWidth: 1140,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Floating Vidyut AI Assistant Button (Quiet Confidence Styling) */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setAiOpen(!aiOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--brand-primary, #315EAA)',
          border: '1px solid var(--brand-primary, #315EAA)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md, 0 4px 8px -2px rgba(16, 24, 40, 0.06))',
          zIndex: 200,
          color: '#FFFFFF',
        }}
        title="Vidyut Assistant"
      >
        {aiOpen ? <X size={18} /> : <Sparkles size={18} />}
      </motion.button>

      {/* Clean AI Assistant Drawer */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              width: 380,
              maxWidth: 'calc(100vw - 32px)',
              height: 480,
              background: 'var(--surface-1, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E7E9EE)',
              borderRadius: 'var(--radius-xl, 16px)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 200,
              boxShadow: 'var(--shadow-float, 0 16px 32px -8px rgba(16, 24, 40, 0.08))',
              overflow: 'hidden',
            }}
          >
            {/* AI Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-2, #F7F8F9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: 'var(--brand-primary, #315EAA)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Sparkles size={14} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #172033)', margin: 0 }}>
                    Vidyut Assistant
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--success, #247A55)', fontWeight: 500, margin: 0 }}>
                    Connected to profile & vault
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary, #8A93A3)',
                  display: 'flex',
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* AI Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: 'var(--surface-1, #FFFFFF)',
              }}
            >
              {aiMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--text-secondary, #657084)' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--brand-subtle, #EDF3FC)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}
                  >
                    <Sparkles size={15} color="var(--brand-primary, #315EAA)" />
                  </div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary, #172033)',
                      fontSize: 12.5,
                      marginBottom: 3,
                    }}
                  >
                    Vidyut Intelligence Assistant
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary, #657084)', lineHeight: 1.4, margin: '0 0 12px' }}>
                    Connected to your profile, vault, and DBT treasury. Click a topic to ask:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                    {[
                      'Explain my eligibility.',
                      'What can you do?',
                      'Are my vault documents complete?',
                      'Show my installment payouts',
                      'What deadlines are coming up?'
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendAiMessage(prompt)}
                        style={{
                          background: 'var(--surface-2, #F7F8F9)',
                          border: '1px solid var(--border-subtle, #E7E9EE)',
                          borderRadius: 'var(--radius-sm, 6px)',
                          padding: '7px 10px',
                          fontSize: '11.5px',
                          color: 'var(--brand-primary, #315EAA)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--brand-subtle, #EDF3FC)'
                          e.currentTarget.style.borderColor = 'var(--brand-primary, #315EAA)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-2, #F7F8F9)'
                          e.currentTarget.style.borderColor = 'var(--border-subtle, #E7E9EE)'
                        }}
                      >
                        <Sparkles size={11} style={{ flexShrink: 0 }} />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '8px 12px',
                      borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                      background: m.role === 'user' ? 'var(--brand-primary, #315EAA)' : 'var(--surface-2, #F7F8F9)',
                      color: m.role === 'user' ? '#FFFFFF' : 'var(--text-primary, #172033)',
                      border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle, #E7E9EE)',
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #657084)', fontStyle: 'italic', padding: '2px 6px' }}>
                  Consulting verified records...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Input */}
            <div
              style={{
                padding: '10px 14px',
                borderTop: '1px solid var(--border-subtle, #E7E9EE)',
                display: 'flex',
                gap: 8,
                background: 'var(--surface-2, #F7F8F9)',
              }}
            >
              <input
                value={aiMsg}
                onChange={(e) => setAiMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendAiMessage()
                  }
                }}
                placeholder="Ask Vidyut Assistant..."
                style={{
                  flex: 1,
                  height: 34,
                  padding: '0 10px',
                  background: 'var(--surface-1, #FFFFFF)',
                  border: '1px solid var(--border-strong, #D1D5DF)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  color: 'var(--text-primary, #172033)',
                  fontSize: 12.5,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => sendAiMessage()}
                disabled={!aiMsg.trim() || aiLoading}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--brand-primary, #315EAA)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  opacity: !aiMsg.trim() || aiLoading ? 0.5 : 1,
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
