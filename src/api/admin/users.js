// api/users.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const headers = () => ({
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers(), ...options });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Fetch users list.
 * @param {{ search?: string, role?: string }} params
 * @returns {Promise<Array<{
 *   id: string, name: string, email: string, phone: string,
 *   role: 'user'|'agent', status: 'active'|'blocked',
 *   agencyName?: string, joined: string, lastActive: string,
 *   listings: number, favorites: number, inquiries: number,
 *   reports: number, verified: boolean,
 *   blockReason?: string, blockedAt?: string,
 *   activityLog: Array<{ type: string, text: string, time: string }>,
 *   recentListings: Array<{ id: number, title: string, status: string, price: string }>,
 * }>>}
 */
export const fetchUsers = ({ search = '', role = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role && role !== 'All') {
    if (role === 'Blocked') {
      params.set('status', 'blocked');
    } else {
      params.set('role', role.toLowerCase());
      params.set('status', 'active');
    }
  }
  return request(`/admin/users?${params.toString()}`);
};

/**
 * Block a user account.
 * @param {string} userId
 * @param {string} reason
 */
export const blockUser = (userId, reason) =>
  request(`/admin/users/${userId}/block`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

/**
 * Unblock a user account.
 * @param {string} userId
 */
export const unblockUser = (userId) =>
  request(`/admin/users/${userId}/unblock`, { method: 'POST' });

/**
 * Permanently delete a user account.
 * @param {string} userId
 */
export const deleteUser = (userId) =>
  request(`/admin/users/${userId}`, { method: 'DELETE' });

/**
 * Send a message to a user from admin.
 * @param {string} userId
 * @param {string} message
 */
export const sendUserMessage = (userId, message) =>
  request(`/admin/users/${userId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });