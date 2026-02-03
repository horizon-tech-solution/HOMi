export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
];

export const TRANSACTION_TYPES = [
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
];

export const CITIES = [
  { id: 'douala', name: 'Douala', region: 'Littoral' },
  { id: 'yaounde', name: 'Yaoundé', region: 'Centre' },
];

export const BEDROOM_OPTIONS = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 Bedroom' },
  { value: 2, label: '2 Bedrooms' },
  { value: 3, label: '3 Bedrooms' },
  { value: 4, label: '4 Bedrooms' },
  { value: 5, label: '5+ Bedrooms' },
];

export const AMENITIES = [
  { id: 'parking', name: 'Parking' },
  { id: 'security', name: 'Security/Guard' },
  { id: 'water', name: 'Water Supply 24/7' },
  { id: 'electricity', name: 'Electricity 24/7' },
  { id: 'generator', name: 'Generator' },
  { id: 'internet', name: 'Internet Ready' },
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'gym', name: 'Gym' },
  { id: 'ac', name: 'Air Conditioning' },
  { id: 'balcony', name: 'Balcony/Terrace' },
  { id: 'garden', name: 'Garden' },
  { id: 'elevator', name: 'Elevator' },
];

export const SUBSCRIPTION_TIERS = {
  FREE: { id: 'free', name: 'Free', price: 0, listings: 3, featured: 0 },
  BASIC: { id: 'basic', name: 'Basic', price: 5000, listings: 20, featured: 2 },
  PREMIUM: { id: 'premium', name: 'Premium', price: 15000, listings: null, featured: 10 },
};

export const REPORT_REASONS = [
  { value: 'fake', label: 'Fake Listing' },
  { value: 'wrong_info', label: 'Incorrect Information' },
  { value: 'fraud', label: 'Fraud/Scam' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'duplicate', label: 'Duplicate Listing' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];