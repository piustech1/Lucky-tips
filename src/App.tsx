/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Sections from './pages/Sections';
import VIP from './pages/VIP';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
import LoggedOut from './pages/LoggedOut';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Performance from './pages/Performance';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MainLayout from './layouts/MainLayout';
import PreviousPredictions from './pages/PreviousPredictions';
import Subscription from './pages/Subscription';
import Payment from './pages/Payment';
import { ThemeProvider } from './components/ThemeProvider';
import { UserProvider, useUser } from './contexts/UserContext';
import { auth } from './lib/firebase';

import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTips from './pages/admin/AdminTips';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import AdminHistory from './pages/admin/AdminHistory';
import AdminMarketIntel from './pages/admin/AdminMarketIntel';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminLogoManager from './pages/admin/AdminLogoManager';
import AdminConflicts from './pages/admin/AdminConflicts';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { user, loading, profile } = useUser();
  const isAuthenticated = !!user;

  const [hasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('lucky_tips_onboarding') === 'true';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={!hasSeenOnboarding ? <Onboarding /> : <Navigate to="/login" />} 
        />

        {/* Guest Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/logged-out" 
          element={<LoggedOut />} 
        />
        <Route 
          path="/admin/login" 
          element={<AdminLogin />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} 
        />
        
        {/* Protected Routes */}
        <Route element={isAuthenticated ? <MainLayout onLogout={() => auth.signOut()} /> : <Navigate to={!hasSeenOnboarding ? "/onboarding" : "/login"} />}>
          <Route path="/" element={<Home />} />
          <Route path="/sections" element={<Sections />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/previous" element={<PreviousPredictions />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={localStorage.getItem('admin_authenticated') === 'true' ? <AdminLayout /> : <Navigate to="/admin/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tips" element={<AdminTips />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="market-intel" element={<AdminMarketIntel />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="logo-manager" element={<AdminLogoManager />} />
          <Route path="conflicts" element={<AdminConflicts />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}
