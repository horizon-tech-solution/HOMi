// src/api/agents/profile.js
import { get, put, upload } from './base';

export const fetchProfile   = ()          => get('/agent/profile');
export const updateProfile  = (data)      => put('/agent/profile', data);
export const uploadAvatar   = (formData)  => upload('/agent/profile/avatar', formData);