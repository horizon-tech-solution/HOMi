import { createContext, useContext, useState, useEffect } from 'react';

const AgentAuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'user_token'; // agents share the same token key — same users table

export const AgentAuthProvider = ({ children }) => {
  const [agent, setAgent]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.role === 'agent') {
          setAgent(parsed.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res  = await fetch(`${BASE_URL}/agent/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
    setAgent(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAgent(null);
  };

  const updateAgent = (updates) => {
    const stored  = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
    const updated = { ...stored, user: { ...stored.user, ...updates } };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(updated));
    setAgent((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AgentAuthContext.Provider value={{ agent, loading, login, logout, updateAgent }}>
      {children}
    </AgentAuthContext.Provider>
  );
};

export const useAgentAuth = () => {
  const ctx = useContext(AgentAuthContext);
  if (!ctx) throw new Error('useAgentAuth must be used inside AgentAuthProvider');
  return ctx;
};