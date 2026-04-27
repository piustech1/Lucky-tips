/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Sections from './pages/Sections';
import VIP from './pages/VIP';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
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
import { UserProvider } from './contexts/UserContext';

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lucky_tips_auth') === 'true';
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('lucky_tips_onboarding') === 'true';
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lucky_tips_auth');
  };

  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
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
              path="/signup" 
              element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} 
            />
            
            {/* Protected Routes */}
            <Route element={isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <Navigate to={!hasSeenOnboarding ? "/onboarding" : "/login"} />}>
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

            {/* Admin Routes - No button in app, access via /admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tips" element={<AdminTips />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="history" element={<AdminHistory />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

