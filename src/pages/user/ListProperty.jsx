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
  Upload, X, AlertCircle, Maximize2, Minimize2,
  Loader2, AlertTriangle, Info, Search, ZoomIn, ZoomOut,
  Layers, Crosshair, Mountain, Satellite,
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

// ── Tile layers ───────────────────────────────────────────────────────────────
const TILE_LAYERS = {
  clean: {
    label: 'Street',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20, subdomains: 'abcd',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO',
    maxZoom: 19,
  },
  hybrid: {
    label: 'Hybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap | OpenTopoMap',
    maxZoom: 17, subdomains: 'abc',
  },
};

const RAPID_API_KEY = 'c8db4aa8e6msh3e685f8677a38bfp15484djsn1631b7892dec';

const EMPTY_FORM = {
  title: '', description: '', propertyType: '', listingType: '',
  price: '', bedrooms: '', bathrooms: '', area: '', yearBuilt: '',
  address: '', city: '', region: '', neighbourhood: '',
  latitude: '', longitude: '',
  furnished: '', amenities: [], photos: [],
};

// ─── Geocoding ────────────────────────────────────────────────────────────────
const googlePlaceSearch = async (query) => {
  const res = await fetch(
    `https://google-maps-api-free.p.rapidapi.com/google-find-place-search?place=${encodeURIComponent(query)}`,
    { headers: { 'x-rapidapi-host': 'google-maps-api-free.p.rapidapi.com', 'x-rapidapi-key': RAPID_API_KEY } }
  );
  if (!res.ok) throw new Error(`RapidAPI ${res.status}`);
  const data = await res.json();
  return (data?.candidates || data?.results || [])
    .filter(c => c.geometry?.location?.lat != null)
    .map(c => ({
      name:              c.name              || c.formatted_address || query,
      formatted_address: c.formatted_address || c.name             || '',
      lat: c.geometry.location.lat,
      lng: c.geometry.location.lng,
    }));
};

const nominatimSearch = async (q) => {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Cameroon')}&format=json&limit=6&addressdetails=1`,
    { headers: { 'Accept-Language': 'fr' } }
  );
  return (await r.json()).map(d => ({
    name:              d.display_name.split(',').slice(0, 3).join(', '),
    formatted_address: d.display_name,
    lat:  parseFloat(d.lat),
    lng:  parseFloat(d.lon),
  }));
};

const geocode = async (q) => {
  try {
    const r = await googlePlaceSearch(q);
    if (r.length > 0) return r;
    return await nominatimSearch(q);
  } catch {
    try { return await nominatimSearch(q); } catch { return []; }
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatNum = (val) => {
  const raw = String(val).replace(/[\s,]/g, '');
  if (!raw || isNaN(raw)) return '';
  return parseInt(raw, 10).toLocaleString('fr-FR');
};
const unformat = (val) => String(val).replace(/[^0-9]/g, '');

const injectCSS = (href, id) => {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
};

const loadScript = (src, id, globalCheck) => new Promise((resolve, reject) => {
  if (window[globalCheck]) { resolve(); return; }
  const existing = document.getElementById(id);
  if (existing) { existing.addEventListener('load', resolve); existing.addEventListener('error', reject); return; }
  const s = document.createElement('script');
  s.id = id; s.src = src; s.async = true;
  s.onload = resolve; s.onerror = reject;
  document.body.appendChild(s);
});

// ─────────────────────────────────────────────────────────────────────────────

export default function ListProperty() {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError]       = useState('');
  const [submitted, setSubmitted]     = useState(false);

  // ── Map state ─────────────────────────────────────────────────────────────
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);
  const tileLayerRef   = useRef(null);
  const labelLayerRef  = useRef(null);
  const initCalledRef  = useRef(false);

  const [mapReady,      setMapReady]      = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeLayer,   setActiveLayer]   = useState('clean');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isLoadingLoc,  setIsLoadingLoc]  = useState(false);
  const [locationName,  setLocationName]  = useState('');

  const [mapSearch,        setMapSearch]        = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [mapSearching,     setMapSearching]     = useState(false);
  const mapSearchTimer = useRef(null);
  const skipNextSearch = useRef(false);

  const noRooms = NO_ROOMS_TYPES.includes(form.propertyType);

  useEffect(() => {
    if (noRooms) setForm(p => ({ ...p, bedrooms: '', bathrooms: '', yearBuilt: '', furnished: '' }));
  }, [form.propertyType]);

  useEffect(() => {
    if (step === 2 && !initCalledRef.current) initMap();
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = isMapExpanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMapExpanded]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapSearch.trim()) { setMapSearchResults([]); return; }
    if (skipNextSearch.current) { skipNextSearch.current = false; return; }
    clearTimeout(mapSearchTimer.current);
    mapSearchTimer.current = setTimeout(async () => {
      setMapSearching(true);
      try {
        const results = await geocode(mapSearch);
        setMapSearchResults(results.slice(0, 6));
      } catch { setMapSearchResults([]); }
      setMapSearching(false);
    }, 350);
  }, [mapSearch]);

  // ── Map init ──────────────────────────────────────────────────────────────
  const initMap = () => {
    injectCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'leaflet-css');
    const ready = window.L ? Promise.resolve()
      : loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'leaflet-js', 'L');
    ready.then(() => buildMap()).catch(console.error);
  };

  const buildMap = () => {
    if (!mapRef.current || mapInstanceRef.current || initCalledRef.current) return;
    initCalledRef.current = true;
    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl:         false,
      scrollWheelZoom:     true,
      doubleClickZoom:     true,
      preferCanvas:        true,
      zoomSnap:            0.5,
      wheelPxPerZoomLevel: 60,
      tap:                 true,
      tapTolerance:        15,
    }).setView([4.0511, 9.7679], 13);

    const def = TILE_LAYERS.clean;
    tileLayerRef.current = L.tileLayer(def.url, {
      attribution: def.attribution,
      subdomains:  def.subdomains || 'abcd',
      maxZoom:     def.maxZoom,
      crossOrigin: true,
    }).addTo(map);

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng));
    map.on('click', () => setShowLayerMenu(false));

    mapInstanceRef.current = map;
    setMapReady(true);
    setTimeout(() => map.invalidateSize(), 120);
  };

  // ── Switch tile layer ─────────────────────────────────────────────────────
  const switchLayer = (key) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L, map = mapInstanceRef.current;
    const def = TILE_LAYERS[key];
    if (tileLayerRef.current)  map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) { map.removeLayer(labelLayerRef.current); labelLayerRef.current = null; }
    tileLayerRef.current = L.tileLayer(def.url, {
      attribution: def.attribution,
      subdomains:  def.subdomains || '',
      maxZoom:     def.maxZoom,
      crossOrigin: true,
    }).addTo(map);
    if (def.labelUrl) {
      labelLayerRef.current = L.tileLayer(def.labelUrl, {
        maxZoom:    def.maxZoom,
        subdomains: def.labelSubdomains || 'abcd',
        opacity:    1,
      }).addTo(map);
    }
    setActiveLayer(key);
    setShowLayerMenu(false);
  };

  // ── Place pin ─────────────────────────────────────────────────────────────
  const placePin = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    const L = window.L;
    if (markerRef.current) markerRef.current.remove();

    const icon = L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 4px 14px rgba(217,119,6,0.5))">
        <div style="background:linear-gradient(135deg,#D97706,#B45309);color:white;
          padding:7px 13px;border-radius:9px;font-weight:700;font-size:11px;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          box-shadow:0 3px 10px rgba(217,119,6,0.4);border:2px solid white;white-space:nowrap;position:relative;">
          📍 Your Property
          <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid white;"></div>
          <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid #D97706;"></div>
        </div>
        <div style="margin-top:2px;width:28px;height:28px;background:linear-gradient(135deg,#D97706,#B45309);
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;
          box-shadow:0 3px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg)">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>`,
      className: '', iconSize: [105, 65], iconAnchor: [52, 65],
    });

    markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.flyTo([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 17), {
      animate: true, duration: 0.8,
    });
    setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setErrors(p => ({ ...p, coordinates: '' }));
    reverseGeocode(lat, lng);
  };

  const flyToSearchResult = (result) => {
    if (!mapInstanceRef.current) return;
    skipNextSearch.current = true;
    setMapSearch('');
    setMapSearchResults([]);
    placePin(result.lat, result.lng);
  };

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingLoc(true);
    setLocationName('Detecting address…');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const d = await r.json();
      if (d?.address) {
        const a = d.address;
        const streetName    = a.road || a.street || a.pedestrian || a.footway || '';
        const streetAddress = [a.house_number, streetName].filter(Boolean).join(' ').trim();
        const hood          = a.suburb || a.neighbourhood || a.quarter || a.residential || '';
        const resolvedCity  = a.city || a.town || a.village || a.municipality || '';
        const resolvedRegion = a.state || a.region || a.county || '';
        const locParts      = [hood, resolvedCity, resolvedRegion].filter(Boolean);
        setLocationName(locParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setForm(p => ({
          ...p,
          address:       streetAddress || hood || p.address,
          neighbourhood: hood          || p.neighbourhood,
          city:          resolvedCity  || p.city,
          region:        resolvedRegion|| p.region,
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
        mapInstanceRef.current?.setView([lat, lng], 17);
        placePin(lat, lng);
      },
      () => alert('Unable to get location. Please pin manually.')
    );
  };

  const toggleMap = () => {
    setIsMapExpanded(p => !p);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const set = (field, value) => { setForm(p => ({ ...p, [field]: value })); setErrors(p => ({ ...p, [field]: '' })); };
  const setNumeric = (field) => (e) => {
    const raw = unformat(e.target.value);
    setForm(p => ({ ...p, [field]: raw })); setErrors(p => ({ ...p, [field]: '' }));
  };
  const toggleAmenity = (id) =>
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(id) ? p.amenities.filter(a => a !== id) : [...p.amenities, id],
    }));

  const addPhotos = (e) => {
    const MAX_BYTES = 7 * 1024 * 1024;
    const all = Array.from(e.target.files);
    const oversized = all.filter(f => f.size > MAX_BYTES);
    const valid     = all.filter(f => f.size <= MAX_BYTES);
    if (oversized.length > 0) setErrors(p => ({ ...p, photos: `${oversized.length} file(s) skipped — max 7 MB each.` }));
    else setErrors(p => ({ ...p, photos: '' }));
    const newFiles = valid.map(file => ({ id: `new_${Date.now()}_${Math.random()}`, file, preview: URL.createObjectURL(file) }));
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

  const nextStep = () => { if (validate(step)) { setStep(p => Math.min(p + 1, 5)); window.scrollTo(0, 0); } };
  const prevStep = () => { setStep(p => Math.max(p - 1, 1)); window.scrollTo(0, 0); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate(step)) return;
    setIsSubmitting(true); setApiError('');
    try {
      const payload = {
        title: form.title, description: form.description,
        propertyType: form.propertyType, listingType: form.listingType,
        price: Math.min(Number(form.price) || 0, 2147483647),
        bedrooms:  !noRooms && form.bedrooms  !== '' ? Number(form.bedrooms)  : null,
        bathrooms: !noRooms && form.bathrooms !== '' ? Number(form.bathrooms) : null,
        landSize:  form.area !== '' ? Math.min(Number(form.area) || 0, 999999) : null,
        yearBuilt: !noRooms && form.yearBuilt !== '' ? Number(form.yearBuilt) : null,
        address: form.address, city: form.city, region: form.region,
        coordinates: form.latitude && form.longitude ? `${form.latitude},${form.longitude}` : null,
        furnished:     !noRooms ? (form.furnished || null) : null,
        parkingSpaces: form.amenities.includes('parking')   ? 1 : 0,
        generator:     form.amenities.includes('generator') ? 1 : 0,
      };
      const res = await createListing(payload);
      const listingId = res?.id;

      if (form.photos.length > 0 && listingId) {
        const BATCH_LIMIT = 6 * 1024 * 1024;
        let batch = new FormData(), batchSize = 0;
        const flush = async (b) => { if ([...b.entries()].length > 0) await uploadListingPhotos(listingId, b); };
        for (const photo of form.photos) {
          if (photo.file.size > 7 * 1024 * 1024) continue;
          if (batchSize + photo.file.size > BATCH_LIMIT) { await flush(batch); batch = new FormData(); batchSize = 0; }
          batch.append('photos', photo.file, photo.file.name);
          batchSize += photo.file.size;
        }
        await flush(batch);
      }
      setSubmitted(true); window.scrollTo(0, 0);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('JSON') || msg.includes('token')) {
        setApiError('Listing saved! However, some photos could not be uploaded. It will still be reviewed.');
      } else {
        setApiError(msg || 'Submission failed. Please try again.');
      }
    } finally { setIsSubmitting(false); }
  };

  const previewListing = {
    id: 'preview', title: form.title || 'Property Title',
    price: parseInt(form.price) || 0,
    location: [form.address, form.city, form.region].filter(Boolean).join(', ') || 'Location',
    address: form.address, city: form.city, region: form.region,
    bedrooms:  !noRooms ? (parseInt(form.bedrooms)  || null) : null,
    bathrooms: !noRooms ? (parseInt(form.bathrooms) || null) : null,
    area: parseInt(form.area) || 0,
    type: form.listingType,
    listingType:      form.listingType === 'sale' ? 'For Sale' : 'For Rent',
    transaction_type: form.listingType,
    property_type:    form.propertyType,
    image:  form.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    images: form.photos.map(p => p.preview),
    lat: parseFloat(form.latitude)  || 4.0511,
    lng: parseFloat(form.longitude) || 9.7679,
    description: form.description,
    parking:   form.amenities.includes('parking')   ? 1 : 0,
    generator: form.amenities.includes('generator') ? 1 : 0,
  };

  const fc = (field, extra = '') =>
    [extra,
      'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm',
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200',
    ].filter(Boolean).join(' ');

  // ── Shared map panel ──────────────────────────────────────────────────────
  const MapPanel = ({ height = '420px', showAddressPanel = false }) => (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {!mapReady && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-[2000]">
          <MapPin className="w-12 h-12 text-amber-500 animate-bounce mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading map…</p>
        </div>
      )}

      {mapReady && (<>
        {/* Search bar */}
        <div className="absolute top-3 left-3 z-[1000]" style={{ maxWidth: 305, width: 'calc(100% - 60px)' }}>
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text" value={mapSearch} onChange={e => setMapSearch(e.target.value)}
                placeholder="Search street, neighbourhood, city…"
                className="flex-1 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              {mapSearching
                ? <Loader2 className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0 animate-spin" />
                : mapSearch && (
                  <button className="mr-3 flex-shrink-0" onClick={() => { setMapSearch(''); setMapSearchResults([]); }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                  </button>
                )
              }
            </div>

            {mapSearchResults.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Results</span>
                  <span className="text-[10px] text-gray-400">{mapSearchResults.length} found</span>
                </div>
                {mapSearchResults.map((r, i) => (
                  <button key={i} onClick={() => flyToSearchResult(r)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 leading-tight truncate">{r.name}</div>
                      {r.formatted_address && r.formatted_address !== r.name && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{r.formatted_address}</div>
                      )}
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
            className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            <ZoomOut className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={useMyLocation}
            className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg flex items-center justify-center transition-all">
            <Crosshair className="w-4 h-4 text-white" />
          </button>
          {/* Layer switcher */}
          <div className="relative">
            <button onClick={() => setShowLayerMenu(p => !p)}
              className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all border ${
                showLayerMenu ? 'bg-amber-600 border-amber-600' : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}>
              <Layers className={`w-4 h-4 ${showLayerMenu ? 'text-white' : 'text-gray-700'}`} />
            </button>
            {showLayerMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1002] min-w-[120px]">
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Map Style</span>
                </div>
                {Object.entries(TILE_LAYERS).map(([key, tile]) => (
                  <button key={key} onClick={() => switchLayer(key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      activeLayer === key ? 'bg-amber-50 text-amber-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    }`}>
                    {tile.label}
                    {activeLayer === key && <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleMap}
            className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            {isMapExpanded ? <Minimize2 className="w-4 h-4 text-gray-700" /> : <Maximize2 className="w-4 h-4 text-gray-700" />}
          </button>
        </div>

        {/* Pinned badge */}
        {form.latitude && form.longitude && (
          <div className="absolute bottom-8 left-3 z-[1000]">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-green-200 px-3 py-2 max-w-[280px]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-green-700 truncate">
                {isLoadingLoc ? 'Detecting address…' : locationName || `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`}
              </span>
            </div>
          </div>
        )}

        {/* Tap hint */}
        {!form.latitude && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5">
              <p className="text-xs font-semibold text-gray-600 whitespace-nowrap">👆 Click the map to drop your pin</p>
            </div>
          </div>
        )}

        {/* Fullscreen address panel */}
        {showAddressPanel && form.latitude && form.longitude && (
          <div className="absolute bottom-6 right-4 w-72 bg-white/96 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-gray-200 z-[1000]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm mb-1">Pinned Location</p>
                {isLoadingLoc
                  ? <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Fetching…
                    </div>
                  : <p className="text-xs text-gray-600 leading-relaxed break-words">{locationName}</p>
                }
                <p className="text-[11px] text-gray-400 font-mono mt-1">
                  {parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Address',  value: form.address       },
                    { label: 'District', value: form.neighbourhood  },
                    { label: 'City',     value: form.city           },
                    { label: 'Region',   value: form.region         },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{f.label}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>)}

      <style>{`
        .leaflet-control-scale-line {
          border:2px solid #374151 !important; border-top:none !important;
          background:rgba(255,255,255,0.88) !important; font-size:11px !important;
          font-weight:600 !important; color:#374151 !important;
          border-radius:0 0 5px 5px !important; padding:1px 6px !important;
        }
        .leaflet-control-attribution {
          background:rgba(255,255,255,0.45) !important; border-radius:6px 0 0 0 !important;
          font-size:8px !important; padding:1px 5px !important;
          color:#aaa !important; opacity:0.55 !important; transition:opacity 0.2s;
        }
        .leaflet-control-attribution:hover { opacity:1 !important; background:rgba(255,255,255,0.95) !important; }
      `}</style>
    </div>
  );

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
            Your property has been submitted for review. Our team will check the details and get back to you within 1–2 business days.
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

      case 1: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            <p className="text-gray-500 mt-1 text-sm">Tell us about your property</p>
          </div>
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Your listing will be reviewed by our team before going live. Make sure all details are accurate.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., Modern 3BR Apartment in Bonamoussadi" className={fc('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your property in detail…" rows={5} className={fc('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className={fc('propertyType')}>
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
                      form.listingType === t.v ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                    {t.l}
                  </button>
                ))}
              </div>
              {errors.listingType && <p className="text-red-500 text-xs mt-1">{errors.listingType}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (FCFA){form.listingType === 'rent' ? ' / month' : ''} *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" inputMode="numeric" value={form.price ? formatNum(form.price) : ''}
                onChange={setNumeric('price')} placeholder={form.listingType === 'rent' ? '150 000' : '45 000 000'}
                className={fc('price', 'pl-10 pr-14')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">FCFA</span>
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          {!noRooms && (<>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="number" min="0" max="20" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                    placeholder="0" className={fc('bedrooms', 'pl-10')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="number" min="0" max="20" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                    placeholder="0" className={fc('bathrooms', 'pl-10')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" inputMode="numeric" value={form.area ? formatNum(form.area) : ''}
                    onChange={setNumeric('area')} placeholder="120" className={fc('area', 'pl-10 pr-9')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                <input type="number" min="1900" max={new Date().getFullYear()} value={form.yearBuilt}
                  onChange={e => set('yearBuilt', e.target.value)} placeholder="e.g. 2018" className={fc('yearBuilt')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
                <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={fc('furnished')}>
                  <option value="">Select option</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          </>)}
          {noRooms && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {form.propertyType === 'land' ? 'Plot Size (m²)' : 'Floor Area (m²)'}
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" inputMode="numeric" value={form.area ? formatNum(form.area) : ''}
                  onChange={setNumeric('area')} placeholder="500" className={fc('area', 'pl-10 pr-9')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
            </div>
          )}
        </div>
      );

      case 2: return (
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Location</h2>
            <p className="text-gray-500 mt-1 text-sm">Search for your street or neighbourhood, then click the map to drop a pin. Address fills automatically.</p>
          </div>

          <div className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
            errors.coordinates ? 'border-red-300' : form.latitude ? 'border-green-300' : 'border-gray-200'
          }`}>
            <MapPanel height="440px" showAddressPanel={false} />
          </div>

          {errors.coordinates && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.coordinates}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Street Address *
                  {isLoadingLoc && <span className="text-xs text-amber-600 font-normal animate-pulse">Auto-filling…</span>}
                </label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Auto-filled when you pin" className={fc('address')} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neighbourhood / District</label>
                <input type="text" value={form.neighbourhood} onChange={e => set('neighbourhood', e.target.value)}
                  placeholder="e.g., Bonamoussadi" className={fc('neighbourhood')} />
              </div>
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

          {form.latitude && form.longitude && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-700">Location pinned ✓</p>
                <p className="text-xs text-green-600 font-mono">{parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}</p>
              </div>
              <button type="button" onClick={() => {
                setForm(p => ({ ...p, latitude: '', longitude: '' }));
                if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
                setLocationName('');
              }} className="text-green-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Tip: Switch to <strong>Satellite</strong> or <strong>Hybrid</strong> for better accuracy when pinning the exact building.</span>
          </div>
        </div>
      );

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
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative ${
                    active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-200 text-gray-500'
                  }`}>
                  {active && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
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
                    <button onClick={() => toggleAmenity(id)}><X className="w-3 h-3" /></button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      );

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
          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.photos.map((photo, idx) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Cover</span>}
                  <button onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                    <X className="w-3.5 h-3.5" />
                  </button>
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
                { label: 'City',     value: form.city    || '—' },
                { label: 'District', value: form.neighbourhood || '—' },
                { label: 'Region',   value: form.region  || '—' },
                { label: 'Type',     value: `${form.propertyType || '—'} · ${form.listingType === 'sale' ? 'For Sale' : form.listingType === 'rent' ? 'For Rent' : '—'}` },
                ...(!noRooms ? [{ label: 'Beds / Baths', value: `${form.bedrooms || '—'} BD · ${form.bathrooms || '—'} BA` }] : []),
                { label: 'Area',      value: form.area ? `${formatNum(form.area)} m²` : '—' },
                { label: 'Photos',    value: `${form.photos.length} selected` },
                { label: 'Amenities', value: form.amenities.length ? form.amenities.join(', ') : 'None' },
                { label: 'Pin',       value: form.latitude ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` : '—' },
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
              <p>Your listing will be reviewed by our team. We may contact you to verify details.</p>
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
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-semibold text-gray-700">List Your Property</span>
          <div className="w-16" />
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
            <button onClick={() => setApiError('')}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
          </div>
        )}

        {/* Steps */}
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="flex items-center min-w-max md:min-w-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon, active = step === s.number, completed = step > s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      completed ? 'bg-green-500 border-green-500' : active ? 'bg-amber-600 border-amber-600' : 'bg-white border-gray-200'
                    }`}>
                      {completed ? <Check className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-300'}`} />}
                    </div>
                    <span className={`text-xs mt-2 font-medium whitespace-nowrap ${active ? 'text-amber-600' : 'text-gray-400'}`}>{s.title}</span>
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
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Check className="w-4 h-4" /> Submit Listing</>}
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <PropertyDetails listing={previewListing} isOpen={showPreview} onClose={() => setShowPreview(false)} />
      )}

      {/* Fullscreen map */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Select Property Location</h3>
                <p className="text-xs text-gray-500">Search or click to drop a pin — full address fills automatically</p>
              </div>
            </div>
            <button onClick={toggleMap}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
              <Minimize2 className="w-4 h-4" /> Done
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <MapPanel height="100%" showAddressPanel={true} />
          </div>
        </div>
      )}
    </div>
  );
}