// src/api/agents/myListing.js
import { get, post, put, del, upload } from './base';

export const fetchMyListings        = ()             => get('/agent/listings');
export const fetchListing           = (id)           => get(`/agent/listings/${id}`);
export const createListing          = (data)         => post('/agent/listings', data);
export const updateListing          = (id, data)     => put(`/agent/listings/${id}`, data);
export const deleteListing          = (id)           => del(`/agent/listings/${id}`);
export const uploadListingPhotos    = (id, formData) => upload(`/agent/listings/${id}/photos`, formData);
export const uploadListingDocuments = (id, formData) => upload(`/agent/listings/${id}/documents`, formData);