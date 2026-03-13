// src/api/agents/leads.js
import { get, post } from './base';

// All inquiries on this agent's listings
export const fetchLeads  = ()             => get('/agent/leads');

// Single inquiry + full message thread
export const fetchLead   = (id)           => get(`/agent/leads/${id}`);

// Send a reply
export const replyToLead = (id, message)  => post(`/agent/leads/${id}/reply`, { message });