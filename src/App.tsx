import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { GuestRoute } from '@/components/routing/GuestRoute';
import { ALL_ROUTES } from '@/constants/routes';

// Lazy load page components to improve initial bundle size
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const EmailVerificationPage = lazy(() => import('@/pages/auth/EmailVerificationPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const DashboardHomePage = lazy(() => import('@/pages/dashboard/DashboardHomePage'));
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// We extract the routes into a separate component so we can use the `useLocation` hook
// which requires being rendered *inside* the BrowserRouter.
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // AnimatePresence enables exit animations for routes.
    // mode="wait" ensures the exiting route completes its animation before the entering route begins.
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
        
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route 
            path="/" 
            element={
              <Suspense fallback={null}>
                <LandingPage />
              </Suspense>
            } 
          />
        </Route>

        {/* Authentication Routes (Guest Only) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <Suspense fallback={null}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/signup" element={
              <Suspense fallback={null}>
                <SignupPage />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={null}>
                <ForgotPasswordPage />
              </Suspense>
            } />
            <Route path="/verify-email" element={
              <Suspense fallback={null}>
                <EmailVerificationPage />
              </Suspense>
            } />
            <Route path="/unauthorized" element={
              <Suspense fallback={null}>
                <UnauthorizedPage />
              </Suspense>
            } />
          </Route>
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={
              <Suspense fallback={null}>
                <DashboardHomePage />
              </Suspense>
            } />
            {ALL_ROUTES.filter(r => r.path !== '/dashboard').map((route) => (
              <Route 
                key={route.path} 
                path={route.path} 
                element={<PlaceholderPage title={route.label} />} 
              />
            ))}
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
