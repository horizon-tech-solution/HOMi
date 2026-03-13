// src/api/public/agents.js
import { get } from './base';

export const fetchAgents  = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return get(`/public/agents${qs ? '?' + qs : ''}`);
};

export const fetchAgent = (id) => get(`/public/agents/${id}`);