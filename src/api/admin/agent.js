// src/api/agents.js  (admin)
import { get, post, patch } from './base';

export const fetchAgents          = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return get(`/admin/agents?${params.toString()}`);
};
export const verifyAgent          = (id)           => post(`/admin/agents/${id}/verify`);
export const rejectAgent          = (id, reason)   => post(`/admin/agents/${id}/reject`,   { reason });
export const suspendAgent         = (id, reason)   => post(`/admin/agents/${id}/suspend`,  { reason });
export const reinstateAgent       = (id)           => post(`/admin/agents/${id}/reinstate`);
export const updateDocumentStatus = (id, docId, status) => patch(`/admin/agents/${id}/documents/${docId}`, { status });
export const saveAgentNotes       = (id, notes)    => patch(`/admin/agents/${id}/notes`,   { notes });