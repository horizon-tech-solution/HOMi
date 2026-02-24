// src/api/settings.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(sessionStorage.getItem('admin_token'))?.token; }
  catch { return null; }
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

export const fetchSettings = async () => {
  const res = await fetch(`${BASE_URL}/admin/settings`, { headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const saveSettings = async (settings) => {
  const res = await fetch(`${BASE_URL}/admin/settings`, { method: 'PUT', headers: headers(), body: JSON.stringify(settings) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const runDangerAction = async (action) => {
  const res = await fetch(`${BASE_URL}/admin/settings/danger/${action}`, { method: 'POST', headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};