import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Quiz from './pages/Quiz';
import Recommendations from './pages/Recommendations';
import Browse from './pages/Browse';
import FranchiseDetail from './pages/FranchiseDetail';
import Compare from './pages/Compare';
import Roadmap from './pages/Roadmap';
import LocationIntelligence from './pages/LocationIntelligence';
import OwnerDashboard from './pages/OwnerDashboard';
import AddFranchise from './pages/AddFranchise';

function ProtectedRoute({ children, ownerOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/franchise/:id" element={<FranchiseDetail />} />

        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/roadmap/:id" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute><LocationIntelligence /></ProtectedRoute>} />

        <Route path="/owner/dashboard" element={<ProtectedRoute ownerOnly><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/add" element={<ProtectedRoute ownerOnly><AddFranchise /></ProtectedRoute>} />
        <Route path="/owner/edit/:id" element={<ProtectedRoute ownerOnly><AddFranchise /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
