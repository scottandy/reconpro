import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthManager } from './utils/auth';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import SuperAdminLogin from './components/SuperAdminLogin';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import VehicleDetail from './components/VehicleDetail';
import SuperAdminDashboard from './components/SuperAdminDashboard';

type AppView = 'landing' | 'login' | 'register' | 'super-admin';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Check if user is super admin
    const isSuperAdmin = AuthManager.isSuperAdmin(user);
    
    return (
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isSuperAdmin ? <SuperAdminDashboard /> : <Dashboard />} 
          />
          {!isSuperAdmin && (
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  switch (currentView) {
    case 'login':
      return (
        <LoginForm
          onBack={() => setCurrentView('landing')}
          onShowRegister={() => setCurrentView('register')}
          onShowSuperAdmin={() => setCurrentView('super-admin')}
        />
      );
    case 'super-admin':
      return (
        <SuperAdminLogin
          onBack={() => setCurrentView('landing')}
        />
      );
    case 'register':
      return (
        <RegisterForm
          onBack={() => setCurrentView('landing')}
          onShowLogin={() => setCurrentView('login')}
        />
      );
    default:
      return (
        <LandingPage
          onShowLogin={() => setCurrentView('login')}
          onShowRegister={() => setCurrentView('register')}
        />
      );
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;