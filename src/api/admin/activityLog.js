// src/api/admin/activityLog.js
import { get, getRaw } from './base';

export const fetchActivityLog = ({ search = '', category = 'All', page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('page', page);
  params.set('limit', limit);
  return get(`/admin/activity-log?${params.toString()}`);
};

export const exportActivityLogCSV = async ({ search = '', category = 'All' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category.toLowerCase());
  params.set('format', 'csv');

  const res  = await getRaw(`/admin/activity-log/export?${params.toString()}`);
  const blob = await res.blob();
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};