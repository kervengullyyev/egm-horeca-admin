'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function TestRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, getUser } = useAuth();

  useEffect(() => {
    console.log('TestRedirectPage: Checking auth state...');
    console.log('isAuthenticated:', isAuthenticated());
    console.log('user:', getUser());
    
    // This page should redirect to login if not authenticated
    if (!isAuthenticated()) {
      console.log('TestRedirectPage: Not authenticated, should redirect to login');
      router.replace('/login');
    }
  }, [isAuthenticated, getUser, router]);

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Redirect Page</h1>
        <p className="text-gray-600 mb-4">You are authenticated!</p>
        <p className="text-sm text-gray-500">User: {getUser()?.email}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
