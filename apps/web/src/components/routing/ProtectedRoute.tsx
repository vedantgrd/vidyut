import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

import { PageSpinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession, currentUser } = useAuthStore()
  const location = useLocation()

  if (isRestoringSession) {
    return (
      <PageSpinner
        minHeight="100vh"
        color="rgba(255, 255, 255, 0.85)"
        context="auth"
        style={{ backgroundColor: '#09090b' }}
      />
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
