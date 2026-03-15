// src/components/routes/UserRoute.jsx
import { useUserAuth  } from '../../context/UserAuthContext';
import { useAgentAuth } from '../../context/AgentAuthContext';
import { Navigate     } from 'react-router-dom';

const UserRoute = ({ children }) => {
  const { user  } = useUserAuth();
  const { agent } = useAgentAuth();

  if (!user && !agent) return <Navigate to="/auth" replace />;

  return children;
};

export default UserRoute;