import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '../components/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Validando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length > 0) {
    const rolesToCheck = [...allowedRoles];
    if (rolesToCheck.includes('ADMIN') && !rolesToCheck.includes('SUPER_ADMIN')) {
      rolesToCheck.push('SUPER_ADMIN');
    }

    if (!rolesToCheck.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
