'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { isAuthenticated, getUser, getToken } = useAuth();
  const [authState, setAuthState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const user = getUser();
      const token = getToken();
      const authenticated = isAuthenticated();
      
      setAuthState({
        user,
        token: token ? 'Present' : 'Missing',
        authenticated,
        localStorage: typeof window !== 'undefined' ? {
          admin_token: localStorage.getItem('admin_token') ? 'Present' : 'Missing',
          admin_user: localStorage.getItem('admin_user') ? 'Present' : 'Missing'
        } : 'Not available'
      });
    };

    checkAuth();
  }, [getUser, getToken, isAuthenticated]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>

      <div className="mt-6">
        <a 
          href="/login" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
