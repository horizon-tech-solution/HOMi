// src/api/user/report.js
import { post } from './base';

/**
 * Submit a report for a listing or agent.
 * @param {Object} params
 * @param {'listing'|'agent'} params.subjectType
 * @param {number} params.subjectId
 * @param {string} params.type        - reason selected by user
 * @param {string} params.description - additional details
 * @param {number|null} params.linkedListingId - optional, for agent reports from a listing context
 */
export const submitReport = ({ subjectType, subjectId, type, description, linkedListingId = null }) =>
  post('/user/reports', {
    subject_type:      subjectType,
    subject_id:        subjectId,
    type,
    description,
    linked_listing_id: linkedListingId,
  });