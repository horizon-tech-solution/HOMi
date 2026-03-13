// src/context/UserAuthContext.jsx
import { createContext, useContext, useState } from 'react';

const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('user_token');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.user || null;
  } catch {
    return null;
  }
};

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromStorage());

  const login = async (email, password) => {
    const res = await fetch('/api/user/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('user_token', JSON.stringify(data));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const res = await fetch('/api/user/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('user_token', JSON.stringify(data));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    setUser(null);
  };

  const getToken = () => {
    try {
      const stored = localStorage.getItem('user_token');
      if (!stored) return null;
      return JSON.parse(stored).token;
    } catch {
      return null;
    }
  };

  return (
    <UserAuthContext.Provider value={{ user, login, register, logout, getToken }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}