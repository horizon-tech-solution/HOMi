// src/pages/agent/Listings/AgentAddProperty.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import PropertyDetails from '../../main/pageDetail/PropertDetails';
import { useUserAuth } from '../../../context/UserAuthContext';
import { createListing, uploadListingPhotos } from '../../../api/agents/myListing';
import {
  ArrowLeft, ArrowRight, Check, Home, MapPin, Sparkles,
  Image as ImageIcon, Eye, Building2, DollarSign, Ruler,
  Bed, Bath, Car, Wifi, Droplet, Zap, Wind, Shield, Camera,
  Upload, X, Navigation, AlertCircle, Maximize2, Minimize2,
  Loader2, AlertTriangle,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Apartment'  },
  { value: 'house',      label: 'House'      },
  { value: 'villa',      label: 'Villa'      },
  { value: 'duplex',     label: 'Duplex'     },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land',       label: 'Land'       },
  { value: 'other',      label: 'Other'      },
];

// Types where rooms / furnished / year built make no sense
const NO_ROOMS_TYPES = ['land', 'commercial'];

const AMENITIES_LIST = [
  { id: 'wifi',      label: 'WiFi',             icon: Wifi      },
  { id: 'parking',   label: 'Parking',          icon: Car       },
  { id: 'pool',      label: 'Swimming Pool',    icon: Droplet   },
  { id: 'gym',       label: 'Gym',              icon: Building2 },
  { id: 'ac',        label: 'Air Conditioning', icon: Wind      },
  { id: 'security',  label: '24/7 Security',    icon: Shield    },
  { id: 'generator', label: 'Generator',        icon: Zap       },
  { id: 'cctv',      label: 'CCTV',             icon: Camera    },
];

const STEPS = [
  { number: 1, title: 'Basic Info', icon: Home      },
  { number: 2, title: 'Location',   icon: MapPin    },
  { number: 3, title: 'Amenities',  icon: Sparkles  },
  { number: 4, title: 'Photos',     icon: ImageIcon },
  { number: 5, title: 'Review',     icon: Eye       },
];

const EMPTY_FORM = {
  title: '', description: '', propertyType: '', listingType: '',
  price: '', bedrooms: '', bathrooms: '', area: '', yearBuilt: '',
  address: '', city: '', region: '',
  latitude: '', longitude: '',
  furnished: '', amenities: [], photos: [],
};

// ─── Number formatting helpers ────────────────────────────────────────────────
const formatNum = (val) => {
  const raw = String(val).replace(/[\s,]/g, '');
  if (!raw || isNaN(raw)) return '';
  return parseInt(raw, 10).toLocaleString('fr-FR');
};
const unformat = (val) => String(val).replace(/[^0-9]/g, '');

// ─────────────────────────────────────────────────────────────────────────────

export default function AgentAddProperty() {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [step, setStep]                   = useState(1);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [errors, setErrors]               = useState({});
  const [showPreview, setShowPreview]     = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [locationName, setLocationName]   = useState('');
  const [isLoadingLoc, setIsLoadingLoc]   = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [apiError, setApiError]           = useState('');

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Derived: does this property type need rooms/furnished/year? ────────────
  const noRooms = NO_ROOMS_TYPES.includes(form.propertyType);

  // ── Clear room fields when switching to a no-rooms type ───────────────────
  useEffect(() => {
    if (noRooms) {
      setForm(p => ({ ...p, bedrooms: '', bathrooms: '', yearBuilt: '', furnished: '' }));
    }
  }, [form.propertyType]);

  // ── Map ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (step === 2 && !mapReady) initMap();
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = isMapExpanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMapExpanded]);

  const initMap = () => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    if (!window.L) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = buildMap;
      document.body.appendChild(s);
    } else buildMap();
  };

  const buildMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = window.L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: true })
      .setView([4.0511, 9.7679], 13);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 20,
    }).addTo(map);
    window.L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;
    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng));
    setMapReady(true);
  };

  const placePin = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = window.L.divIcon({
      html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#D97706,#B45309);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid white;box-shadow:0 4px 12px rgba(217,119,6,.4);"></div>`,
      className: '', iconSize: [40, 40], iconAnchor: [20, 40],
    });
    markerRef.current = window.L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setErrors(p => ({ ...p, coordinates: '' }));
    reverseGeocode(lat, lng);
  };

  // ── Reverse geocode → auto-fill address + city + region ──────────────────
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingLoc(true);
    setLocationName('Loading…');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const d = await r.json();
      if (d?.address) {
        const {
          house_number,
          road, street, pedestrian, footway,
          suburb, neighbourhood, quarter,
          city, town, village, municipality,
          state, region,
        } = d.address;

        // Human-readable overlay label
        const locParts = [
          suburb || neighbourhood || quarter,
          city || town || village || municipality,
          state || region,
        ].filter(Boolean);
        setLocationName(locParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        // Street address: house number + road name (fall back to suburb/neighbourhood)
        const streetName = road || street || pedestrian || footway
                        || suburb || neighbourhood || quarter || '';
        const streetAddress = [house_number, streetName].filter(Boolean).join(' ');

        // Only fill fields that are still empty — preserve any manual edits
        setForm(p => ({
          ...p,
          address: p.address.trim() ? p.address : streetAddress,
          city:    p.city.trim()    ? p.city    : (city    || town    || village    || municipality || ''),
          region:  p.region.trim()  ? p.region  : (state   || region  || ''),
        }));
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoadingLoc(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        mapInstanceRef.current?.setView([lat, lng], 15);
        placePin(lat, lng);
      },
      () => alert('Unable to get location. Please pin manually.')
    );
  };

  const toggleMap = () => {
    setIsMapExpanded(p => !p);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const setNumeric = (field) => (e) => {
    const raw = unformat(e.target.value);
    setForm(p => ({ ...p, [field]: raw }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const toggleAmenity = (id) =>
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(id)
        ? p.amenities.filter(a => a !== id)
        : [...p.amenities, id],
    }));

  const addPhotos = (e) => {
    const MAX_MB = 7;
    const MAX_BYTES = MAX_MB * 1024 * 1024;
    const allFiles = Array.from(e.target.files);
    const oversized = allFiles.filter(f => f.size > MAX_BYTES);
    const valid     = allFiles.filter(f => f.size <= MAX_BYTES);
    if (oversized.length > 0) {
      setErrors(p => ({
        ...p,
        photos: `${oversized.length} file${oversized.length > 1 ? 's' : ''} skipped — max ${MAX_MB} MB each. (${oversized.map(f => f.name).join(', ')})`,
      }));
    } else {
      setErrors(p => ({ ...p, photos: '' }));
    }
    const newFiles = valid.map(file => ({
      id: `new_${Date.now()}_${Math.random()}`, file,
      preview: URL.createObjectURL(file),
    }));
    if (newFiles.length > 0) setForm(p => ({ ...p, photos: [...p.photos, ...newFiles] }));
    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    setForm(p => {
      const photo = p.photos.find(ph => ph.id === photoId);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return { ...p, photos: p.photos.filter(ph => ph.id !== photoId) };
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title.trim())       e.title        = 'Title is required';
      if (!form.description.trim()) e.description  = 'Description is required';
      if (!form.propertyType)       e.propertyType = 'Property type is required';
      if (!form.listingType)        e.listingType  = 'Listing type is required';
      if (!form.price)              e.price        = 'Price is required';
    }
    if (s === 2) {
      if (!form.address.trim())              e.address     = 'Address is required';
      if (!form.city.trim())                 e.city        = 'City is required';
      if (!form.region.trim())               e.region      = 'Region is required';
      if (!form.latitude || !form.longitude) e.coordinates = 'Please pin the location on the map';
    }
    if (s === 4 && !form.photos.length) e.photos = 'At least one photo is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const nextStep = () => {
    if (validate(step)) { setStep(p => Math.min(p + 1, 5)); window.scrollTo(0, 0); }
  };
  const prevStep = () => { setStep(p => Math.max(p - 1, 1)); window.scrollTo(0, 0); };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate(step)) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = {
        title:            form.title,
        description:      form.description,
        property_type:    form.propertyType,
        transaction_type: form.listingType,
        price:            Number(form.price),
        bedrooms:         !noRooms && form.bedrooms  !== '' ? Number(form.bedrooms)  : null,
        bathrooms:        !noRooms && form.bathrooms !== '' ? Number(form.bathrooms) : null,
        area:             form.area !== '' ? Number(form.area) : 0,
        year_built:       !noRooms && form.yearBuilt !== '' ? Number(form.yearBuilt) : null,
        address:          form.address,
        city:             form.city,
        region:           form.region,
        coordinates:      form.latitude && form.longitude ? `${form.latitude},${form.longitude}` : null,
        furnished:        !noRooms ? (form.furnished || null) : null,
        parking:          form.amenities.includes('parking')   ? 1 : 0,
        generator:        form.amenities.includes('generator') ? 1 : 0,
      };

      const res = await createListing(payload);
      const listingId = res?.id;

      if (form.photos.length > 0 && listingId) {
        const BATCH_LIMIT = 6 * 1024 * 1024;
        let batch = new FormData();
        let batchSize = 0;
        const flush = async (b) => { if ([...b.entries()].length > 0) await uploadListingPhotos(listingId, b); };
        for (const photo of form.photos) {
          if (photo.file.size > 7 * 1024 * 1024) { console.warn(`Skipped "${photo.file.name}"`); continue; }
          if (batchSize + photo.file.size > BATCH_LIMIT) { await flush(batch); batch = new FormData(); batchSize = 0; }
          batch.append('photos[]', photo.file, photo.file.name);
          batchSize += photo.file.size;
        }
        await flush(batch);
      }
      navigate('/agent/listings');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('JSON') || msg.includes('token') || msg.includes('unexpected')) {
        setApiError('Listing saved! However, some photos could not be uploaded. Try uploading smaller photos from the listing edit page.');
      } else {
        setApiError(msg || 'Submission failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Preview listing shape — id='preview' so PropertDetails skips agent nav ─

  const previewListing = {
    id:           'preview',   // guard in PropertDetails: owner_id check skips agent nav
    title:        form.title        || 'Property Title',
    price:        parseInt(form.price) || 0,
    location:     [form.address, form.city, form.region].filter(Boolean).join(', ') || 'Location',
    bedrooms:     !noRooms ? (parseInt(form.bedrooms)  || null) : null,
    bathrooms:    !noRooms ? (parseInt(form.bathrooms) || null) : null,
    area:         parseInt(form.area) || 0,
    type:         form.listingType,
    listingType:  form.listingType === 'sale' ? 'For Sale' : 'For Rent',
    image:        form.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    images:       form.photos.map(p => p.preview),
    lat:          parseFloat(form.latitude)  || 4.0511,
    lng:          parseFloat(form.longitude) || 9.7679,
    description:  form.description,
    propertyType: form.propertyType,
    yearBuilt:    !noRooms ? (form.yearBuilt || null) : null,
    parking:      form.amenities.includes('parking') ? 1 : 0,
    // deliberately no owner_id → PropertDetails hides "View Agent Profile"
  };

  // ── Field class ────────────────────────────────────────────────────────────

  const fc = (field, extra = '') =>
    [extra,
      'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm',
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200',
    ].filter(Boolean).join(' ');

  // ── Step renderer ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      // ── STEP 1: Basic Info ───────────────────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            <p className="text-gray-500 mt-1 text-sm">Tell us about your property</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., Modern 3BR Apartment in Bonamoussadi" className={fc('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your property in detail…" rows={5} className={fc('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Property type + Listing type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}
                className={fc('propertyType')}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: 'sale', l: 'For Sale' }, { v: 'rent', l: 'For Rent' }].map(t => (
                  <button key={t.v} type="button" onClick={() => set('listingType', t.v)}
                    className={`px-4 py-3 border-2 rounded-xl font-medium transition-colors text-sm ${
                      form.listingType === t.v
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                    {t.l}
                  </button>
                ))}
              </div>
              {errors.listingType && <p className="text-red-500 text-xs mt-1">{errors.listingType}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (FCFA){form.listingType === 'rent' ? ' / month' : ''} *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" inputMode="numeric"
                value={form.price ? formatNum(form.price) : ''}
                onChange={setNumeric('price')}
                placeholder={form.listingType === 'rent' ? '150 000' : '45 000 000'}
                className={fc('price', 'pl-10 pr-14')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">FCFA</span>
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* ── RESIDENTIAL FIELDS (hidden for land / commercial) ────────── */}
          {!noRooms && (
            <>
              {/* Beds / Baths / Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" min="0" max="20" value={form.bedrooms}
                      onChange={e => set('bedrooms', e.target.value)}
                      placeholder="0" className={fc('bedrooms', 'pl-10')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" min="0" max="20" value={form.bathrooms}
                      onChange={e => set('bathrooms', e.target.value)}
                      placeholder="0" className={fc('bathrooms', 'pl-10')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" inputMode="numeric"
                      value={form.area ? formatNum(form.area) : ''}
                      onChange={setNumeric('area')}
                      placeholder="120" className={fc('area', 'pl-10 pr-9')} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
                  </div>
                </div>
              </div>

              {/* Year Built + Furnished */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                  <input type="number" min="1900" max={new Date().getFullYear()}
                    value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)}
                    placeholder="e.g. 2018" className={fc('yearBuilt')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
                  <select value={form.furnished} onChange={e => set('furnished', e.target.value)}
                    className={fc('furnished')}>
                    <option value="">Select option</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── LAND / COMMERCIAL: area only ─────────────────────────────── */}
          {noRooms && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {form.propertyType === 'land' ? 'Plot Size (m²)' : 'Floor Area (m²)'}
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" inputMode="numeric"
                  value={form.area ? formatNum(form.area) : ''}
                  onChange={setNumeric('area')}
                  placeholder={form.propertyType === 'land' ? 'e.g. 500' : 'e.g. 200'}
                  className={fc('area', 'pl-10 pr-9')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                {form.propertyType === 'land'
                  ? 'Land listings only need plot size, price, and location.'
                  : 'Commercial listings show floor area instead of bedrooms / bathrooms.'}
              </p>
            </div>
          )}
        </div>
      );

      // ── STEP 2: Location ─────────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
            <p className="text-gray-500 mt-1 text-sm">Pin your property — address fields auto-fill from the pin</p>
          </div>

          <button type="button" onClick={useMyLocation}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm">
            <Navigation className="w-4 h-4" /> Use My Current Location
          </button>

          {/* Map */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" /> Click on Map to Pin Location *
              </label>
              <button type="button" onClick={toggleMap}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors">
                {isMapExpanded ? <><Minimize2 className="w-3.5 h-3.5" /> Exit</> : <><Maximize2 className="w-3.5 h-3.5" /> Fullscreen</>}
              </button>
            </div>

            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Click anywhere on the map to drop a pin. Street address, city and region will auto-fill below — you can edit them.
                </p>
              </div>
              <div className="relative">
                <div ref={mapRef} className="w-full h-80 md:h-96" />
                {form.latitude && form.longitude && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Pinned Location</p>
                        {isLoadingLoc
                          ? <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Fetching address…
                            </div>
                          : <p className="text-xs text-gray-600 mt-0.5 break-words">{locationName}</p>
                        }
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.coordinates && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.coordinates}
              </p>
            )}
          </div>

          {/* Address fields — auto-filled from pin, always editable */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
                {isLoadingLoc && <span className="ml-2 text-xs text-blue-500 font-normal">Auto-filling…</span>}
              </label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="e.g., Rue 1.234, Bonamoussadi" className={fc('address')} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="e.g., Douala" className={fc('city')} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                <input type="text" value={form.region} onChange={e => set('region', e.target.value)}
                  placeholder="e.g., Littoral" className={fc('region')} />
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
              </div>
            </div>
          </div>
        </div>
      );

      // ── STEP 3: Amenities ────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
            <p className="text-gray-500 mt-1 text-sm">{form.amenities.length} selected</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map(({ id, label, icon: Icon }) => {
              const on = form.amenities.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleAmenity(id)}
                  className={`p-4 border-2 rounded-xl transition-all relative ${on ? 'border-amber-600 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  {on && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${on ? 'text-amber-600' : 'text-gray-400'}`} />
                  <p className={`text-xs font-semibold text-center ${on ? 'text-amber-700' : 'text-gray-600'}`}>{label}</p>
                </button>
              );
            })}
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            Properties with more amenities attract significantly more inquiries.
          </div>
        </div>
      );

      // ── STEP 4: Photos ───────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
            <p className="text-gray-500 mt-1 text-sm">At least 1 photo required · first photo becomes cover</p>
          </div>
          <label htmlFor="photo-upload"
            className="flex flex-col items-center border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors">
            <Upload className="w-10 h-10 text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700 text-sm">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">PNG · JPG · JPEG · WEBP — max 7 MB each</p>
            <input id="photo-upload" type="file" multiple accept="image/*" onChange={addPhotos} className="hidden" />
          </label>
          {errors.photos && <p className="text-red-500 text-xs">{errors.photos}</p>}
          {form.photos.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {form.photos.length} photo{form.photos.length > 1 ? 's' : ''} selected
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {form.photos.map((photo, i) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded font-semibold">Cover</div>
                    )}
                    <button type="button" onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      // ── STEP 5: Review ───────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
            <p className="text-gray-500 mt-1 text-sm">Double-check everything before submitting</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Preview Your Listing</p>
                <p className="text-sm text-blue-700">See exactly how buyers/renters will see this listing.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowPreview(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
              <Eye className="w-5 h-5" /> Preview Listing
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Title',    value: form.title || '—' },
                { label: 'Price',    value: form.price ? `${formatNum(form.price)} FCFA${form.listingType === 'rent' ? '/mo' : ''}` : '—' },
                { label: 'Location', value: [form.city, form.region].filter(Boolean).join(', ') || '—' },
                { label: 'Type',     value: `${form.propertyType || '—'} · ${form.listingType === 'sale' ? 'For Sale' : form.listingType === 'rent' ? 'For Rent' : '—'}` },
                ...(!noRooms ? [{ label: 'Beds / Baths', value: `${form.bedrooms || '—'} BD · ${form.bathrooms || '—'} BA` }] : []),
                { label: noRooms && form.propertyType === 'land' ? 'Plot Size' : 'Area', value: form.area ? `${formatNum(form.area)} m²` : '—' },
                { label: 'Photos',      value: `${form.photos.length} selected` },
                { label: 'Amenities',   value: `${form.amenities.length} selected` },
                { label: 'Coordinates', value: form.latitude ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="text-gray-800 font-medium text-sm capitalize truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
            <strong>Ready to submit?</strong> Your listing will be reviewed and go live once approved.
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        <div className="mb-8">
          <button onClick={() => navigate('/agent/listings')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Property</h1>
          {user && (
            <p className="text-gray-400 mt-1 text-sm">
              Listing as <span className="font-medium text-gray-600">{user.name || user.email}</span>
            </p>
          )}
        </div>

        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700 flex-1">{apiError}</p>
            <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Step indicators */}
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="flex items-center min-w-max md:min-w-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active    = step === s.number;
              const completed = step > s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      completed ? 'bg-green-500 border-green-500' :
                      active    ? 'bg-amber-600 border-amber-600' : 'bg-white border-gray-200'
                    }`}>
                      {completed
                        ? <Check className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-300'}`} />}
                    </div>
                    <span className={`text-xs mt-2 font-medium whitespace-nowrap ${active ? 'text-amber-600' : 'text-gray-400'}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${completed ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
              step === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          {step < 5 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                : <><Check className="w-4 h-4" /> Submit Listing</>}
            </button>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PropertyDetails
          listing={previewListing}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Fullscreen map overlay */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900">Select Property Location</h3>
                <p className="text-xs text-gray-500">Click to drop a pin — address auto-fills below</p>
              </div>
            </div>
            <button onClick={toggleMap}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
              <Minimize2 className="w-4 h-4" /> Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            {form.latitude && form.longitude && (
              <div className="absolute bottom-6 right-6 w-72 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Pinned Location</p>
                    {isLoadingLoc
                      ? <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Fetching address…
                        </div>
                      : <p className="text-xs text-gray-600 mt-0.5">{locationName}</p>
                    }
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}