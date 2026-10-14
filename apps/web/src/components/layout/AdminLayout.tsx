import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, BookOpen, FileText, FolderCheck, Users, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/scholarships', icon: BookOpen, label: 'Scholarships' },
  { to: '/admin/applications', icon: FileText, label: 'Applications' },
  { to: '/admin/documents', icon: FolderCheck, label: 'Documents' },
  { to: '/admin/users', icon: Users, label: 'Users' },
]

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas, #FAFAF8)' }}>
      <aside
        style={{
          width: 240,
          background: 'var(--surface-1, #FFFFFF)',
          borderRight: '1px solid var(--border-subtle, #E7E9EE)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(16, 24, 40, 0.03))',
          zIndex: 90,
        }}
      >
        <div
          style={{
            padding: '16px 16px',
            borderBottom: '1px solid var(--border-subtle, #E7E9EE)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 58,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#996416',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(153, 100, 22, 0.2)',
            }}
          >
            <GraduationCap size={18} />
          </div>
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary, #172033)',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              Vidyut
            </p>
            <p
              style={{
                fontSize: 10,
                color: '#996416',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: 0,
                marginTop: 2,
              }}
            >
              Admin Operations
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: isActive ? '#FFF5E3' : 'transparent',
                    color: isActive ? '#996416' : 'var(--text-secondary, #657084)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13,
                    transition: 'background-color var(--transition), color var(--transition)',
                    cursor: 'pointer',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color={isActive ? '#996416' : 'currentColor'} />
                    <span>{label}</span>
                  </div>
                  {isActive && <ChevronRight size={13} color="#996416" />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

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
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#FFF5E3',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: '#996416',
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </div>
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
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover, #F2F4F7)'
              e.currentTarget.style.color = 'var(--text-primary, #172033)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary, #657084)'
            }}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: 240, flex: 1, minHeight: '100vh', background: 'var(--bg-canvas, #FAFAF8)' }}>
        <main style={{ padding: '32px 36px', maxWidth: 1140, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
