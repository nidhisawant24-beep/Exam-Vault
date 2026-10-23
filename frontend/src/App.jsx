import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPaperUpload from './pages/AdminPaperUpload';
import AdminPaperList from './pages/AdminPaperList';
import AdminFacultyManager from './pages/AdminFacultyManager';
import AdminAuditLogs from './pages/AdminAuditLogs';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyExams from './pages/FacultyExams';
import FacultyDecryptLab from './pages/FacultyDecryptLab';
import CryptoArchitecture from './pages/CryptoArchitecture';

// Authenticated Layout wrapper
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root index redirector
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/faculty/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPaperUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/papers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPaperList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faculty"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFacultyManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/exams"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/decrypt/:id"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyDecryptLab />
                </ProtectedRoute>
              }
            />

            {/* Shared educational view */}
            <Route path="/crypto-architecture" element={<CryptoArchitecture />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
