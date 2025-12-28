import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to log in, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
