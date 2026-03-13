// src/api/public/home.js
import { get } from './base';

/**
 * Platform statistics (listings count, agents, sales, cities).
 * GET /public/stats
 */
export const fetchStats = () => get('/public/stats');

/**
 * Featured approved listings for homepage carousel.
 * GET /public/featured?limit=6
 */
export const fetchFeatured = (limit = 6) =>
  get(`/public/featured?limit=${limit}`);

/**
 * Top verified agents for homepage section.
 * GET /public/agents?limit=3
 */
export const fetchTopAgents = (limit = 3) =>
  get(`/public/agents?limit=${limit}`);