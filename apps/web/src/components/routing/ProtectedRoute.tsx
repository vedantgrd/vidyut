import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession, currentUser } = useAuthStore()
  const location = useLocation()

  if (isRestoringSession) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#09090b' }}>
        <div style={{ textAlign: 'center', color: '#a1a1aa' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect student to onboarding if not complete
  if (currentUser?.role === 'STUDENT' && !currentUser.onboardingComplete && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />
  }

  // Prevent completed students from returning to onboarding
  if (currentUser?.role === 'STUDENT' && currentUser.onboardingComplete && location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
