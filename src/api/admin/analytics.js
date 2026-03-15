// src/api/analytics.js
import { get, getRaw } from './base';

export const fetchGrowthData        = (range = 'last_6_months') => get(`/admin/analytics/growth?range=${range}`);
export const fetchCityData          = () => get('/admin/analytics/cities');
export const fetchPropertyTypes     = () => get('/admin/analytics/property-types');
export const fetchPriceDistribution = () => get('/admin/analytics/price-distribution');
export const fetchModerationData    = () => get('/admin/analytics/moderation');
export const fetchFunnelData        = () => get('/admin/analytics/funnel');
export const fetchHeatmapData       = () => get('/admin/analytics/heatmap');
export const fetchTopAgents         = () => get('/admin/analytics/top-agents');

export const exportAnalyticsCSV = async (range = 'last_6_months') => {
  const res  = await getRaw(`/admin/analytics/export?range=${range}`);
  const blob = await res.blob();
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};