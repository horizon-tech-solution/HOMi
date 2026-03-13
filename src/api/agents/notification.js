// src/api/agents/notification.js
import { get, post, del } from './base';

// All notifications (newest first)
export const fetchNotifications    = ()        => get('/agent/notifications');

// Unread count only — used by AgentNav badge
export const fetchUnreadCount      = ()        => get('/agent/notifications/unread-count');

// Mark a single notification as read
export const markRead              = (id)      => post(`/agent/notifications/${id}/read`);

// Mark ALL unread notifications as read
export const markAllRead           = ()        => post('/agent/notifications/read-all');

// Mark a specific set of IDs as read
export const markSelectedRead      = (ids)     => post('/agent/notifications/read-selected', { ids });

// Delete a single notification
export const deleteNotification    = (id)      => del(`/agent/notifications/${id}`);

// Delete ALL notifications
export const deleteAll             = ()        => del('/agent/notifications');

// Delete a specific set of IDs
export const deleteSelected        = (ids)     => post('/agent/notifications/delete-selected', { ids });