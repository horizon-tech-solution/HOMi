// src/api/agents.js
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

export const fetchAgents         = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return request(`/admin/agents?${params.toString()}`);
};
export const verifyAgent         = (agentId) => request(`/admin/agents/${agentId}/verify`, { method: 'POST' });
export const rejectAgent         = (agentId, reason) => request(`/admin/agents/${agentId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
export const suspendAgent        = (agentId, reason) => request(`/admin/agents/${agentId}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) });
export const reinstateAgent      = (agentId) => request(`/admin/agents/${agentId}/reinstate`, { method: 'POST' });
export const updateDocumentStatus = (agentId, docId, status) => request(`/admin/agents/${agentId}/documents/${docId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const saveAgentNotes      = (agentId, notes) => request(`/admin/agents/${agentId}/notes`, { method: 'PATCH', body: JSON.stringify({ notes }) });