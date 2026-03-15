// src/context/AgentAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const AgentAuthContext = createContext(null);

const saveAgent  = (u) => localStorage.setItem('homi_agent', JSON.stringify(u));
const clearAgent = ()  => localStorage.removeItem('homi_agent');
const getStored  = ()  => {
  try {
    const s = localStorage.getItem('homi_agent');
    if (!s) return null;
    const u = JSON.parse(s);
    return u?.role === 'agent' ? u : null;
  } catch { return null; }
};

export const AgentAuthProvider = ({ children }) => {
  const [agent,   setAgent]   = useState(() => getStored());
  const [loading, setLoading] = useState(false);

  // If logged in but no avatar_url yet, fetch profile once to backfill it
  useEffect(() => {
    const stored = getStored();
    if (!stored || stored.avatar_url !== undefined) return;
    fetch(`${BASE_URL}/agent/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.avatar_url !== undefined) {
          const updated = { ...stored, avatar_url: data.avatar_url || null };
          saveAgent(updated);
          setAgent(updated);
        }
      })
      .catch(() => {});
  }, []);

  const setAgentUser = (u) => {
    if (u && u.role === 'agent') {
      saveAgent(u);
      setAgent(u);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/agent/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setAgentUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/agent/auth/logout`, {
      method: 'POST', credentials: 'include',
    }).catch(() => {});
    clearAgent();
    setAgent(null);
  };

  const updateAgent = (updates) => {
    const updated = { ...agent, ...updates };
    saveAgent(updated);
    setAgent(updated);
  };

  // Call after avatar upload — updates header instantly without re-login
  const updateAvatar = (avatarUrl) => {
    if (!agent) return;
    const updated = { ...agent, avatar_url: avatarUrl };
    saveAgent(updated);
    setAgent(updated);
  };

  return (
    <AgentAuthContext.Provider value={{ agent, loading, login, logout, updateAgent, updateAvatar, setAgentUser }}>
      {children}
    </AgentAuthContext.Provider>
  );
};

export const useAgentAuth = () => {
  const ctx = useContext(AgentAuthContext);
  if (!ctx) throw new Error('useAgentAuth must be used inside AgentAuthProvider');
  return ctx;
};