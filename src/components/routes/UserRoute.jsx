// src/components/UserRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';

export default function UserRoute({ children }) {
  const { user } = useUserAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}