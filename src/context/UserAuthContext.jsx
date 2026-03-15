// src/context/UserAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { AgentAuthContext } from './AgentAuthContext';

const UserAuthContext = createContext(null);

const saveUser  = (u) => localStorage.setItem('homi_user',  JSON.stringify(u));
const clearUser = ()  => localStorage.removeItem('homi_user');
const getStored = ()  => {
  try {
    const s = localStorage.getItem('homi_user');
    if (!s) return null;
    const u = JSON.parse(s);
    return u?.role === 'agent' ? null : u;
  } catch { return null; }
};

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStored());

  const agentCtx = useContext(AgentAuthContext);

  // If logged in but no avatar_url yet, fetch profile once to backfill it
  useEffect(() => {
    const stored = getStored();
    if (!stored || stored.avatar_url !== undefined) return; // already has the field
    fetch('/api/user/settings/profile', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.avatar_url !== undefined) {
          const updated = { ...stored, avatar_url: data.avatar_url || null };
          saveUser(updated);
          setUser(updated);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/user/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    const u = data.user; // includes avatar_url from updated AuthController

    if (u.role === 'agent') {
      clearUser();
      setUser(null);
      agentCtx?.setAgentUser(u);
    } else {
      clearUser();
      saveUser(u);
      setUser(u);
    }

    return u;
  };

  const register = async (payload) => {
    const res = await fetch('/api/user/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch('/api/user/auth/logout', {
      method: 'POST', credentials: 'include',
    }).catch(() => {});
    clearUser();
    setUser(null);
  };

  // Call after avatar upload — updates header instantly without re-login
  const updateAvatar = (avatarUrl) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar_url: avatarUrl };
      saveUser(updated);
      return updated;
    });
  };

  const getToken = () => null; // auth is cookie-based

  return (
    <UserAuthContext.Provider value={{ user, login, register, logout, getToken, updateAvatar }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}