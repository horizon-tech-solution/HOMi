import { useAgentAuth } from '../../context/AgentAuthContext';
import { Navigate } from 'react-router-dom';

const AgentRoute = ({ children }) => {
  const { agent, loading } = useAgentAuth();

  if (loading) return null; // or a spinner

  if (!agent) return <Navigate to="/agent/auth" replace />;

  return children;
};

export default AgentRoute;