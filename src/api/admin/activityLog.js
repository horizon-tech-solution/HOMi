// src/api/activityLog.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(sessionStorage.getItem('admin_token'))?.token; }
  catch { return null; }
};

export const fetchActivityLog = async ({ search = '', category = 'All', page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('page', page);
  params.set('limit', limit);

  const res = await fetch(`${BASE_URL}/admin/activity-log?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const exportActivityLogCSV = async ({ search = '', category = 'All' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('format', 'csv');

  const res = await fetch(`${BASE_URL}/admin/activity-log/export?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};