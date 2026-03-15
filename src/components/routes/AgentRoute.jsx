// src/components/routes/AgentRoute.jsx
import { useAgentAuth } from '../../context/AgentAuthContext';
import { Navigate     } from 'react-router-dom';

const AgentRoute = ({ children }) => {
  const { agent, loading } = useAgentAuth();

  if (loading) return null;

  if (!agent || agent.role !== 'agent') {
    return <Navigate to="/agent/auth" replace />;
  }

  return children;
};

export default AgentRoute;