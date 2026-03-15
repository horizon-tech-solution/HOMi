// src/api/settings.js  (admin)
import { get, put, post } from './base';

export const fetchSettings   = ()         => get('/admin/settings');
export const saveSettings    = (settings) => put('/admin/settings', settings);
export const runDangerAction = (action)   => post(`/admin/settings/danger/${action}`);