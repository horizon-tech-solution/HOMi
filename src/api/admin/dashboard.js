const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem('admin_token'))?.token;
  } catch {
    return null;
  }
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

export const fetchDashboardStats    = () => get('/admin/dashboard/stats');
export const fetchPendingApprovals  = () => get('/admin/dashboard/pending');
export const fetchRecentActivity    = () => get('/admin/dashboard/activity');
export const fetchPlatformHealth    = () => get('/admin/dashboard/health');

export const approveItem = ({ id, type }) =>
  fetch(`${BASE_URL}/admin/${type === 'agent' ? 'agents' : 'listings'}/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  }).then(res => {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  });