// src/api/listings.js
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

export const fetchListings   = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return request(`/admin/listings?${params.toString()}`);
};
export const approveListing  = (id) => request(`/admin/listings/${id}/approve`, { method: 'POST' });
export const rejectListing   = (id, reason) => request(`/admin/listings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
export const requestChanges  = (id, message) => request(`/admin/listings/${id}/request-changes`, { method: 'POST', body: JSON.stringify({ message }) });
export const saveListingNotes = (id, notes) => request(`/admin/listings/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ notes }) });