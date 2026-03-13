// src/api/user/dashboard.js
import { get } from './base';

export const fetchDashboard = () => get('/user/dashboard');