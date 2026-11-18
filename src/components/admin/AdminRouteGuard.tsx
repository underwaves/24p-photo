import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-fg-light-muted dark:text-fg-dark-muted font-heading">
            กำลังตรวจสอบสิทธิ์การเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
