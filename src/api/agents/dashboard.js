// src/api/agents/dashboard.js
import { get } from './base';

export const fetchDashboard = () => get('/agent/dashboard');