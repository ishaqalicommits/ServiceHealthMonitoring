import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitorsListPage } from './pages/MonitorsListPage';
import { MonitorAddPage } from './pages/MonitorAddPage';
import { MonitorEditPage } from './pages/MonitorEditPage';
import { MonitorDetailPage } from './pages/MonitorDetailPage';
import { IncidentsListPage } from './pages/IncidentsListPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { StatusPagesAdminPage } from './pages/StatusPagesAdminPage';
import PublicStatusPage from './pages/PublicStatusPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading application...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Only Route (e.g. login — redirect away if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Status Page */}
          <Route path="/status/:slug" element={<PublicStatusPage />} />

          {/* Login Page */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="monitors" element={<MonitorsListPage />} />
            <Route path="monitors/new" element={<MonitorAddPage />} />
            <Route path="monitors/:id" element={<MonitorDetailPage />} />
            <Route path="monitors/:id/edit" element={<MonitorEditPage />} />
            <Route path="incidents" element={<IncidentsListPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="status-pages" element={<StatusPagesAdminPage />} />
            
            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Admin Only Routes */}
            <Route
              path="team"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
