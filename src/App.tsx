import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { ALL_ROUTES } from '@/constants/routes';

// Lazy load page components to improve initial bundle size
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
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

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/signup" element={<PlaceholderPage title="Sign Up" />} />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {ALL_ROUTES.map((route) => (
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
