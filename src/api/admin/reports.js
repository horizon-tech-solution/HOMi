// src/api/reports.js  (admin)
import { get, post, patch, del } from './base';

export const fetchReports = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All')
    params.set('status', status.toLowerCase().replace(' ', '_'));
  return get(`/admin/reports?${params.toString()}`);
};
export const resolveReport       = (id, resolution) => post(`/admin/reports/${id}/resolve`,        { resolution });
export const dismissReport       = (id, note)       => post(`/admin/reports/${id}/dismiss`,        { note });
export const blockReportSubject  = (id)             => post(`/admin/reports/${id}/block-subject`);
export const deleteReportListing = (id)             => del(`/admin/reports/${id}/delete-listing`);
export const saveReportNotes     = (id, notes)      => patch(`/admin/reports/${id}/notes`,         { notes });