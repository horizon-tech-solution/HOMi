// src/api/user/listings.js
import { get, post, put, del } from './base';

export const fetchUserListings = ()         => get('/user/listings');
export const createListing     = (body)     => post('/user/listings', body);
export const fetchListing      = (id)       => get(`/user/listings/${id}`);
export const updateListing     = (id, body) => put(`/user/listings/${id}`, body);
export const deleteListing     = (id)       => del(`/user/listings/${id}`);

/**
 * Upload photos for a listing via multipart/form-data.
 * POST /user/listings/{id}/photos
 * Uses raw fetch (not the JSON `post` helper) because the payload is FormData.
 */
export const uploadListingPhotos = async (listingId, formData) => {
  // Token is stored as JSON: { token: '...', user: {...} } under 'user_token'
  const getToken = () => {
    try {
      const stored = localStorage.getItem('user_token');
      if (!stored) return '';
      return JSON.parse(stored).token || '';
    } catch {
      return '';
    }
  };

  const token = getToken();
  const base  = import.meta.env?.VITE_API_URL || 'https://homibackend-production.up.railway.app//api';

  const res = await fetch(`${base}/user/listings/${listingId}/photos`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Do NOT set Content-Type — browser sets it automatically with the boundary
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Photo upload failed (${res.status})`);
  }

  return res.json();
};