// src/api/user/inquiries.js
import { get, post } from './base';

// GET /user/inquiries — all threads for logged-in user
export const fetchInquiries = () => get('/user/inquiries');

// GET /user/inquiries/:id/messages — messages in a thread
export const fetchMessages = (inquiryId) => get(`/user/inquiries/${inquiryId}/messages`);

// POST /user/inquiries — start a new thread
// body: { listing_id, message }
export const sendInquiry = (listingId, message) =>
  post('/user/inquiries', { listing_id: listingId, message });

// POST /user/inquiries/:id/reply — reply in existing thread
export const replyToInquiry = (inquiryId, message) =>
  post(`/user/inquiries/${inquiryId}/reply`, { message });