import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export function GuestRoute() {
  const { isAuthenticated, isRestoringSession } = useAuthStore()

  if (isRestoringSession) return null

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
