// src/pages/agent/Listings/AgentEditProperty.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import PropertyDetails from '../../main/pageDetail/PropertDetails';
import { useUserAuth } from '../../../context/UserAuthContext';
import { fetchListing, updateListing } from '../../../api/agents/myListing';
import {
  ArrowLeft, ArrowRight, Check, Home, MapPin, Sparkles,
  Image as ImageIcon, Eye, Building2, DollarSign, Ruler,
  Bed, Bath, Car, Wifi, Droplet, Zap, Wind, Shield, Camera,
  Upload, X, Navigation, AlertCircle, Maximize2, Minimize2,
  Save, Loader2, CheckCircle2, AlertTriangle
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

const AMENITIES_LIST = [
  { id: 'wifi',      label: 'WiFi',            icon: Wifi      },
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

// ─── DB row → form state ──────────────────────────────────────────────────────
// Handles all column name differences between DB and form
const dbToForm = (row) => {
  let latitude = '', longitude = '';
  if (row.coordinates) {
    const [lat, lng] = row.coordinates.split(',').map(s => s.trim());
    if (lat && lng) { latitude = lat; longitude = lng; }
  }

  // Amenities: parking + generator are DB tinyint(1) columns
  const amenities = [];
  if (Number(row.parking)   === 1) amenities.push('parking');
  if (Number(row.generator) === 1) amenities.push('generator');
  if (Array.isArray(row.amenities))
    row.amenities.forEach(a => { if (!amenities.includes(a)) amenities.push(a); });

  // Photos from listing_photos table
  const photos = (row.photos || []).map((p, i) => ({
    id: p.id ?? i, preview: p.photo_url, photo_url: p.photo_url,
    is_cover: Number(p.is_cover) === 1, isExisting: true,
  }));
  if (!photos.length && row.cover_photo)
    photos.push({ id: 0, preview: row.cover_photo, photo_url: row.cover_photo, is_cover: true, isExisting: true });

  return {
    title:        row.title            ?? '',
    description:  row.description      ?? '',
    propertyType: row.property_type    ?? '',   // DB: property_type
    listingType:  row.transaction_type ?? '',   // DB: transaction_type
    price:        row.price            != null ? String(row.price)      : '',
    bedrooms:     row.bedrooms         != null ? String(row.bedrooms)   : '',
    bathrooms:    row.bathrooms        != null ? String(row.bathrooms)  : '',
    area:         row.area             != null ? String(row.area)       : '',
    yearBuilt:    row.year_built       != null ? String(row.year_built) : '', // DB: year_built
    address:      row.address          ?? '',
    city:         row.city             ?? '',
    region:       row.region           ?? '',
    neighborhood: row.neighborhood     ?? '',
    latitude,
    longitude,
    furnished:    row.furnished        ?? '',   // DB enum: unfurnished|semi-furnished|furnished
    amenities,
    photos,
    petFriendly:  '',
  };
};

// ─── Form state → FormData for PUT (multipart) ────────────────────────────────
const buildFormData = (form, newPhotos) => {
  const fd = new FormData();
  fd.append('title',            form.title);
  fd.append('description',      form.description);
  fd.append('property_type',    form.propertyType);
  fd.append('transaction_type', form.listingType);
  fd.append('price',            form.price || '');
  fd.append('bedrooms',         form.bedrooms  || '0');
  fd.append('bathrooms',        form.bathrooms || '0');
  fd.append('area',             form.area      || '');
  fd.append('year_built',       form.yearBuilt || '');
  fd.append('address',          form.address);
  fd.append('city',             form.city);
  fd.append('region',           form.region);
  fd.append('neighborhood',     form.neighborhood || '');
  if (form.latitude && form.longitude)
    fd.append('coordinates',    `${form.latitude},${form.longitude}`);
  fd.append('furnished',        form.furnished || '');
  fd.append('parking',          form.amenities.includes('parking')   ? '1' : '0');
  fd.append('generator',        form.amenities.includes('generator') ? '1' : '0');
  newPhotos.forEach(p => fd.append('photos[]', p.file, p.file.name));
  return fd;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AgentEditProperty() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { user }    = useUserAuth();
  const listingId   = id;

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
  const [mapReady, setMapReady] = useState(false);

  // ── 1. Load listing via fetchListing(id) ──────────────────────────────────
  useEffect(() => {
    if (!listingId) { setLoadError('No listing ID in URL.'); setIsLoading(false); return; }
    (async () => {
      try {
        // fetchListing calls GET /agent/listings/:id — returns raw DB row
        const data   = await fetchListing(listingId);
        const mapped = dbToForm(data);
        setForm(mapped);
        if (mapped.latitude && mapped.longitude)
          reverseGeocode(mapped.latitude, mapped.longitude);
      } catch (err) {
        setLoadError(err?.message || 'Failed to load listing.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [listingId]);

  // ── 2. Map init on step 2 ─────────────────────────────────────────────────
  useEffect(() => {
    if (step === 2 && !mapReady && !isLoading && form) initMap();
  }, [step, isLoading, form]);

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
    const lat = form?.latitude  ? parseFloat(form.latitude)  : 4.0511;
    const lng = form?.longitude ? parseFloat(form.longitude) : 9.7679;
    const map = window.L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: true })
      .setView([lat, lng], 14);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 20,
    }).addTo(map);
    window.L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;
    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng));
    if (form?.latitude && form?.longitude)
      placePin(parseFloat(form.latitude), parseFloat(form.longitude), false);
    setMapReady(true);
  };

  const placePin = (lat, lng, updateForm = true) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = window.L.divIcon({
      html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#D97706,#B45309);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid white;box-shadow:0 4px 12px rgba(217,119,6,.4);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg)"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>`,
      className: '', iconSize: [40, 40], iconAnchor: [20, 40],
    });
    markerRef.current = window.L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    if (updateForm) {
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      markChanged('coordinates');
      setErrors(p => ({ ...p, coordinates: '' }));
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setIsLoadingLoc(true); setLocationName('Loading…');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const d = await r.json();
      if (d?.address) {
        const { suburb, neighbourhood, quarter, city, town, village, state, region } = d.address;
        const parts = [suburb||neighbourhood||quarter, city||town||village, state||region].filter(Boolean);
        setLocationName(parts.join(', ') || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
      } else setLocationName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`);
    } catch { setLocationName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`); }
    finally { setIsLoadingLoc(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lng], 15);
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
  const markChanged = (field) =>
    setChangedFields(prev => new Set([...prev, field]));

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    markChanged(field);
    setErrors(p => ({ ...p, [field]: '' }));
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
    const newPhotos = Array.from(e.target.files).map(file => ({
      id: `new_${Date.now()}_${Math.random()}`, file,
      preview: URL.createObjectURL(file), isExisting: false,
    }));
    setForm(p => ({ ...p, photos: [...p.photos, ...newPhotos] }));
    markChanged('photos');
  };

  const removePhoto = (photoId) => {
    setForm(p => ({ ...p, photos: p.photos.filter(ph => ph.id !== photoId) }));
    markChanged('photos');
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title?.trim())       e.title        = 'Title is required';
      if (!form.description?.trim()) e.description  = 'Description is required';
      if (!form.propertyType)        e.propertyType = 'Property type is required';
      if (!form.listingType)         e.listingType  = 'Listing type is required';
      if (!form.price)               e.price        = 'Price is required';
      if (!form.bedrooms)            e.bedrooms     = 'Bedrooms required';
      if (!form.bathrooms)           e.bathrooms    = 'Bathrooms required';
      if (!form.area)                e.area         = 'Area is required';
    }
    if (s === 2) {
      if (!form.address?.trim())              e.address     = 'Address is required';
      if (!form.city?.trim())                 e.city        = 'City is required';
      if (!form.region?.trim())               e.region      = 'Region is required';
      if (!form.latitude || !form.longitude)  e.coordinates = 'Please pin the location on the map';
    }
    if (s === 4 && !form.photos.length)       e.photos      = 'At least one photo is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Save via updateListing(id, formData) ──────────────────────────────────
  // updateListing calls upload(`/agent/listings/${id}`, formData) → PUT multipart
  const persistUpdate = async () => {
    setApiError('');
    setIsSaving(true);
    try {
      const newPhotos = form.photos.filter(p => !p.isExisting);
      const fd        = buildFormData(form, newPhotos);

      await updateListing(listingId, fd);

      // Mark new photos as existing after save
      setForm(p => ({
        ...p,
        photos: p.photos.map(ph => ph.isExisting ? ph : { ...ph, isExisting: true }),
      }));
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

  const nextStep = () => { if (validate(step)) { setStep(p => Math.min(p+1, 5)); window.scrollTo(0,0); } };
  const prevStep = () => { setStep(p => Math.max(p-1, 1)); window.scrollTo(0,0); };

  const handleSubmitUpdate = async () => {
    if (!validate(step)) return;
    await persistUpdate();
    if (!apiError) navigate('/agent/listings');
  };

  // ── Preview shape ──────────────────────────────────────────────────────────
  const previewListing = form ? {
    id:          listingId,
    title:       form.title       || 'Property Title',
    price:       parseInt(form.price) || 0,
    location:    `${form.city}, ${form.region}`,
    bedrooms:    parseInt(form.bedrooms)  || 0,
    bathrooms:   parseInt(form.bathrooms) || 0,
    area:        parseInt(form.area)      || 0,
    type:        form.listingType,
    listingType: form.listingType === 'sale' ? 'For Sale' : 'For Rent',
    image:       form.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    images:      form.photos.map(p => p.preview),
    lat:         parseFloat(form.latitude)  || 4.0511,
    lng:         parseFloat(form.longitude) || 9.7679,
    description: form.description,
    propertyType: form.propertyType,
    yearBuilt:   form.yearBuilt,
    parking:     form.amenities.includes('parking') ? 1 : 0,
  } : null;

  // ── Field class ────────────────────────────────────────────────────────────
  const fc = (field, extra = '') =>
    [extra,
     'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors',
     errors[field]            ? 'border-red-400 bg-red-50'        :
     changedFields.has(field) ? 'border-amber-400 bg-amber-50/40' :
                                'border-gray-300'
    ].filter(Boolean).join(' ');

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="bg-white rounded-xl p-8 space-y-4">
          {[...Array(6)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Could not load listing</h2>
          <p className="text-red-700 mb-6">{loadError}</p>
          <button onClick={() => navigate('/agent/listings')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold">
            Back to Listings
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step content ───────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // STEP 1 ────────────────────────────────────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-500 mt-1 text-sm">Update your property details</p>
            </div>
            {changedFields.size > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                {changedFields.size} field{changedFields.size > 1 ? 's' : ''} modified
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., Modern 3BR Apartment in Bonamoussadi" className={fc('title')} />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your property in detail..." rows="5" className={fc('description')} />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className={fc('propertyType')}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'sale',l:'For Sale'},{v:'rent',l:'For Rent'}].map(t => (
                  <button key={t.v} type="button" onClick={() => set('listingType', t.v)}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                      form.listingType === t.v
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}>{t.l}</button>
                ))}
              </div>
              {errors.listingType && <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (FCFA){form.listingType === 'rent' ? ' / month' : ''} *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder={form.listingType === 'rent' ? 'Monthly rent' : 'Sale price'}
                className={fc('price', 'pl-10')} />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { field:'bedrooms',  label:'Bedrooms *',  Icon:Bed,   ph:'0' },
              { field:'bathrooms', label:'Bathrooms *', Icon:Bath,  ph:'0' },
              { field:'area',      label:'Area (m²) *', Icon:Ruler, ph:'0' },
            ].map(({field,label,Icon,ph}) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="number" value={form[field]} onChange={e => set(field, e.target.value)}
                    placeholder={ph} className={fc(field,'pl-10')} />
                </div>
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
              <input type="number" value={form.yearBuilt} onChange={e => set('yearBuilt', e.target.value)}
                placeholder="2020" className={fc('yearBuilt')} />
            </div>
            <div>
              {/* Values match DB enum: unfurnished | semi-furnished | furnished */}
              <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
              <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={fc('furnished')}>
                <option value="">Select option</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>
        </div>
      );

      // STEP 2 ────────────────────────────────────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Saved as <code className="bg-gray-100 px-1 rounded text-xs font-mono">lat,lng</code> in the{' '}
              <code className="bg-gray-100 px-1 rounded text-xs font-mono">coordinates</code> column
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <button type="button" onClick={useMyLocation}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              <Navigation className="w-5 h-5" />Use My Current Location
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />Click on Map to Update Pin *
              </label>
              <button type="button" onClick={toggleMap}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors">
                {isMapExpanded
                  ? <><Minimize2 className="w-4 h-4" /><span className="hidden sm:inline">Exit Fullscreen</span></>
                  : <><Maximize2 className="w-4 h-4" /><span className="hidden sm:inline">Fullscreen</span></>}
              </button>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
              <div className="bg-blue-50 border-b-2 border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    <strong>Current pin: </strong>
                    {locationName || (form.latitude ? `${form.latitude}, ${form.longitude}` : 'Not set')}
                    {' '}— Click to move it.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div ref={mapRef} className="w-full h-80 md:h-96" />
                {form.latitude && form.longitude && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1">Selected Location</p>
                        {isLoadingLoc
                          ? <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Loading…
                            </div>
                          : <p className="text-sm text-gray-700 break-words">{locationName}</p>}
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.coordinates && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{errors.coordinates}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="e.g., Rue 1.234, Bonamoussadi" className={fc('address')} />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { field:'city',         label:'City *',       placeholder:'e.g., Douala'      },
                { field:'region',       label:'Region *',     placeholder:'e.g., Littoral'    },
                { field:'neighborhood', label:'Neighborhood', placeholder:'e.g., Bonamoussadi'},
              ].map(({field,label,placeholder}) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <input type="text" value={form[field]} onChange={e => set(field, e.target.value)}
                    placeholder={placeholder} className={fc(field)} />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // STEP 3 ────────────────────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Amenities</h2>
            <p className="text-gray-500 mt-1 text-sm">
              {form.amenities.length} selected —{' '}
              <span className="text-amber-600 font-medium">Parking</span> &{' '}
              <span className="text-amber-600 font-medium">Generator</span> map to DB columns
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AMENITIES_LIST.map(({ id, label, icon: Icon }) => {
              const on = form.amenities.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleAmenity(id)}
                  className={`p-4 border-2 rounded-xl transition-all relative ${
                    on ? 'border-amber-600 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                  {on && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <Icon className={`w-7 h-7 mx-auto mb-2 ${on ? 'text-amber-600' : 'text-gray-400'}`} />
                  <p className={`text-xs font-semibold text-center ${on ? 'text-amber-700' : 'text-gray-600'}`}>{label}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Parking and Generator are stored as DB columns. Other amenities need an
              additional <code className="bg-blue-100 px-1 rounded text-xs">amenities_json</code> column to persist.
            </p>
          </div>
        </div>
      );

      // STEP 4 ────────────────────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
            <p className="text-gray-500 mt-1 text-sm">
              New photos are sent with the save request to{' '}
              <code className="bg-gray-100 px-1 rounded text-xs font-mono">PUT /agent/listings/{listingId}</code>
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors">
            <input type="file" multiple accept="image/*" onChange={addPhotos} className="hidden" id="photo-upload" />
            <label htmlFor="photo-upload" className="cursor-pointer block">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700 mb-1">Click to add more photos</p>
              <p className="text-sm text-gray-500">PNG · JPG · JPEG · WEBP — up to 10 MB each</p>
            </label>
          </div>
          {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}

          {form.photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Photos ({form.photos.length})
                  {form.photos.filter(p => !p.isExisting).length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      +{form.photos.filter(p => !p.isExisting).length} new (not yet saved)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">First photo = cover image</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {form.photos.map((photo, i) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200">
                    <img src={photo.preview} alt={`Photo ${i+1}`} className="w-full h-36 object-cover" />
                    {(i === 0 || photo.is_cover) && (
                      <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded font-medium">Cover</div>
                    )}
                    <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded ${
                      photo.isExisting ? 'bg-black/60' : 'bg-blue-600/90'
                    }`}>
                      {photo.isExisting ? 'Saved' : 'New'}
                    </div>
                    <button type="button" onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      // STEP 5 ────────────────────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Your Changes</h2>
            <p className="text-gray-500 mt-1 text-sm">Preview then save to push changes live</p>
          </div>

          {changedFields.size > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">
                ✏️ {changedFields.size} field{changedFields.size > 1 ? 's' : ''} modified — not yet saved
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Preview Your Listing</p>
                <p className="text-sm text-blue-800">See exactly how buyers/renters will see this listing.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowPreview(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />Preview Listing
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Listing Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label:'Title',       value: form.title || '—',                              field:'title'       },
                { label:'Price',       value: form.price ? `${parseInt(form.price).toLocaleString()} FCFA` : '—', field:'price' },
                { label:'Location',   value: `${form.city}, ${form.region}`,                  field:'city'        },
                { label:'Type',       value: `${form.propertyType} · ${form.listingType === 'sale' ? 'For Sale' : 'For Rent'}`, field:'propertyType' },
                { label:'Beds/Baths', value: `${form.bedrooms} BD · ${form.bathrooms} BA`,    field:'bedrooms'    },
                { label:'Area',       value: `${form.area} m²`,                               field:'area'        },
                { label:'Photos',     value: `${form.photos.length} (${form.photos.filter(p=>!p.isExisting).length} new)`, field:'photos' },
                { label:'Amenities',  value: `${form.amenities.length} selected`,             field:'amenities'   },
              ].map(({label,value,field}) => (
                <div key={field} className={`p-3 rounded-lg border ${
                  changedFields.has(field) ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <span className="text-gray-500 text-xs font-medium block mb-0.5">{label}</span>
                  <p className="text-gray-900 font-medium capitalize">{value}</p>
                  {changedFields.has(field) && <span className="text-xs text-amber-600 font-medium">• Modified</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Ready to update?</strong> Saves via{' '}
              <code className="bg-green-100 px-1 rounded text-xs font-mono">PUT /agent/listings/{listingId}</code>
            </p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button onClick={() => navigate('/agent/listings')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Listings
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Property</h1>
              <p className="text-sm text-gray-500 mt-1">
                Listing #{listingId} · {form?.title}
              </p>
            </div>
            {/* Quick Save — always visible */}
            <button onClick={handleSaveChanges}
              disabled={isSaving || changedFields.size === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                saveSuccess             ? 'bg-green-600 text-white' :
                changedFields.size === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                          'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              }`}>
              {isSaving    ? <Loader2     className="w-4 h-4 animate-spin" /> :
               saveSuccess ? <CheckCircle2 className="w-4 h-4" /> :
                             <Save         className="w-4 h-4" />}
              {isSaving    ? 'Saving…' :
               saveSuccess ? 'Saved!' :
               `Save Changes${changedFields.size > 0 ? ` (${changedFields.size})` : ''}`}
            </button>
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800 flex-1">{apiError}</p>
            <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Save success toast */}
        {saveSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">Changes saved successfully!</p>
          </div>
        )}

        {/* Steps — all clickable in edit mode */}
        <div className="mb-6 md:mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max md:min-w-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active    = step === s.number;
              const completed = step > s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button onClick={() => setStep(s.number)}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 ${
                        completed ? 'bg-green-500 border-green-500' :
                        active    ? 'bg-amber-600 border-amber-600' :
                                   'bg-white border-gray-300 hover:border-gray-400'
                      }`}>
                      {completed
                        ? <Check className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />}
                    </button>
                    <span className={`text-xs mt-2 font-medium ${active ? 'text-amber-600' : 'text-gray-400'}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > s.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <button onClick={prevStep} disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
            }`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {step < 5 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors">
              Next <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmitUpdate} disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors disabled:opacity-60">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {isSaving ? 'Saving…' : 'Save & Publish'}
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
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900">Update Property Location</h3>
                <p className="text-sm text-gray-500">Click to move the pin</p>
              </div>
            </div>
            <button onClick={toggleMap}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2">
              <Minimize2 className="w-4 h-4" />Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            {form.latitude && form.longitude && (
              <div className="absolute bottom-6 right-6 w-80 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-2xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Selected Location</p>
                    {isLoadingLoc
                      ? <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Loading…
                        </div>
                      : <p className="text-sm text-gray-700">{locationName}</p>}
                    <p className="text-xs text-gray-500 font-mono mt-1">
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