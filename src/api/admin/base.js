// src/api/admin/base.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // ← sends homi_admin_token cookie automatically
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

const requestRaw = async (path, options = {}) => {
  // For file downloads — returns raw response not JSON
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: options.headers || {},
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
};

export const get    = (path)             => request(path);
export const post   = (path, body)       => request(path, { method: 'POST',   body: JSON.stringify(body) });
export const put    = (path, body)       => request(path, { method: 'PUT',    body: JSON.stringify(body) });
export const patch  = (path, body)       => request(path, { method: 'PATCH',  body: JSON.stringify(body) });
export const del    = (path)             => request(path, { method: 'DELETE' });
export const getRaw = (path)             => requestRaw(path);