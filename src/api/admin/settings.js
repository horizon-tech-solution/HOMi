// api/settings.js

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const headers = () => ({
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

/**
 * Fetch current platform settings.
 * @returns {Promise<{
 *   requireApproval: boolean, minPhotos: number, maxPhotos: number,
 *   listingExpiryDays: number, maxListingsUser: number, maxListingsAgent: number,
 *   allowCommercial: boolean, allowLand: boolean, allowUserListings: boolean,
 *   requireVerification: boolean, requireLicense: boolean,
 *   requireAgencyProof: boolean, trialListings: number,
 *   requireEmailVerification: boolean, requirePhoneVerification: boolean,
 *   autoBlockThreshold: number, allowNewRegistrations: boolean,
 *   notifyNewListing: boolean, notifyNewAgent: boolean,
 *   notifyNewReport: boolean, notifyFraudAlert: boolean,
 *   adminEmail: string, platformName: string, supportEmail: string,
 *   currency: string, maintenanceMode: boolean,
 * }>}
 */
export const fetchSettings = async () => {
  const res = await fetch(`${BASE_URL}/admin/settings`, { headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Save all platform settings.
 * @param {Object} settings - Full settings object
 * @returns {Promise<{ success: boolean }>}
 */
export const saveSettings = async (settings) => {
  const res = await fetch(`${BASE_URL}/admin/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/**
 * Run a danger zone action.
 * @param {'clear_expired' | 'export_users' | 'reset_platform'} action
 * @returns {Promise<{ success: boolean, message?: string, downloadUrl?: string }>}
 */
export const runDangerAction = async (action) => {
  const res = await fetch(`${BASE_URL}/admin/settings/danger/${action}`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};