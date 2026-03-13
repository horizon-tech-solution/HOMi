// src/api/user/favorites.js
import { get, post, del } from './base';

// GET /user/favorites — { data: [...listings], total: N }
export const fetchFavorites = () => get('/user/favorites');

// POST /user/favorites/:listingId
export const addFavorite = (listingId) => post(`/user/favorites/${listingId}`);

// DELETE /user/favorites/:listingId
export const removeFavorite = (listingId) => del(`/user/favorites/${listingId}`);