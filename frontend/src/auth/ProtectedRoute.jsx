import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';

// Wraps protected routes. `roles` is optional — pass an array of frontend role
// constants (from roles.js) to restrict further. When unauthenticated, we send
// users to /login and remember where they were heading.
export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
