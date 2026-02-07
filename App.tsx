import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { AppRoutes } from './components/AppRoutes';
import { TourGuide } from './components/TourGuide';
import { Loading } from './components/Loading';

// Lazy Components
const LoginScreen = React.lazy(() => import('./components/AuthScreens').then(m => ({ default: m.LoginScreen })));
const MaintenanceScreen = React.lazy(() => import('./components/AuthScreens').then(m => ({ default: m.MaintenanceScreen })));
const FrozenScreen = React.lazy(() => import('./components/AuthScreens').then(m => ({ default: m.FrozenScreen })));
const LandingPage = React.lazy(() => import('./components/landing/LandingPage'));
const BlogPage = React.lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = React.lazy(() => import('./components/BlogPostPage').then(m => ({ default: m.BlogPostPage })));

const AppContent: React.FC = () => {
  const auth = useAuth();
  const { globalMaintenance, licenseState } = useData();
  const [runTour, setRunTour] = useState(false);

  // Unauthenticated State
  if (!auth.isAuthenticated) {
    if (globalMaintenance.active) {
      // Maintenance Screen allows Master Bypass
      return (
        <Suspense fallback={<Loading />}>
          <MaintenanceScreen />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Authenticated State Checks
  
  // 1. Frozen State (License Expired/Blocked)
  // Master users can bypass frozen state to fix issues
  if (licenseState.status === 'frozen' && !auth.isMasterMode) {
     return (
       <Suspense fallback={<Loading />}>
         <FrozenScreen />
       </Suspense>
     );
  }

  // 2. Normal App Usage
  return (
    <>
      <TourGuide run={runTour} onFinish={() => setRunTour(false)} />
      <AppRoutes onStartTour={() => setRunTour(true)} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
