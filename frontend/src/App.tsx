/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './lib/database';
import { User } from './types';
import SimulatedTimeHeader from './components/SimulatedTimeHeader';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import SecurityDashboard from './components/SecurityDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminSetupModal from './components/AdminSetupModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'landing' | 'login' | 'register'>('landing');
  const [isAdminSetupOpen, setIsAdminSetupOpen] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  // Load user session on start
  const refreshUser = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    db.hasAdmin().then(res => setHasAdmin(res)).catch(() => setHasAdmin(false));
  };

  useEffect(() => {
    refreshUser();

    // Listen to storage events to keep auth state synchronized
    const handleStorageUpdate = () => {
      refreshUser();
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleAuthSuccess = () => {
    refreshUser();
  };

  const handleLogout = () => {
    db.logoutUser();
    setCurrentUser(null);
    setScreen('landing');
  };

  // Render the appropriate panel based on auth and role
  const renderContent = () => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'employee':
          return (
            <EmployeeDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
            />
          );
        case 'security':
          return (
            <SecurityDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
            />
          );
        case 'admin':
          return (
            <AdminDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
            />
          );
        default:
          return (
            <div className="p-8 text-center">
              <p className="text-red-600 font-bold">Error: Unknown User Role "{currentUser.role}"</p>
              <button 
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          );
      }
    }

    // Unauthenticated Screens
    switch (screen) {
      case 'login':
        return (
          <LoginPage 
            onSuccess={handleAuthSuccess} 
            onNavigateBack={() => setScreen('landing')} 
            onNavigateRegister={() => setScreen('register')} 
            onOpenAdminSetup={() => setIsAdminSetupOpen(true)}
          />
        );
      case 'register':
        return (
          <RegisterPage 
            onSuccess={() => setScreen('login')} 
            onNavigateBack={() => setScreen('landing')} 
            onNavigateLogin={() => setScreen('login')} 
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage 
            onNavigate={(target) => setScreen(target)} 
            onOpenAdminSetup={() => setIsAdminSetupOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Simulated Time Policy Tracker Header */}
      <SimulatedTimeHeader />
      
      {/* Dynamic Screen Area */}
      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>

      {/* Admin Setup Modal */}
      <AdminSetupModal 
        isOpen={isAdminSetupOpen} 
        onClose={() => setIsAdminSetupOpen(false)} 
        onSuccess={() => {
          refreshUser();
        }}
      />
    </div>
  );
}
