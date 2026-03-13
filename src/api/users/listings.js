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
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const base  = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

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