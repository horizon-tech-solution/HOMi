// src/api/listings.js  (admin)
import { get, post, patch, del } from './base';

export const fetchListings    = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return get(`/admin/listings?${params.toString()}`);
};
export const approveListing   = (id)          => post(`/admin/listings/${id}/approve`);
export const rejectListing    = (id, reason)  => post(`/admin/listings/${id}/reject`,          { reason });
export const requestChanges   = (id, message) => post(`/admin/listings/${id}/request-changes`, { message });
export const saveListingNotes = (id, notes)   => patch(`/admin/listings/${id}/notes`,          { notes });