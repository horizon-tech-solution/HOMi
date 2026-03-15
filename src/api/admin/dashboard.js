// src/api/dashboard.js  (admin)
import { get, post } from './base';

export const fetchDashboardStats   = () => get('/admin/dashboard/stats');
export const fetchPendingApprovals = () => get('/admin/dashboard/pending');
export const fetchRecentActivity   = () => get('/admin/dashboard/activity');
export const fetchPlatformHealth   = () => get('/admin/dashboard/health');

export const approveItem = ({ id, type }) =>
  post(`/admin/${type === 'agent' ? 'agents' : 'listings'}/${id}/approve`);