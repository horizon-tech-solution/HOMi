// api/dashboard.js

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
 * Fetch dashboard summary stats.
 * @returns {Promise<{
 *   totalListings: number, pendingListings: number,
 *   registeredUsers: number, usersThisWeek: number,
 *   verifiedAgents: number, pendingAgents: number,
 *   openReports: number, highPriorityReports: number,
 *   approvedToday: number, blockedAccounts: number,
 *   monthlyInquiries: number, avgResponseTimeHours: number,
 *   listingsTrend: string, usersTrend: string,
 *   agentsTrend: string, reportsTrend: string, inquiriesTrend: string,
 * }>}
 */
export const fetchDashboardStats = () => get('/admin/dashboard/stats');

/**
 * Fetch pending approval items (listings + agent applications).
 * @returns {Promise<Array<{
 *   id: number, title: string, meta: string,
 *   type: 'listing' | 'agent', age: string
 * }>>}
 */
export const fetchPendingApprovals = () => get('/admin/dashboard/pending');

/**
 * Fetch recent admin activity feed.
 * @returns {Promise<Array<{
 *   status: 'approved' | 'rejected' | 'pending' | 'flagged',
 *   text: string, time: string
 * }>>}
 */
export const fetchRecentActivity = () => get('/admin/dashboard/activity');

/**
 * Fetch platform health metrics (0–100 percentages).
 * @returns {Promise<Array<{ label: string, pct: number }>>}
 */
export const fetchPlatformHealth = () => get('/admin/dashboard/health');

/**
 * Approve a pending item (listing or agent application).
 * @param {{ id: number, type: 'listing' | 'agent' }} item
 */
export const approveItem = ({ id, type }) =>
  fetch(`${BASE_URL}/admin/${type === 'agent' ? 'agents' : 'listings'}/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(res => {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  });