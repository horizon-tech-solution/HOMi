// src/api/users/history.js
import { get, post } from './base';

export const fetchHistory    = ()           => get('/user/history/browse');
export const recordView      = (listingId)  => post(`/user/history/view/${listingId}`);
export const recordSearch    = (criteria)   => post('/user/history/search', criteria);
export const fetchSavedSearches = ()        => get('/user/saved-searches');
export const deleteSavedSearch  = (id)      => import('./base').then(m => m.del(`/user/saved-searches/${id}`));