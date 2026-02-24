// src/api/users.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  try { return JSON.parse(sessionStorage.getItem('admin_token'))?.token; }
  catch { return null; }
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers(), ...options });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const fetchUsers     = ({ search = '', role = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role && role !== 'All') {
    if (role === 'Blocked') { params.set('status', 'blocked'); }
    else { params.set('role', role.toLowerCase()); params.set('status', 'active'); }
  }
  return request(`/admin/users?${params.toString()}`);
};
export const blockUser      = (userId, reason) => request(`/admin/users/${userId}/block`, { method: 'POST', body: JSON.stringify({ reason }) });
export const unblockUser    = (userId) => request(`/admin/users/${userId}/unblock`, { method: 'POST' });
export const deleteUser     = (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' });
export const sendUserMessage = (userId, message) => request(`/admin/users/${userId}/message`, { method: 'POST', body: JSON.stringify({ message }) });