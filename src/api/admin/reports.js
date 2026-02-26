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

export const fetchReports = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All')
    params.set('status', status.toLowerCase().replace(' ', '_'));
  return request(`/admin/reports?${params.toString()}`);
};

export const resolveReport       = (id, resolution) => request(`/admin/reports/${id}/resolve`,       { method: 'POST',   body: JSON.stringify({ resolution }) });
export const dismissReport       = (id, note)       => request(`/admin/reports/${id}/dismiss`,       { method: 'POST',   body: JSON.stringify({ note }) });
export const blockReportSubject  = (id)             => request(`/admin/reports/${id}/block-subject`, { method: 'POST' });
export const deleteReportListing = (id)             => request(`/admin/reports/${id}/delete-listing`,{ method: 'DELETE' });
export const saveReportNotes     = (id, notes)      => request(`/admin/reports/${id}/notes`,         { method: 'PATCH',  body: JSON.stringify({ notes }) });