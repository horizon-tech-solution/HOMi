// src/pages/user/Listings/UserEditProperty.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserNav from '../../../components/UserNav';
import PropertyDetails from '../../main/pageDetail/PropertDetails';
import { useUserAuth } from '../../../context/UserAuthContext';
import { fetchListing, updateListing } from '../../../api/users/listings';
import {
  ArrowLeft, ArrowRight, Check, Home, MapPin, Sparkles,
  Image as ImageIcon, Eye, Building2, DollarSign, Ruler,
  Bed, Bath, Car, Wifi, Droplet, Zap, Wind, Shield, Camera,
  Upload, X, Navigation, AlertCircle, Maximize2, Minimize2,
  Save, Loader2, CheckCircle2, AlertTriangle, Info,
  Search, ZoomIn, ZoomOut,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatNum = (val) => {
  const raw = String(val).replace(/[\s,]/g, '');
  if (!raw || isNaN(raw)) return '';
  return parseInt(raw, 10).toLocaleString('fr-FR');
};
const unformat = (val) => String(val).replace(/[^0-9]/g, '');

// ─── DB row → form state ──────────────────────────────────────────────────────
const dbToForm = (row) => {
  let latitude = '', longitude = '';
  if (row.coordinates) {
    const [lat, lng] = row.coordinates.split(',').map(s => s.trim());
    if (lat && lng) { latitude = lat; longitude = lng; }
  }

  const amenities = [];
  if (Number(row.parking)   === 1) amenities.push('parking');
  if (Number(row.generator) === 1) amenities.push('generator');

  const photos = (row.photos || []).map((p, i) => ({
    id: p.id ?? i,
    preview: p.photo_url,
    photo_url: p.photo_url,
    is_cover: Number(p.is_cover) === 1,
    isExisting: true,
  }));
  if (!photos.length && row.cover_photo)
    photos.push({ id: 0, preview: row.cover_photo, photo_url: row.cover_photo, is_cover: true, isExisting: true });

  return {
    title:        row.title            ?? '',
    description:  row.description      ?? '',
    propertyType: row.property_type    ?? '',
    listingType:  row.transaction_type ?? '',
    price:        row.price            != null ? String(row.price)      : '',
    bedrooms:     row.bedrooms         != null ? String(row.bedrooms)   : '',
    bathrooms:    row.bathrooms        != null ? String(row.bathrooms)  : '',
    area:         row.area             != null ? String(row.area)       : '',
    yearBuilt:    row.year_built       != null ? String(row.year_built) : '',
    address:      row.address          ?? '',
    city:         row.city             ?? '',
    region:       row.region           ?? '',
    latitude,
    longitude,
    furnished:    row.furnished        ?? '',
    amenities,
    photos,
  };
};

// ─── Build JSON payload for PUT ───────────────────────────────────────────────
// User ListingController@update uses JSON body (same as store)
const buildPayload = (form) => ({
  title:         form.title,
  description:   form.description,
  propertyType:  form.propertyType,
  listingType:   form.listingType,
  price:         Math.min(Number(form.price) || 0, 2147483647),
  bedrooms:      form.bedrooms  !== '' ? Number(form.bedrooms)  : null,
  bathrooms:     form.bathrooms !== '' ? Number(form.bathrooms) : null,
  landSize:      form.area      !== '' ? Math.min(Number(form.area) || 0, 999999) : null,
  yearBuilt:     form.yearBuilt !== '' ? Number(form.yearBuilt) : null,
  address:       form.address,
  city:          form.city,
  region:        form.region,
  coordinates:   form.latitude && form.longitude ? `${form.latitude},${form.longitude}` : null,
  furnished:     form.furnished || null,
  parkingSpaces: form.amenities.includes('parking')   ? 1 : 0,
  generator:     form.amenities.includes('generator') ? 1 : 0,
});

// ─────────────────────────────────────────────────────────────────────────────
export default function UserEditProperty() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { user }  = useUserAuth();

  const [step, setStep]                   = useState(1);
  const [form, setForm]                   = useState(null);
  const [errors, setErrors]               = useState({});
  const [changedFields, setChangedFields] = useState(new Set());
  const [showPreview, setShowPreview]     = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [locationName, setLocationName]   = useState('');
  const [isLoadingLoc, setIsLoadingLoc]   = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [loadError, setLoadError]         = useState('');
  const [apiError, setApiError]           = useState('');

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);
  const [mapReady, setMapReady]                 = useState(false);
  const [mapSearch, setMapSearch]               = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [mapSearching, setMapSearching]         = useState(false);
  const mapSearchTimer = useRef(null);
  const skipNextSearch = useRef(false);

  // ── Load listing ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) { setLoadError('No listing ID.'); setIsLoading(false); return; }
    fetchListing(id)
      .then(data => {
        const mapped = dbToForm(data);
        setForm(mapped);
        if (mapped.latitude && mapped.longitude)
          reverseGeocode(mapped.latitude, mapped.longitude);
      })
      .catch(err => setLoadError(err?.message || 'Failed to load listing.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step === 2 && !mapReady && !isLoading && form) initMap();
  }, [step, isLoading, form]);

  useEffect(() => {
    document.body.style.overflow = isMapExpanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMapExpanded]);

  // ── Map search ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapSearch.trim()) { setMapSearchResults([]); return; }
    if (skipNextSearch.current) { skipNextSearch.current = false; return; }
    clearTimeout(mapSearchTimer.current);
    mapSearchTimer.current = setTimeout(async () => {
      setMapSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mapSearch)}&format=json&limit=5&countrycodes=cm`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await r.json();
        setMapSearchResults(data.map(d => ({
          name: d.display_name.split(',').slice(0, 2).join(', '),
          full: d.display_name,
          lat:  parseFloat(d.lat),
          lng:  parseFloat(d.lon),
        })));
      } catch { setMapSearchResults([]); }
      setMapSearching(false);
    }, 380);
  }, [mapSearch]);

  const flyToSearchResult = (result) => {
    if (!mapInstanceRef.current) return;
    skipNextSearch.current = true;
    setMapSearch('');
    setMapSearchResults([]);
    placePin(result.lat, result.lng);
  };

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
    const L   = window.L;
    const lat = form?.latitude  ? parseFloat(form.latitude)  : 4.0511;
    const lng = form?.longitude ? parseFloat(form.longitude) : 9.7679;

    const map = L.map(mapRef.current, {
      zoomControl: false, scrollWheelZoom: true,
      doubleClickZoom: true, preferCanvas: true,
      zoomSnap: 0.5, wheelPxPerZoomLevel: 60,
    }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 20, crossOrigin: true,
    }).addTo(map);

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
    mapInstanceRef.current = map;
    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng));

    if (form?.latitude && form?.longitude)
      placePinSilent(parseFloat(form.latitude), parseFloat(form.longitude));

    setMapReady(true);
    setTimeout(() => map.invalidateSize(), 120);
  };

  // Place pin without updating form (used on init to show existing pin)
  const placePinSilent = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const L = window.L;
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
          border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.2);">
        </div>
      </div>`,
      className: '', iconSize: [110, 74], iconAnchor: [55, 74],
    });
    markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
  };

  const placePin = (lat, lng) => {
    placePinSilent(lat, lng);
    mapInstanceRef.current?.flyTo([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 15), { animate: true, duration: 0.6 });
    setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    markChanged('coordinates');
    setErrors(p => ({ ...p, coordinates: '' }));
    reverseGeocode(lat, lng, true);
  };

  const reverseGeocode = async (lat, lng, forceOverwrite = false) => {
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
        const locParts = [suburb||neighbourhood||quarter, city||town||village||municipality, state||region].filter(Boolean);
        setLocationName(locParts.join(', ') || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
        const streetName    = road || street || pedestrian || footway || suburb || neighbourhood || quarter || '';
        const streetAddress = [house_number, streetName].filter(Boolean).join(' ');
        const resolvedCity   = city || town || village || municipality || '';
        const resolvedRegion = state || region || '';
        if (forceOverwrite) {
          setForm(p => ({ ...p, address: streetAddress, city: resolvedCity, region: resolvedRegion }));
          markChanged('address'); markChanged('city'); markChanged('region');
        }
      } else {
        setLocationName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
      }
    } catch {
      setLocationName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
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
      () => alert('Unable to get location.')
    );
  };

  const toggleMap = () => {
    setIsMapExpanded(p => !p);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const markChanged = (field) => setChangedFields(prev => new Set([...prev, field]));

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    markChanged(field);
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const setNumeric = (field) => (e) => {
    const raw = unformat(e.target.value);
    set(field, raw);
  };

  const toggleAmenity = (id) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(id)
        ? p.amenities.filter(a => a !== id)
        : [...p.amenities, id],
    }));
    markChanged('amenities');
  };

  const addPhotos = (e) => {
    const MAX_BYTES = 7 * 1024 * 1024;
    const valid = Array.from(e.target.files).filter(f => f.size <= MAX_BYTES);
    const newPhotos = valid.map(file => ({
      id: `new_${Date.now()}_${Math.random()}`,
      file, preview: URL.createObjectURL(file), isExisting: false,
    }));
    setForm(p => ({ ...p, photos: [...p.photos, ...newPhotos] }));
    markChanged('photos');
    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    setForm(p => ({ ...p, photos: p.photos.filter(ph => ph.id !== photoId) }));
    markChanged('photos');
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const noRooms = NO_ROOMS_TYPES.includes(form?.propertyType);

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title?.trim())       e.title        = 'Title is required';
      if (!form.description?.trim()) e.description  = 'Description is required';
      if (!form.propertyType)        e.propertyType = 'Property type is required';
      if (!form.listingType)         e.listingType  = 'Listing type is required';
      if (!form.price)               e.price        = 'Price is required';
    }
    if (s === 2) {
      if (!form.address?.trim())             e.address     = 'Address is required';
      if (!form.city?.trim())                e.city        = 'City is required';
      if (!form.region?.trim())              e.region      = 'Region is required';
      if (!form.latitude || !form.longitude) e.coordinates = 'Please pin the location on the map';
    }
    if (s === 4 && !form.photos.length) e.photos = 'At least one photo is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const persistUpdate = async () => {
    setApiError('');
    setIsSaving(true);
    try {
      const payload = buildPayload(form);
      await updateListing(id, payload);
      setChangedFields(new Set());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setApiError(err?.message || 'Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (validate(step)) await persistUpdate();
  };

  const nextStep = () => { if (validate(step)) { setStep(p => Math.min(p+1,5)); window.scrollTo(0,0); } };
  const prevStep = () => { setStep(p => Math.max(p-1,1)); window.scrollTo(0,0); };

  const handleSubmitUpdate = async () => {
    if (!validate(step)) return;
    await persistUpdate();
    if (!apiError) navigate('/user/listings');
  };

  // ── Preview shape ──────────────────────────────────────────────────────────
  const previewListing = form ? {
    id:               id,
    title:            form.title || 'Property Title',
    price:            parseInt(form.price) || 0,
    location:         [form.address, form.city, form.region].filter(Boolean).join(', '),
    address:          form.address,
    city:             form.city,
    region:           form.region,
    bedrooms:         !noRooms ? (parseInt(form.bedrooms)  || null) : null,
    bathrooms:        !noRooms ? (parseInt(form.bathrooms) || null) : null,
    area:             parseInt(form.area) || 0,
    type:             form.listingType,
    listingType:      form.listingType === 'sale' ? 'For Sale' : 'For Rent',
    transaction_type: form.listingType,
    property_type:    form.propertyType,
    image:            form.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    images:           form.photos.map(p => p.preview),
    lat:              parseFloat(form.latitude)  || 4.0511,
    lng:              parseFloat(form.longitude) || 9.7679,
    description:      form.description,
    yearBuilt:        !noRooms ? (form.yearBuilt || null) : null,
    parking:          form.amenities.includes('parking')   ? 1 : 0,
    generator:        form.amenities.includes('generator') ? 1 : 0,
  } : null;

  // ── Field class ────────────────────────────────────────────────────────────
  const fc = (field, extra = '') =>
    [extra,
      'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm',
      errors[field]            ? 'border-red-400 bg-red-50'        :
      changedFields.has(field) ? 'border-amber-400 bg-amber-50/40' :
                                 'border-gray-200',
    ].filter(Boolean).join(' ');

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen" style={{ background: '#fdfaf7' }}>
      <UserNav />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 rounded-xl w-1/3" style={{ background: '#f0ebe3' }} />
        <div className="h-4 rounded-xl w-1/2" style={{ background: '#f0ebe3' }} />
        <div className="rounded-2xl p-8 space-y-4" style={{ background: '#ffffff', border: '1px solid #f0ebe3' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl" style={{ background: '#f5f0ea' }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen" style={{ background: '#fdfaf7' }}>
      <UserNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-8 text-center" style={{ background: '#fff5f5', border: '1px solid #fca5a5' }}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#dc2626' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1208' }}>Could not load listing</h2>
          <p className="text-sm mb-6" style={{ color: '#a09080' }}>{loadError}</p>
          <button onClick={() => navigate('/user/listings')}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: '#3d2b14', color: '#fdf8f2' }}>
            Back to Listings
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step renderer ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // STEP 1 ────────────────────────────────────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1a1208' }}>Basic Information</h2>
              <p className="text-sm mt-1" style={{ color: '#a09080' }}>Update your property details</p>
            </div>
            {changedFields.size > 0 && (
              <span className="text-xs px-3 py-1 rounded-full font-medium flex-shrink-0"
                style={{ background: '#fef3c7', color: '#d97706' }}>
                {changedFields.size} modified
              </span>
            )}
          </div>

          {/* Pending notice */}
          <div className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
            <p className="text-sm" style={{ color: '#92400e' }}>
              Editing a live or pending listing will re-submit it for review before changes go public.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Property Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., Modern 3BR Apartment in Bonamoussadi" className={fc('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your property…" rows={5} className={fc('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Property Type *</label>
              <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className={fc('propertyType')}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Listing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: 'sale', l: 'For Sale' }, { v: 'rent', l: 'For Rent' }].map(t => (
                  <button key={t.v} type="button" onClick={() => set('listingType', t.v)}
                    className={`px-4 py-3 border-2 rounded-xl font-medium transition-colors text-sm ${
                      form.listingType === t.v
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>{t.l}</button>
                ))}
              </div>
              {errors.listingType && <p className="text-red-500 text-xs mt-1">{errors.listingType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>
              Price (FCFA){form.listingType === 'rent' ? ' / month' : ''} *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" inputMode="numeric"
                value={form.price ? formatNum(form.price) : ''}
                onChange={setNumeric('price')}
                placeholder="e.g. 45 000 000"
                className={fc('price', 'pl-10 pr-14')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">FCFA</span>
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {!noRooms && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Bedrooms</label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" min="0" max="20" value={form.bedrooms}
                      onChange={e => set('bedrooms', e.target.value)}
                      placeholder="0" className={fc('bedrooms', 'pl-10')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Bathrooms</label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="number" min="0" max="20" value={form.bathrooms}
                      onChange={e => set('bathrooms', e.target.value)}
                      placeholder="0" className={fc('bathrooms', 'pl-10')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Area (m²)</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Year Built</label>
                  <input type="number" min="1900" max={new Date().getFullYear()}
                    value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)}
                    placeholder="e.g. 2018" className={fc('yearBuilt')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Furnished</label>
                  <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={fc('furnished')}>
                    <option value="">Select option</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {noRooms && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>
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
            </div>
          )}
        </div>
      );

      // STEP 2 ────────────────────────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1208' }}>Property Location</h2>
            <p className="text-sm mt-1" style={{ color: '#a09080' }}>Search or click the map to update the pin</p>
          </div>

          <div className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
            errors.coordinates ? 'border-red-300' : form.latitude ? 'border-amber-300' : 'border-gray-200'
          }`} style={{ height: isMapExpanded ? '70vh' : '380px' }}>

            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {!mapReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-[2000]"
                style={{ background: '#f5f0ea' }}>
                <MapPin className="w-12 h-12 animate-bounce" style={{ color: '#c4b49a' }} />
                <p className="text-sm mt-2 font-medium" style={{ color: '#8B6340' }}>Loading map…</p>
              </div>
            )}

            {mapReady && (<>
              {/* Search bar */}
              <div className="absolute top-3 left-3 z-[1000]" style={{ maxWidth: 290, width: 'calc(100% - 64px)' }}>
                <div className="relative">
                  <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                    <input
                      type="text" value={mapSearch}
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
                  {mapSearchResults.length > 0 && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
                      {mapSearchResults.map((r, i) => (
                        <button key={i} onClick={() => flyToSearchResult(r)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">{r.name}</div>
                            {r.full !== r.name && <div className="text-xs text-gray-400 truncate">{r.full}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
                <button onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center border border-gray-200">
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <button onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center border border-gray-200">
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <button onClick={useMyLocation}
                  className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center"
                  style={{ background: '#8B6340' }}>
                  <Navigation className="w-4 h-4 text-white" />
                </button>
                <button onClick={toggleMap}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center border border-gray-200">
                  {isMapExpanded ? <Minimize2 className="w-4 h-4 text-gray-700" /> : <Maximize2 className="w-4 h-4 text-gray-700" />}
                </button>
              </div>

              {/* Pin badge */}
              {form.latitude && form.longitude && (
                <div className="absolute bottom-8 left-3 z-[1000]">
                  <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg px-3 py-2" style={{ border: '1px solid #bbf7d0' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                    <span className="text-xs font-semibold max-w-[200px] truncate" style={{ color: '#166534' }}>
                      {isLoadingLoc ? 'Updating address…' : locationName}
                    </span>
                  </div>
                </div>
              )}
            </>)}

            <style>{`
              .leaflet-control-attribution { opacity: 0.5 !important; font-size: 8px !important; }
              .leaflet-control-attribution:hover { opacity: 1 !important; }
            `}</style>
          </div>

          {errors.coordinates && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.coordinates}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Street Address *</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Auto-filled from pin — or type manually" className={fc('address')} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>City *</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="e.g., Douala" className={fc('city')} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3d2b14' }}>Region *</label>
                <input type="text" value={form.region} onChange={e => set('region', e.target.value)}
                  placeholder="e.g., Littoral" className={fc('region')} />
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
              </div>
            </div>
          </div>
        </div>
      );

      // STEP 3 ────────────────────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1208' }}>Amenities & Features</h2>
            <p className="text-sm mt-1" style={{ color: '#a09080' }}>Select all that apply</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map(({ id, label, icon: Icon }) => {
              const active = form.amenities.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleAmenity(id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-200 text-gray-500'
                  }`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                  {active && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>
      );

      // STEP 4 ────────────────────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1208' }}>Property Photos</h2>
            <p className="text-sm mt-1" style={{ color: '#a09080' }}>First photo is the cover · max 7 MB each</p>
          </div>

          {errors.photos && (
            <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {errors.photos}
            </div>
          )}

          <label className="relative block">
            <input type="file" multiple accept="image/*" onChange={addPhotos} className="sr-only" />
            <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors group"
              style={{ borderColor: '#e8dfd0' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#d97706'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8dfd0'}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: '#fef3c7' }}>
                <Upload className="w-7 h-7" style={{ color: '#d97706' }} />
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: '#3d2b14' }}>Click to add photos</p>
              <p className="text-xs" style={{ color: '#c4b49a' }}>JPEG, PNG, WEBP</p>
            </div>
          </label>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.photos.map((photo, idx) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden"
                  style={{ border: '1px solid #e8dfd0' }}>
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
                      style={{ background: '#3d2b14' }}>Cover</span>
                  )}
                  <div className={`absolute bottom-2 left-2 text-white text-[10px] px-2 py-0.5 rounded-full ${
                    photo.isExisting ? 'bg-black/50' : 'bg-amber-600'
                  }`}>
                    {photo.isExisting ? 'Saved' : 'New'}
                  </div>
                  <button onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      // STEP 5 ────────────────────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1a1208' }}>Review & Save</h2>
            <p className="text-sm mt-1" style={{ color: '#a09080' }}>Preview your changes before saving</p>
          </div>

          {changedFields.size > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p className="text-sm font-semibold" style={{ color: '#d97706' }}>
                ✏️ {changedFields.size} field{changedFields.size > 1 ? 's' : ''} modified — not yet saved
              </p>
            </div>
          )}

          <button onClick={() => setShowPreview(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
            style={{ border: '2px solid #e8dfd0', color: '#8B6340' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fef3c7'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8dfd0'; e.currentTarget.style.background = 'transparent'; }}>
            <Eye className="w-5 h-5" /> Preview Listing
          </button>

          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #f0ebe3' }}>
            <h3 className="text-base font-bold mb-4" style={{ color: '#1a1208' }}>Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Title',       value: form.title || '—',                                              field: 'title'       },
                { label: 'Price',       value: form.price ? `${formatNum(form.price)} FCFA` : '—',            field: 'price'       },
                { label: 'Location',    value: [form.city, form.region].filter(Boolean).join(', ') || '—',    field: 'city'        },
                { label: 'Type',        value: `${form.propertyType} · ${form.listingType === 'sale' ? 'For Sale' : 'For Rent'}`, field: 'propertyType' },
                ...(!noRooms ? [{ label: 'Beds / Baths', value: `${form.bedrooms||'—'} BD · ${form.bathrooms||'—'} BA`, field: 'bedrooms' }] : []),
                { label: 'Area',        value: form.area ? `${formatNum(form.area)} m²` : '—',                field: 'area'        },
                { label: 'Photos',      value: `${form.photos.length} (${form.photos.filter(p=>!p.isExisting).length} new)`, field: 'photos' },
                { label: 'Amenities',   value: form.amenities.length ? form.amenities.join(', ') : 'None',   field: 'amenities'   },
                { label: 'Coordinates', value: form.latitude ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` : '—', field: 'coordinates' },
              ].map(({ label, value, field }) => (
                <div key={field} className="p-3 rounded-lg"
                  style={{
                    background: changedFields.has(field) ? '#fffbeb' : '#f5f0ea',
                    border: `1px solid ${changedFields.has(field) ? '#fde68a' : '#ede5d8'}`,
                  }}>
                  <p className="text-xs mb-0.5" style={{ color: '#b09878' }}>{label}</p>
                  <p className="font-medium text-sm capitalize truncate" style={{ color: '#1a1208' }}>{value}</p>
                  {changedFields.has(field) && (
                    <span className="text-[10px] font-semibold" style={{ color: '#d97706' }}>• Modified</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#fdfaf7' }}>
      <UserNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/user/listings')}
            className="flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: '#a09080' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3d2b14'}
            onMouseLeave={e => e.currentTarget.style.color = '#a09080'}>
            <ArrowLeft className="w-4 h-4" /> Back to My Listings
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1a1208' }}>Edit Listing</h1>
              <p className="text-sm mt-0.5 truncate max-w-xs" style={{ color: '#a09080' }}>
                #{id} · {form?.title}
              </p>
            </div>

            {/* Quick save */}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || changedFields.size === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0"
              style={{
                background: saveSuccess ? '#059669' : changedFields.size === 0 ? '#f5f0ea' : '#3d2b14',
                color:      saveSuccess ? '#ffffff' : changedFields.size === 0 ? '#c4b49a'  : '#fdf8f2',
                cursor:     changedFields.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving    ? <Loader2      className="w-4 h-4 animate-spin" /> :
               saveSuccess ? <CheckCircle2 className="w-4 h-4" /> :
                             <Save         className="w-4 h-4" />}
              {isSaving ? 'Saving…' : saveSuccess ? 'Saved!' : `Save${changedFields.size > 0 ? ` (${changedFields.size})` : ''}`}
            </button>
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626' }} />
            <p className="text-sm font-medium flex-1" style={{ color: '#dc2626' }}>{apiError}</p>
            <button onClick={() => setApiError('')}>
              <X className="w-4 h-4" style={{ color: '#dc2626' }} />
            </button>
          </div>
        )}

        {/* Success toast */}
        {saveSuccess && (
          <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#059669' }} />
            <p className="text-sm font-medium" style={{ color: '#065f46' }}>Changes saved successfully!</p>
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
                    <button onClick={() => setStep(s.number)}
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105"
                      style={{
                        background: completed ? '#059669' : active ? '#3d2b14' : '#ffffff',
                        borderColor: completed ? '#059669' : active ? '#3d2b14' : '#e8dfd0',
                      }}>
                      {completed
                        ? <Check className="w-5 h-5 text-white" />
                        : <Icon className="w-5 h-5" style={{ color: active ? '#fdf8f2' : '#c4b49a' }} />}
                    </button>
                    <span className="text-xs mt-2 font-medium whitespace-nowrap"
                      style={{ color: active ? '#3d2b14' : '#c4b49a' }}>
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2"
                      style={{ background: completed ? '#059669' : '#e8dfd0' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-5 md:p-8 mb-6"
          style={{ background: '#ffffff', border: '1px solid #f0ebe3' }}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{
              background: step === 1 ? '#f5f0ea' : '#ffffff',
              color:      step === 1 ? '#c4b49a' : '#3d2b14',
              border:     `1px solid ${step === 1 ? '#f0ebe3' : '#e8dfd0'}`,
              cursor:     step === 1 ? 'not-allowed' : 'pointer',
            }}>
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {step < 5 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ background: '#3d2b14', color: '#fdf8f2' }}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmitUpdate} disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#059669', color: '#ffffff' }}>
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Check className="w-4 h-4" /> Save Changes</>}
            </button>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && previewListing && (
        <PropertyDetails
          listing={previewListing}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Fullscreen map */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="flex items-center justify-between p-4"
            style={{ background: '#ffffff', borderBottom: '1px solid #f0ebe3' }}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: '#8B6340' }} />
              <div>
                <h3 className="font-bold" style={{ color: '#1a1208' }}>Update Property Location</h3>
                <p className="text-xs" style={{ color: '#a09080' }}>Click to move the pin</p>
              </div>
            </div>
            <button onClick={toggleMap}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ background: '#3d2b14', color: '#fdf8f2' }}>
              <Minimize2 className="w-4 h-4" /> Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            {form.latitude && form.longitude && (
              <div className="absolute bottom-6 right-6 w-72 rounded-xl p-4 shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e8dfd0' }}>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1a1208' }}>Pinned Location</p>
                    {isLoadingLoc
                      ? <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#a09080' }}>
                          <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          Fetching address…
                        </div>
                      : <p className="text-xs mt-0.5" style={{ color: '#8B6340' }}>{locationName}</p>
                    }
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#c4b49a' }}>
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