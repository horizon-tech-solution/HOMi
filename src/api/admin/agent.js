// api/agents.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const headers = () => ({
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: headers(),
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Fetch agent list with optional filters.
 * @param {{ search?: string, status?: string }} params
 * @returns {Promise<Array<{
 *   id: string, status: 'pending'|'verified'|'rejected'|'suspended',
 *   name: string, email: string, phone: string,
 *   region: string, city: string, agencyName: string, agencyType: string,
 *   licenseNumber: string, yearsExperience: number,
 *   submittedAt: string, verifiedAt?: string,
 *   bio: string,
 *   documents: Array<{ id: string, name: string, type: string, url: string, status: string }>,
 *   stats: { listings: number, reviews: number, rating: number|null },
 *   reports: number, adminNotes: string, rejectionReason: string,
 *   suspendedReason?: string,
 * }>>}
 */
export const fetchAgents = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return request(`/admin/agents?${params.toString()}`);
};

/**
 * Verify an agent application.
 * @param {string} agentId
 */
export const verifyAgent = (agentId) =>
  request(`/admin/agents/${agentId}/verify`, { method: 'POST' });

/**
 * Reject an agent application.
 * @param {string} agentId
 * @param {string} reason
 */
export const rejectAgent = (agentId, reason) =>
  request(`/admin/agents/${agentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

/**
 * Suspend a verified agent.
 * @param {string} agentId
 * @param {string} reason
 */
export const suspendAgent = (agentId, reason) =>
  request(`/admin/agents/${agentId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

/**
 * Reinstate a suspended agent.
 * @param {string} agentId
 */
export const reinstateAgent = (agentId) =>
  request(`/admin/agents/${agentId}/reinstate`, { method: 'POST' });

/**
 * Update the status of a single document on an agent's application.
 * @param {string} agentId
 * @param {string} docId
 * @param {'verified' | 'flagged' | 'pending'} status
 */
export const updateDocumentStatus = (agentId, docId, status) =>
  request(`/admin/agents/${agentId}/documents/${docId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

/**
 * Save admin notes for an agent.
 * @param {string} agentId
 * @param {string} notes
 */
export const saveAgentNotes = (agentId, notes) =>
  request(`/admin/agents/${agentId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });