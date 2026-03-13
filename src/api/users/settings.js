// src/api/user/settings.js
import { get, put, post } from './base';

export const fetchProfile          = ()      => get('/user/settings/profile');
export const updateProfile         = (body)  => put('/user/settings/profile', body);
export const changePassword        = (body)  => post('/user/settings/password', body);
export const fetchNotifSettings    = ()      => get('/user/settings/notifications');
export const updateNotifSettings   = (body)  => put('/user/settings/notifications', body);