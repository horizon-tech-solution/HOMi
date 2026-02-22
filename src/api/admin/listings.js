// api/listings.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const headers = () => ({
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers(), ...options });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Fetch listings for admin review.
 * @param {{ search?: string, status?: string }} params
 * @returns {Promise<Array<{
 *   id: number, status: 'pending'|'approved'|'rejected'|'flagged',
 *   title: string, description: string, type: string, transaction: string,
 *   price: number,
 *   location: { address: string, city: string, region: string, coordinates: string },
 *   specs: { bedrooms: number|null, bathrooms: number, area: number, floor: number|null,
 *             totalFloors: number, yearBuilt: number, furnished: string,
 *             parking: boolean, generator: boolean },
 *   photos: string[],
 *   documents: Array<{ name: string, type: string, status: string, url: string }>,
 *   submittedBy: {
 *     id: string, name: string, email: string, phone: string, role: string,
 *     agencyName?: string, joined: string, totalListings: number,
 *     reports: number, verified: boolean
 *   },
 *   submittedAt: string, approvedAt?: string,
 *   fraudSignals: string[], adminNotes: string, requestedChanges: string,
 * }>>}
 */
export const fetchListings = ({ search = '', status = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'All') params.set('status', status.toLowerCase());
  return request(`/admin/listings?${params.toString()}`);
};

/**
 * Approve a listing.
 * @param {number} listingId
 */
export const approveListing = (listingId) =>
  request(`/admin/listings/${listingId}/approve`, { method: 'POST' });

/**
 * Reject a listing.
 * @param {number} listingId
 * @param {string} reason
 */
export const rejectListing = (listingId, reason) =>
  request(`/admin/listings/${listingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

/**
 * Request changes on a listing.
 * @param {number} listingId
 * @param {string} message
 */
export const requestChanges = (listingId, message) =>
  request(`/admin/listings/${listingId}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

/**
 * Save admin notes for a listing.
 * @param {number} listingId
 * @param {string} notes
 */
export const saveListingNotes = (listingId, notes) =>
  request(`/admin/listings/${listingId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });