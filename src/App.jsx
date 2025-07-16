import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/Layout/AppLayout';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected pages
import Dashboard from './pages/Dashboard';
import Adherents from './pages/Adherents';
import Cotisations from './pages/Cotisations';
import Soins from './pages/Soins';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/adherents" element={
            <PrivateRoute>
              <AppLayout>
                <Adherents />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/cotisations" element={
            <PrivateRoute>
              <AppLayout>
                <Cotisations />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/soins" element={
            <PrivateRoute>
              <AppLayout>
                <Soins />
              </AppLayout>
            </PrivateRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;