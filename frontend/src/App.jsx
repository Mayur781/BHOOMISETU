import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProposalsPage from './pages/ProposalsPage';
import LandParcelsPage from './pages/LandParcelsPage';
import GISMapPage from './pages/GISMapPage';
import NotificationsPage from './pages/NotificationsPage';
import AwardsPage from './pages/AwardsPage';
import CompensationPage from './pages/CompensationPage';
import PossessionPage from './pages/PossessionPage';
import RRPage from './pages/RRPage';
import FamiliesPage from './pages/FamiliesPage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import PermissionGuard from './components/common/PermissionGuard';
import { PERMISSIONS } from './config/roles';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-navy flex flex-col items-center justify-center text-white space-y-3">
        <LoadingSpinner size="lg" message="Initializing BhoomiSetu National Portal..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Guard (Redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-navy flex flex-col items-center justify-center text-white space-y-3">
        <LoadingSpinner size="lg" message="Validating Officer Session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Authenticated Government Portal Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route
                path="/proposals"
                element={
                  <PermissionGuard permission={PERMISSIONS.SUBMIT_PROPOSALS}>
                    <ProposalsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/land-parcels"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_PARCELS}>
                    <LandParcelsPage />
                  </PermissionGuard>
                }
              />
              <Route path="/gis-map" element={<GISMapPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route
                path="/awards"
                element={
                  <PermissionGuard permission={PERMISSIONS.PASS_SECTION_23_AWARD}>
                    <AwardsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/compensation"
                element={
                  <PermissionGuard permission={PERMISSIONS.CALCULATE_SOLATIUM}>
                    <CompensationPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/possession"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_POSSESSION}>
                    <PossessionPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/rr"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_RR}>
                    <RRPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/families"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_FAMILIES}>
                    <FamiliesPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/documents"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_DOCUMENTS}>
                    <DocumentsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/reports"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_REPORTS}>
                    <ReportsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_ANALYTICS}>
                    <AnalyticsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <PermissionGuard permission={PERMISSIONS.VIEW_AUDIT_LOGS}>
                    <AuditLogsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <PermissionGuard permission={PERMISSIONS.ADMIN_SETTINGS}>
                    <AdminPage />
                  </PermissionGuard>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}
