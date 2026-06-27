import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * GuestRoute
 * Ensures authenticated users cannot access guest-only routes like Login or Signup.
 * Redirects them to the dashboard automatically.
 */
export const GuestRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect them to the page they were trying to go to, or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
