import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import DsaPage from './pages/DSAPage';
import RoadmapPage from './pages/RoadmapPage';
import RevisionPage from './pages/RevisionPage';
import MistakesPage from './pages/MistakesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><MainLayout><NotesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/dsa" element={<ProtectedRoute><MainLayout><DsaPage /></MainLayout></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><MainLayout><RoadmapPage /></MainLayout></ProtectedRoute>} />
      <Route path="/revision" element={<ProtectedRoute><MainLayout><RevisionPage /></MainLayout></ProtectedRoute>} />
      <Route path="/mistakes" element={<ProtectedRoute><MainLayout><MistakesPage /></MainLayout></ProtectedRoute>} />
      <Route path="*" element={
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          <h3>404 - Page Not Found</h3>
        </div>
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}