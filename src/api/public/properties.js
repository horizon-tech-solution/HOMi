// src/api/public/properties.js
import { get } from './base';

/**
 * Browse / search approved listings.
 *
 * params: {
 *   city, transaction_type, property_type,
 *   listingType,   // alias: 'rent' | 'buy' | 'sale'
 *   price_min, price_max,
 *   bedrooms,
 *   q,             // free-text search
 *   limit, offset
 * }
 */
export const fetchProperties = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) qs.append(k, v);
  });
  const query = qs.toString();
  return get(`/public/properties${query ? `?${query}` : ''}`);
};

/**
 * Single listing detail.
 * GET /public/properties/:id
 */
export const fetchProperty = (id) => get(`/public/properties/${id}`);