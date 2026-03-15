// src/api/users.js  (admin)
import { get, post, del } from './base';

export const fetchUsers = ({ search = '', role = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const roleMap = { Users: 'user', Agents: 'agent', Blocked: 'blocked' };
  const mappedRole = roleMap[role];
  if (mappedRole) params.set('role', mappedRole);
  return get(`/admin/users?${params.toString()}`);
};
export const blockUser       = (id, reason)  => post(`/admin/users/${id}/block`,   { reason });
export const unblockUser     = (id)          => post(`/admin/users/${id}/unblock`);
export const deleteUser      = (id)          => del(`/admin/users/${id}`);
export const sendUserMessage = (id, message) => post(`/admin/users/${id}/message`, { message });