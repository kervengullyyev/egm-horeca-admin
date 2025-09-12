'use client';

import AuthGuard from './AuthGuard';
import AdminLayout from './AdminLayout';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

export default function ProtectedPage({ children, requiredRole = 'admin' }: ProtectedPageProps) {
  return (
    <AuthGuard requiredRole={requiredRole}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
