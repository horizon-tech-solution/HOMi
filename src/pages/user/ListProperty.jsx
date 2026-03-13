// src/pages/user/Listings/UserAddProperty.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyDetails from '../main/pageDetail/PropertDetails';
import { useUserAuth } from '../../context/UserAuthContext';
import { createListing, uploadListingPhotos } from '../../api/users/listings';
import {
  ArrowLeft, ArrowRight, Check, Home, MapPin, Sparkles,
  Image as ImageIcon, Eye, Building2, DollarSign, Ruler,
  Bed, Bath, Car, Wifi, Droplet, Zap, Wind, Shield, Camera,
  Upload, X, Navigation, AlertCircle, Maximize2, Minimize2,
  Loader2, AlertTriangle, Info, Search, ZoomIn, ZoomOut,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatNum = (val) => {
  const raw = String(val).replace(/[\s,]/g, '');
  if (!raw || isNaN(raw)) return '';
  return parseInt(raw, 10).toLocaleString('fr-FR');
};
const unformat = (val) => String(val).replace(/[^0-9]/g, '');

// ─────────────────────────────────────────────────────────────────────────────

export default function ListProperty() {
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
  const [submitted, setSubmitted]         = useState(false);

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);
  const [mapReady, setMapReady]         = useState(false);
  const [mapSearch, setMapSearch]       = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [mapSearching, setMapSearching] = useState(false);
  const mapSearchTimer                  = useRef(null);

  const noRooms = NO_ROOMS_TYPES.includes(form.propertyType);

  useEffect(() => {
    if (noRooms) setForm(p => ({ ...p, bedrooms: '', bathrooms: '', yearBuilt: '', furnished: '' }));
  }, [form.propertyType]);

  useEffect(() => {
    if (step === 2 && !mapReady) initMap();
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = isMapExpanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMapExpanded]);

  // ── Map ────────────────────────────────────────────────────────────────────
  const initMap = () => {
    const injectCSS = (href, id) => {
      if (document.getElementById(id)) return;
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet'; l.href = href;
      document.head.appendChild(l);
    };
    injectCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'leaflet-css');
    if (!window.L) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = buildMap;
      document.body.appendChild(s);
    } else buildMap();
  };

  const buildMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl: false, scrollWheelZoom: true,
      doubleClickZoom: true, preferCanvas: true,
      zoomSnap: 0.5, wheelPxPerZoomLevel: 60,
    }).setView([4.0511, 9.7679], 13);

    // Voyager tile — identical to Map.jsx
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 20, crossOrigin: true,
    }).addTo(map);

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    mapInstanceRef.current = map;
    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng));
    setMapReady(true);
    setTimeout(() => map.invalidateSize(), 120);
  };

  const placePin = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const L = window.L;
    // Same marker style as Map.jsx buildMarkerHtml
    const icon = L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="position:relative;background:linear-gradient(135deg,#D97706,#B45309);color:white;
          padding:7px 13px;border-radius:8px;font-weight:700;font-size:12px;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          box-shadow:0 4px 14px rgba(217,119,6,0.45);border:2px solid white;white-space:nowrap;">
          📍 Your Property
          <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;
            border-top:8px solid white;"></div>
          <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
            border-top:6px solid #D97706;"></div>
        </div>
        <div style="margin-top:2px;width:32px;height:32px;background:#D97706;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.2);
          display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg)">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>`,
      className: '', iconSize: [110, 74], iconAnchor: [55, 74],
    });
    markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.flyTo([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 15), { animate: true, duration: 0.6 });
    setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setErrors(p => ({ ...p, coordinates: '' }));
    reverseGeocode(lat, lng);
  };

  // Map search (Nominatim — same pattern as Map.jsx fallback)
  useEffect(() => {
    if (!mapSearch.trim()) { setMapSearchResults([]); return; }
    clearTimeout(mapSearchTimer.current);
    mapSearchTimer.current = setTimeout(async () => {
      setMapSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mapSearch)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await r.json();
        setMapSearchResults(data.map(d => ({
          name: d.display_name.split(',').slice(0, 2).join(', '),
          full: d.display_name,
          lat: parseFloat(d.lat), lng: parseFloat(d.lon),
        })));
      } catch { setMapSearchResults([]); }
      setMapSearching(false);
    }, 380);
  }, [mapSearch]);

  const flyToSearchResult = (result) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([result.lat, result.lng], 16, { animate: true, duration: 1.0 });
    setMapSearch(result.name);
    setMapSearchResults([]);
  };

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
          house_number, road, street, pedestrian, footway,
          suburb, neighbourhood, quarter,
          city, town, village, municipality,
          state, region,
        } = d.address;
        const locParts = [
          suburb || neighbourhood || quarter,
          city || town || village || municipality,
          state || region,
        ].filter(Boolean);
        setLocationName(locParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        const streetName = road || street || pedestrian || footway
                        || suburb || neighbourhood || quarter || '';
        const streetAddress = [house_number, streetName].filter(Boolean).join(' ');
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
        photos: `${oversized.length} file${oversized.length > 1 ? 's' : ''} skipped — max ${MAX_MB} MB each.`,
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
      // ── Payload keys match ListingController@store exactly ────────────────
      const payload = {
        title:         form.title,
        description:   form.description,
        propertyType:  form.propertyType,          // controller reads $input['propertyType']
        listingType:   form.listingType,            // controller reads $input['listingType']
        price:         Math.min(Number(form.price) || 0, 2147483647),
        bedrooms:      !noRooms && form.bedrooms  !== '' ? Number(form.bedrooms)  : null,
        bathrooms:     !noRooms && form.bathrooms !== '' ? Number(form.bathrooms) : null,
        landSize:      form.area !== '' ? Math.min(Number(form.area) || 0, 999999) : null, // controller reads $input['landSize'] → area column
        yearBuilt:     !noRooms && form.yearBuilt !== '' ? Number(form.yearBuilt) : null,
        address:       form.address,
        city:          form.city,
        region:        form.region,
        coordinates:   form.latitude && form.longitude ? `${form.latitude},${form.longitude}` : null,
        furnished:     !noRooms ? (form.furnished || null) : null,
        parkingSpaces: form.amenities.includes('parking')   ? 1 : 0, // controller reads $input['parkingSpaces']
        generator:     form.amenities.includes('generator') ? 1 : 0,
      };

      const res = await createListing(payload);
      const listingId = res?.id;

      if (form.photos.length > 0 && listingId) {
        const BATCH_LIMIT = 6 * 1024 * 1024;
        let batch = new FormData();
        let batchSize = 0;
        // Controller reads $_FILES['photos'] — use key 'photos' not 'photos[]'
        const flush = async (b) => {
          if ([...b.entries()].length > 0) await uploadListingPhotos(listingId, b);
        };
        for (const photo of form.photos) {
          if (photo.file.size > 7 * 1024 * 1024) continue;
          if (batchSize + photo.file.size > BATCH_LIMIT) {
            await flush(batch); batch = new FormData(); batchSize = 0;
          }
          batch.append('photos', photo.file, photo.file.name); // 'photos' not 'photos[]'
          batchSize += photo.file.size;
        }
        await flush(batch);
      }

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('JSON') || msg.includes('token') || msg.includes('unexpected')) {
        setApiError('Listing saved! However, some photos could not be uploaded. It will still be reviewed.');
      } else {
        setApiError(msg || 'Submission failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Preview listing object ─────────────────────────────────────────────────
  const previewListing = {
    id:           'preview',
    title:        form.title        || 'Property Title',
    price:        parseInt(form.price) || 0,
    location:     [form.address, form.city, form.region].filter(Boolean).join(', ') || 'Location',
    address:      form.address,
    city:         form.city,
    region:       form.region,
    bedrooms:     !noRooms ? (parseInt(form.bedrooms)  || null) : null,
    bathrooms:    !noRooms ? (parseInt(form.bathrooms) || null) : null,
    area:         parseInt(form.area) || 0,
    type:         form.listingType,
    listingType:  form.listingType === 'sale' ? 'For Sale' : 'For Rent',
    transaction_type: form.listingType,
    property_type: form.propertyType,
    image:        form.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    images:       form.photos.map(p => p.preview),
    lat:          parseFloat(form.latitude)  || 4.0511,
    lng:          parseFloat(form.longitude) || 9.7679,
    description:  form.description,
    yearBuilt:    !noRooms ? (form.yearBuilt || null) : null,
    parking:      form.amenities.includes('parking')   ? 1 : 0,
    generator:    form.amenities.includes('generator') ? 1 : 0,
    // no owner_id → PropertDetails hides "View Agent Profile"
  };

  // ── Field class helper ─────────────────────────────────────────────────────
  const fc = (field, extra = '') =>
    [extra,
      'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm',
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200',
    ].filter(Boolean).join(' ');

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your property has been submitted for review. Our team will check the details
            and get back to you. This usually takes 1–2 business days.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 text-left mb-6">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="space-y-1 text-amber-700 text-xs">
              <li>• Our team reviews your listing for accuracy</li>
              <li>• You'll be notified once it goes live</li>
              <li>• You can manage your listing from your profile</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              Go to My Dashboard
            </button>
            <button onClick={() => { setForm(EMPTY_FORM); setStep(1); setSubmitted(false); }}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
              Submit Another Property
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Info banner — user-specific */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Your listing will be reviewed by our team before going live. Make sure all details are accurate.
            </p>
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
              placeholder="Describe your property in detail — key features, condition, what's nearby…" rows={5}
              className={fc('description')} />
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

          {/* Residential fields */}
          {!noRooms && (
            <>
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

          {/* Land / commercial area field */}
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
                  placeholder="500" className={fc('area', 'pl-10 pr-9')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.propertyType === 'land'
                  ? 'Total land area in square metres'
                  : 'Total usable floor area in square metres'}
              </p>
            </div>
          )}
        </div>
      );

      // ── STEP 2: Location ─────────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Location</h2>
            <p className="text-gray-500 mt-1 text-sm">Click or tap the map to pin your property's exact location</p>
          </div>

          {/* ── Map container — identical structure to Map.jsx ── */}
          <div className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
            errors.coordinates ? 'border-red-300' : form.latitude ? 'border-amber-300' : 'border-gray-200'
          }`} style={{ height: isMapExpanded ? '70vh' : '380px' }}>

            {/* Leaflet mount */}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* Loading overlay */}
            {!mapReady && (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-[2000]">
                <div className="relative w-14 h-14 mb-3">
                  <MapPin className="w-14 h-14 text-amber-500 animate-bounce" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium text-sm">Loading map…</p>
              </div>
            )}

            {mapReady && (<>
              {/* ── Search bar — top-left, same as Map.jsx ── */}
              <div className="absolute top-3 left-3 z-[1000]" style={{ maxWidth: 290, width: 'calc(100% - 64px)' }}>
                <div className="relative">
                  <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={mapSearch}
                      onChange={e => setMapSearch(e.target.value)}
                      placeholder="Search a location…"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                    />
                    {mapSearching && <Loader2 className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0 animate-spin" />}
                    {mapSearch && !mapSearching && (
                      <button className="mr-3 flex-shrink-0" onClick={() => { setMapSearch(''); setMapSearchResults([]); }}>
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                      </button>
                    )}
                  </div>
                  {/* Dropdown */}
                  {mapSearchResults.length > 0 && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
                      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Results</span>
                      </div>
                      {mapSearchResults.map((r, i) => (
                        <button key={i} onClick={() => flyToSearchResult(r)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 leading-tight truncate">{r.name}</div>
                            {r.full && r.full !== r.name && (
                              <div className="text-xs text-gray-400 mt-0.5 truncate">{r.full}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right controls — top-right, same as Map.jsx ── */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
                <button onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200"
                  title="Zoom in">
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <button onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200"
                  title="Zoom out">
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <button onClick={useMyLocation}
                  className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg flex items-center justify-center transition-all"
                  title="Use my location">
                  <Navigation className="w-4 h-4 text-white" />
                </button>
                <button onClick={toggleMap}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200"
                  title={isMapExpanded ? 'Collapse map' : 'Expand map'}>
                  {isMapExpanded
                    ? <Minimize2 className="w-4 h-4 text-gray-700" />
                    : <Maximize2 className="w-4 h-4 text-gray-700" />}
                </button>
              </div>

              {/* ── Pin confirmation badge — bottom-left above scale ── */}
              {form.latitude && form.longitude && (
                <div className="absolute bottom-8 left-3 z-[1000]">
                  <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-green-200 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700 max-w-[200px] truncate">
                      {isLoadingLoc ? 'Detecting address…' : locationName || `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Tap hint when no pin yet ── */}
              {!form.latitude && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5">
                    <p className="text-xs font-semibold text-gray-600 whitespace-nowrap">👆 Click the map to place your pin</p>
                  </div>
                </div>
              )}
            </>)}

            {/* Map.jsx popup + cluster CSS */}
            <style>{`
              .homi-marker { background: none !important; border: none !important; }
              .leaflet-control-scale-line {
                border: 2px solid #374151 !important; border-top: none !important;
                background: rgba(255,255,255,0.88) !important;
                font-size: 11px !important; font-weight: 600 !important; color: #374151 !important;
                border-radius: 0 0 5px 5px !important; padding: 1px 6px !important;
              }
              .leaflet-control-attribution {
                background: rgba(255,255,255,0.45) !important;
                font-size: 8px !important; padding: 1px 5px !important;
                color: #aaa !important; opacity: 0.55 !important;
                transition: opacity 0.2s; border-radius: 6px 0 0 0 !important;
              }
              .leaflet-control-attribution:hover { opacity: 1 !important; background: rgba(255,255,255,0.95) !important; }
            `}</style>
          </div>

          {/* Coordinates error */}
          {errors.coordinates && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.coordinates}
            </div>
          )}

          {/* ── Address fields — auto-filled by reverseGeocode, editable ── */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Auto-filled from map pin — or type manually" className={fc('address')} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      // ── STEP 3: Amenities ─────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Amenities & Features</h2>
            <p className="text-gray-500 mt-1 text-sm">Select all that apply</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map(({ id, label, icon: Icon }) => {
              const active = form.amenities.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleAmenity(id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-amber-200 text-gray-500'
                  }`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                  {active && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              );
            })}
          </div>

          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {form.amenities.map(id => {
                const a = AMENITIES_LIST.find(x => x.id === id);
                return a ? (
                  <span key={id} className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {a.label}
                    <button onClick={() => toggleAmenity(id)} className="hover:text-amber-900 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      );

      // ── STEP 4: Photos ────────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
            <p className="text-gray-500 mt-1 text-sm">Upload clear, well-lit photos. First photo will be the cover.</p>
          </div>

          {errors.photos && typeof errors.photos === 'string' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {errors.photos}
            </div>
          )}

          {/* Upload zone */}
          <label className="relative block">
            <input type="file" multiple accept="image/*" onChange={addPhotos} className="sr-only" />
            <div className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <div className="w-14 h-14 bg-amber-50 group-hover:bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                <Upload className="w-7 h-7 text-amber-500" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Click or drag photos here</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WEBP · max 7 MB per photo</p>
            </div>
          </label>

          {/* Photo grid */}
          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.photos.map((photo, idx) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      Cover
                    </span>
                  )}
                  <button onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.file.name}
                  </div>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <input type="file" multiple accept="image/*" onChange={addPhotos} className="sr-only" />
                <Upload className="w-6 h-6 text-gray-300 group-hover:text-amber-500 mb-1 transition-colors" />
                <span className="text-xs text-gray-400 group-hover:text-amber-600 transition-colors">Add more</span>
              </label>
            </div>
          )}
        </div>
      );

      // ── STEP 5: Review ─────────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
            <p className="text-gray-500 mt-1 text-sm">Double-check everything before submitting</p>
          </div>

          <button onClick={() => setShowPreview(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-700 rounded-xl font-semibold text-sm transition-all">
            <Eye className="w-5 h-5" /> Preview Listing
          </button>

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
                { label: 'Amenities',   value: form.amenities.length ? form.amenities.join(', ') : 'None' },
                { label: 'Coordinates', value: form.latitude ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="text-gray-800 font-medium text-sm capitalize truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Before you submit</p>
              <p>Your listing will be reviewed by our team. We may contact you to verify details. Listings with inaccurate information may be removed.</p>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple top nav — no AgentNav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-semibold text-gray-700">List Your Property</span>
          <div className="w-16" /> {/* spacer */}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Property</h1>
          {user && (
            <p className="text-gray-400 mt-1 text-sm">
              Submitting as <span className="font-medium text-gray-600">{user.name || user.email}</span>
            </p>
          )}
        </div>

        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700 flex-1">{apiError}</p>
            <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="flex items-center min-w-max md:min-w-0">
            {STEPS.map((s, i) => {
              const Icon      = s.icon;
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

      {/* Fullscreen map */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900">Select Property Location</h3>
                <p className="text-xs text-gray-500">Click anywhere to drop a pin — address fills automatically</p>
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