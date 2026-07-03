import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * ProtectedRoute component for role-based access control
 * @param children - Component to render if authorized
 * @param requiredRoles - Array of roles required to access (if empty, any authenticated user can access)
 * @param fallbackPath - Path to redirect to if not authorized (default: /403)
 */
export default function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  fallbackPath = '/403'
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles.length > 0 && user?.role) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
}
