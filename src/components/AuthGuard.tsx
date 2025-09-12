'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      console.log('AuthGuard: Checking authentication...', {
        pathname,
        isAuthenticated: isAuthenticated(),
        requiredRole,
        hasRequiredRole: requiredRole ? hasRole(requiredRole) : true
      });
      
      // Check if we're on a public route (login, unauthorized)
      if (pathname === '/login' || pathname === '/unauthorized') {
        console.log('AuthGuard: Public route, allowing access');
        setIsLoading(false);
        return;
      }
      
      if (!isAuthenticated()) {
        console.log('AuthGuard: Not authenticated, redirecting to login');
        router.replace('/login');
        return;
      }

      // Check role if required
      if (requiredRole && !hasRole(requiredRole)) {
        console.log('AuthGuard: Insufficient role, redirecting to unauthorized');
        router.replace('/unauthorized');
        return;
      }

      console.log('AuthGuard: Authentication successful, allowing access');
      setIsLoading(false);
    };

    // Check auth immediately and also after a short delay
    checkAuth();
    const timer = setTimeout(checkAuth, 200);
    return () => clearTimeout(timer);
  }, [isClient, pathname, isAuthenticated, hasRole, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Will redirect to login
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
}
