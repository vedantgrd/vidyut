import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/services/auth';

/**
 * ProtectedRoute
 * A structural wrapper to ensure that nested routes are only accessible to authenticated users.
 * Currently uses mocked authentication logic for Milestone 5.
 */
export const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  
  const isAuth = isAuthenticated();

  if (!isAuth) {
    // Redirect unauthenticated users to login, preserving their intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
