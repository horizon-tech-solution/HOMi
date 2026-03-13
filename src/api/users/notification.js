// src/api/user/notifications.js
import { get, post, patch, del } from './base';

export const fetchNotifications       = ()    => get('/user/notifications');
export const markNotificationRead     = (id)  => patch(`/user/notifications/${id}/read`);
export const markAllNotificationsRead = ()    => post('/user/notifications/read-all');
export const deleteNotification       = (id)  => del(`/user/notifications/${id}`);
export const deleteAllNotifications   = ()    => del('/user/notifications');