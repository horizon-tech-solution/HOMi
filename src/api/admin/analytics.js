// src/api/analytics.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(sessionStorage.getItem('admin_token'))?.token; }
  catch { return null; }
};

const get = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const fetchGrowthData      = (range = 'last_6_months') => get(`/admin/analytics/growth?range=${range}`);
export const fetchCityData        = () => get('/admin/analytics/cities');
export const fetchPropertyTypes   = () => get('/admin/analytics/property-types');
export const fetchPriceDistribution = () => get('/admin/analytics/price-distribution');
export const fetchModerationData  = () => get('/admin/analytics/moderation');
export const fetchFunnelData      = () => get('/admin/analytics/funnel');
export const fetchHeatmapData     = () => get('/admin/analytics/heatmap');
export const fetchTopAgents       = () => get('/admin/analytics/top-agents');

export const exportAnalyticsCSV = async (range = 'last_6_months') => {
  const res = await fetch(`${BASE_URL}/admin/analytics/export?range=${range}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};