// api/activityLog.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch activity log entries from the database.
 * @param {Object} params
 * @param {string} params.search - Search query string
 * @param {string} params.category - Category filter (All, Listings, Agents, Users, Reports, Settings)
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.limit - Results per page (default 50)
 * @returns {Promise<{ data: Array, total: number, page: number }>}
 */
export async function fetchActivityLog({ search = '', category = 'All', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('page', page);
  params.set('limit', limit);

  const res = await fetch(`${BASE_URL}/admin/activity-log?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Include auth token if your API requires it:
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch activity log: ${res.status} ${res.statusText}`);
  }

  return res.json();
  // Expected response shape:
  // {
  //   data: [
  //     {
  //       id: number,
  //       action: string,       // e.g. 'listing_approved'
  //       actor: string,        // e.g. 'Admin' or 'System'
  //       target: string,       // e.g. 'Luxury Villa in Bastos (#1024)'
  //       detail: string,       // human-readable description
  //       time: string,         // ISO 8601 datetime
  //       category: string,     // 'listing' | 'agent' | 'user' | 'report' | 'settings'
  //     },
  //     ...
  //   ],
  //   total: number,
  //   page: number,
  // }
}

/**
 * Export activity log as CSV.
 * Triggers a file download in the browser.
 * @param {Object} params - Same filters as fetchActivityLog
 */
export async function exportActivityLogCSV({ search = '', category = 'All' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('format', 'csv');

  const res = await fetch(`${BASE_URL}/admin/activity-log/export?${params.toString()}`, {
    method: 'GET',
    headers: {
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to export activity log: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}