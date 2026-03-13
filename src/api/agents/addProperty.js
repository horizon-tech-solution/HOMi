// src/api/agents/addProperty.js
import { upload } from './base';

// Submits a new property with photos as multipart/form-data.
// formData should include all listing fields + photo files under the key 'photos[]'
export const submitProperty = (formData) => upload('/agent/listings', formData);