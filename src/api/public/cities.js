// src/api/public/cities.js
import { get } from './base';

/**
 * Cities that have approved listings in the DB.
 * GET /public/cities
 * Returns: { data: [{ city, region, listing_count, lat, lng }] }
 */
export const fetchCities = () => get('/public/cities');

/**
 * Search Cameroonian places via Nominatim (OSM) — no API key needed.
 * Returns place suggestions filtered to Cameroon.
 *
 * @param {string} query  - what the user typed
 * @param {number} limit  - max results (default 6)
 */
export const searchPlacesCameroon = async (query, limit = 6) => {
  if (!query || query.trim().length < 2) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q',              `${query.trim()}, Cameroon`);
  url.searchParams.set('format',         'json');
  url.searchParams.set('limit',          String(limit));
  url.searchParams.set('countrycodes',   'cm');          // Cameroon only
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language','en,fr');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'en,fr' },
  });
  if (!res.ok) return [];

  const data = await res.json();

  // Shape each result into { label, shortLabel, lat, lng, type }
  return data.map(place => {
    const addr  = place.address || {};
    const parts = [
      addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.town,
      addr.city   || addr.county || addr.state_district,
      addr.state,
    ].filter(Boolean);

    return {
      label:      place.display_name,
      shortLabel: parts.slice(0, 2).join(', ') || place.display_name.split(',').slice(0, 2).join(','),
      lat:        parseFloat(place.lat),
      lng:        parseFloat(place.lon),
      type:       place.type,
      osmId:      place.osm_id,
    };
  });
};