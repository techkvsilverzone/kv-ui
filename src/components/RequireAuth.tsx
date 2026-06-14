import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Route guard for authenticated-only pages. Redirects unauthenticated users to
 * /login, preserving the attempted path in `state.from` so they can be returned
 * after a successful login. AuthProvider already blocks rendering until the
 * stored session is validated, so `isAuthenticated` is settled here.
 */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
