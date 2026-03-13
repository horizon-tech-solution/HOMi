// src/api/user/history.js
import { get, post } from './base';

export const fetchHistory  = ()           => get('/user/history/browse');
export const recordView    = (listingId)  => post(`/user/history/view/${listingId}`);