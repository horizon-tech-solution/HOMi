// api/reports.js

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
 * Fetch reports list.
 * @param {{ search?: string, status?: string }} params
 * @returns {Promise<Array<{
 *   id: number,
 *   type: 'fraud'|'fake_listing'|'spam'|'harassment'|'misleading'|'inappropriate',
 *   priority: 'high'|'medium'|'low',
 *   status: 'open'|'under_review'|'resolved'|'dismissed',
 *   subjectType: 'listing'|'user',
 *   subjectName: string, reportCount: number,
 *   reportedBy: { name: string, email: string, id: string },
 *   description: string,
 *   evidence: Array<{ type: string, label: string, url: string }>,
 *   messages: Array<{ from: string, name: string, text: string, time: string }>,
 *   linkedListing?: { id: string, title: string, price: string, status: string, image: string },
 *   subject: { name: string, email: string, phone: string|null, role: string, reports: number },
 *   submittedAt: string, resolution?: string, resolvedAt?: string, adminNotes: string,
 * }>>}
 */
export const fetchReports = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') {
    params.set('status', status.toLowerCase().replace(' ', '_'));
  }
  return request(`/admin/reports?${params.toString()}`);
};

/**
 * Mark a report as resolved.
 * @param {number} reportId
 * @param {string} resolution
 */
export const resolveReport = (reportId, resolution) =>
  request(`/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });

/**
 * Dismiss a report.
 * @param {number} reportId
 * @param {string} resolution
 */
export const dismissReport = (reportId, resolution) =>
  request(`/admin/reports/${reportId}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });

/**
 * Block the subject of a report.
 * @param {number} reportId
 */
export const blockReportSubject = (reportId) =>
  request(`/admin/reports/${reportId}/block-subject`, { method: 'POST' });

/**
 * Delete the listing linked to a report.
 * @param {number} reportId
 */
export const deleteReportListing = (reportId) =>
  request(`/admin/reports/${reportId}/delete-listing`, { method: 'DELETE' });

/**
 * Save admin notes for a report.
 * @param {number} reportId
 * @param {string} notes
 */
export const saveReportNotes = (reportId, notes) =>
  request(`/admin/reports/${reportId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });