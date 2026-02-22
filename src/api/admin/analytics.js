// api/analytics.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const get = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Fetch platform growth data (time series).
 * @param {string} range - e.g. 'last_30_days' | 'last_3_months' | 'last_6_months' | 'all_time'
 * @returns {Promise<Array<{
 *   month: string, users: number, agents: number,
 *   listings: number, inquiries: number
 * }>>}
 */
export const fetchGrowthData = (range = 'last_6_months') =>
  get(`/admin/analytics/growth?range=${range}`);

/**
 * Fetch listings breakdown by city.
 * @returns {Promise<Array<{ city: string, listings: number, inquiries: number }>>}
 */
export const fetchCityData = () => get('/admin/analytics/cities');

/**
 * Fetch listings breakdown by property type.
 * @returns {Promise<Array<{ name: string, value: number, color: string }>>}
 */
export const fetchPropertyTypes = () => get('/admin/analytics/property-types');

/**
 * Fetch rental price distribution.
 * @returns {Promise<Array<{ range: string, count: number }>>}
 */
export const fetchPriceDistribution = () => get('/admin/analytics/price-distribution');

/**
 * Fetch moderation overview (monthly approved/rejected/flagged).
 * @returns {Promise<Array<{ month: string, approved: number, rejected: number, flagged: number }>>}
 */
export const fetchModerationData = () => get('/admin/analytics/moderation');

/**
 * Fetch listing conversion funnel.
 * @returns {Promise<Array<{ stage: string, value: number, pct: number }>>}
 */
export const fetchFunnelData = () => get('/admin/analytics/funnel');

/**
 * Fetch weekly activity heatmap (4 weeks × 7 days).
 * @returns {Promise<number[][]>}
 */
export const fetchHeatmapData = () => get('/admin/analytics/heatmap');

/**
 * Fetch top agents ranked by listings.
 * @returns {Promise<Array<{
 *   name: string, agency: string, listings: number,
 *   inquiries: number, rating: number
 * }>>}
 */
export const fetchTopAgents = () => get('/admin/analytics/top-agents');

/**
 * Export analytics report as CSV.
 * @param {string} range
 */
export const exportAnalyticsCSV = async (range = 'last_6_months') => {
  const res = await fetch(`${BASE_URL}/admin/analytics/export?range=${range}`, {
    headers: {
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
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