import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'partner' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { userToken, partnerName, isAdminLoggedIn } = useAuthStore();

  if (allowedRole === 'admin') {
    if (!isAdminLoggedIn) {
      // Redirect admin to admin login
      return <Navigate to="/admin" replace />;
    }
  }

  if (allowedRole === 'partner') {
    if (!userToken) {
      // Must login as client first
      return <Navigate to="/auth" replace />;
    }
    if (!partnerName) {
      // Has user account but no active partner profile/not logged in as partner yet
      return <Navigate to="/partner" replace />;
    }
  }

  if (allowedRole === 'client') {
    if (!userToken) {
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
};
