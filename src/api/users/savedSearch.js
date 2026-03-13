// src/api/user/savedSearches.js
import { get, post, del } from './base';

export const fetchSavedSearches  = ()        => get('/user/saved-searches');
export const createSavedSearch   = (body)    => post('/user/saved-searches', body);
export const deleteSavedSearch   = (id)      => del(`/user/saved-searches/${id}`);