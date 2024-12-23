import { useState, useEffect } from 'react';
import { LoginForm } from './admin/LoginForm';
import { Dashboard } from './admin/Dashboard';
import { checkAuth } from '../utils/auth';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('adminToken');
      const isValid = await checkAuth(token);
      setIsLoggedIn(isValid);
      setIsLoading(false);
    };
    validateSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isLoggedIn ? <Dashboard /> : <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
}