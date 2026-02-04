import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { AppRoutes } from './components/AppRoutes';
import { LoginScreen, MaintenanceScreen, FrozenScreen } from './components/AuthScreens';
import { TourGuide } from './components/TourGuide';
import LandingPage from './components/landing/LandingPage';
import { BlogPage } from './components/BlogPage';
import { BlogPostPage } from './components/BlogPostPage';

const AppContent: React.FC = () => {
  const auth = useAuth();
  const { globalMaintenance, licenseState } = useData();
  const [runTour, setRunTour] = useState(false);

  // Unauthenticated State
  if (!auth.isAuthenticated) {
    if (globalMaintenance.active) {
      // Maintenance Screen allows Master Bypass
      return <MaintenanceScreen />;
    }
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated State Checks
  
  // 1. Frozen State (License Expired/Blocked)
  // Master users can bypass frozen state to fix issues
  if (licenseState.status === 'frozen' && !auth.isMasterMode) {
     return <FrozenScreen />;
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
