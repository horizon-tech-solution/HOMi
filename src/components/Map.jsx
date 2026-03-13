import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin, ZoomIn, ZoomOut, Maximize2, Navigation,
  Layers, Search, X, Loader2, Info, Mountain,
  Coffee, Hospital, GraduationCap, ShoppingBag, Building2,
  Map as MapIcon, Satellite, ChevronUp
} from 'lucide-react';

// ─── Tile Layers ──────────────────────────────────────────────────────────────
const TILE_LAYERS = {
  street: {
    label: 'Street', icon: MapIcon,
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19, subdomains: '',
  },
  clean: {
    label: 'Clean', icon: MapIcon,
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20, subdomains: 'abcd',
  },
  satellite: {
    label: 'Satellite', icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO / OSM',
    maxZoom: 19,
  },
  hybrid: {
    label: 'Hybrid', icon: Layers,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO / OSM',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain', icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors | OpenTopoMap',
    maxZoom: 17, subdomains: 'abc',
  },
};

const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Food',     icon: Coffee,        color: '#F59E0B', osmTag: 'amenity', osmValue: 'restaurant'  },
  { id: 'hospital',   label: 'Health',   icon: Hospital,      color: '#EF4444', osmTag: 'amenity', osmValue: 'hospital'    },
  { id: 'school',     label: 'Schools',  icon: GraduationCap, color: '#3B82F6', osmTag: 'amenity', osmValue: 'school'      },
  { id: 'shop',       label: 'Shopping', icon: ShoppingBag,   color: '#8B5CF6', osmTag: 'shop',    osmValue: 'supermarket' },
  { id: 'bank',       label: 'Banks',    icon: Building2,     color: '#10B981', osmTag: 'amenity', osmValue: 'bank'        },
];
const POI_EMOJI = { restaurant: '🍽️', hospital: '🏥', school: '🏫', shop: '🛒', bank: '🏦' };

// ─── Listing type filter bar (bottom of map) ─────────────────────────────────
const LISTING_FILTERS = [
  { id: 'all',        label: 'All',        activeBg: 'linear-gradient(135deg,#D97706,#B45309)', txType: null,          propType: null         },
  { id: 'rent',       label: 'For Rent',   activeBg: 'linear-gradient(135deg,#2563EB,#1D4ED8)', txType: 'rent',        propType: null         },
  { id: 'sale',       label: 'For Sale',   activeBg: 'linear-gradient(135deg,#059669,#047857)', txType: 'sale',        propType: null         },
  { id: 'land',       label: 'Land',       activeBg: 'linear-gradient(135deg,#7C3AED,#6D28D9)', txType: null,          propType: 'land'       },
  { id: 'commercial', label: 'Commercial', activeBg: 'linear-gradient(135deg,#DC2626,#B91C1C)', txType: null,          propType: 'commercial' },
];

// ─── RapidAPI key ─────────────────────────────────────────────────────────────
const RAPID_API_KEY = 'c8db4aa8e6msh3e685f8677a38bfp15484djsn1631b7892dec';

// ─── Google Place Search via RapidAPI ────────────────────────────────────────
// Returns array of { name, formatted_address, lat, lng, place_id, types[] }
const googlePlaceSearch = async (query) => {
  const url = `https://google-maps-api-free.p.rapidapi.com/google-find-place-search?place=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'google-maps-api-free.p.rapidapi.com',
      'x-rapidapi-key':  RAPID_API_KEY,
    },
  });
  if (!res.ok) throw new Error(`RapidAPI ${res.status}`);
  const data = await res.json();

  // Normalise — the endpoint returns candidates[] with geometry.location
  const candidates = data?.candidates || data?.results || [];
  return candidates.map(c => ({
    name:              c.name              || c.formatted_address || query,
    formatted_address: c.formatted_address || c.name             || '',
    lat:               c.geometry?.location?.lat ?? null,
    lng:               c.geometry?.location?.lng ?? null,
    place_id:          c.place_id          || '',
    types:             c.types             || [],
    // icon for UI — property-context tags
    icon: (() => {
      const t = (c.types || []).join(',');
      const name = (c.name || '').toLowerCase();
      // Land / plot
      if (t.includes('land') || t.includes('terrain') || t.includes('park') || t.includes('natural') || name.includes('terrain') || name.includes('plot') || name.includes('land'))
        return 'land';
      // Rent signals
      if (t.includes('lodging') || t.includes('apartment') || name.includes('locat') || name.includes('rent') || name.includes('appartement'))
        return 'rent';
      // Commercial / office
      if (t.includes('commercial') || t.includes('store') || t.includes('shop') || t.includes('establishment'))
        return 'commercial';
      // Residential / sale default
      if (t.includes('premise') || t.includes('sublocality') || t.includes('neighborhood') || t.includes('locality'))
        return 'area';
      return 'sale';
    })(),
  })).filter(r => r.lat != null && r.lng != null);
};

// ─── Nominatim fallback (when RapidAPI fails or returns empty) ────────────────
const nominatimSearch = async (q) => {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await r.json();
  return data.map(d => ({
    name:              d.display_name.split(',').slice(0, 2).join(', '),
    formatted_address: d.display_name,
    lat:               parseFloat(d.lat),
    lng:               parseFloat(d.lon),
    place_id:          d.place_id,
    types:             [d.type],
    icon: (() => {
      const t = d.type || '';
      if (t === 'residential' || t === 'house' || t === 'detached') return 'sale';
      if (t === 'apartments'  || t === 'flat')                      return 'rent';
      if (t === 'land'        || t === 'farmland' || t === 'grass') return 'land';
      if (t === 'commercial'  || t === 'retail'   || t === 'office')return 'commercial';
      if (t === 'suburb'      || t === 'neighbourhood' || t === 'quarter') return 'area';
      return 'area';
    })(),
  }));
};

// ─── Unified geocode — Google first, Nominatim fallback ──────────────────────
const geocode = async (q) => {
  try {
    const results = await googlePlaceSearch(q);
    if (results.length > 0) return results;
    // Google returned empty — try Nominatim
    return await nominatimSearch(q);
  } catch (err) {
    console.warn('[Map] Google search failed, falling back to Nominatim:', err.message);
    try { return await nominatimSearch(q); }
    catch { return []; }
  }
};

// ─── Reverse geocode (Nominatim — Google reverse needs paid tier) ─────────────
const reverseGeocode = async (lat, lng) => {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return r.json();
};

const fetchPOIs = async (bounds, osmTag, osmValue) => {
  const { _southWest: sw, _northEast: ne } = bounds;
  const bbox  = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
  const query = `[out:json][timeout:10];node["${osmTag}"="${osmValue}"](${bbox});out body 40;`;
  try {
    const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    return (await r.json()).elements || [];
  } catch { return []; }
};

const injectCSS = (href, id) => {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
};

const loadScript = (src, id, globalCheck) => new Promise((resolve, reject) => {
  if (window[globalCheck]) { resolve(); return; }
  const existing = document.getElementById(id);
  if (existing) {
    existing.addEventListener('load', resolve);
    existing.addEventListener('error', reject);
    return;
  }
  const s = document.createElement('script');
  s.id = id; s.src = src; s.async = true;
  s.onload = resolve; s.onerror = reject;
  document.body.appendChild(s);
});

// ─── Mobile Bottom Sheet Preview ─────────────────────────────────────────────
const MobilePreview = ({ listing, onViewProperty, onClose }) => {
  if (!listing) return null;
  const isRent = listing.listingType === 'rent' || listing.listingType === '/mo';
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[1000] pointer-events-auto"
      style={{ filter: 'drop-shadow(0 -8px 32px rgba(0,0,0,0.18))' }}
    >
      <div className="bg-white rounded-t-3xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex gap-3 px-4 pb-5 pt-2">
          <div className="w-24 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
            {listing.image
              ? <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-amber-600 leading-tight">
              {listing.price ? listing.price.toLocaleString() + ' XAF' : 'Price on request'}
              {isRent && <span className="text-xs font-normal text-gray-500">/mo</span>}
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{listing.title}</p>
            {listing.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              {listing.bedrooms  && <span>{listing.bedrooms} beds</span>}
              {listing.bathrooms && <span>{listing.bathrooms} baths</span>}
              {listing.area      && <span>{listing.area} m²</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="self-start p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="px-4 pb-6">
          <button
            onClick={() => onViewProperty(listing)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-2xl text-sm shadow-lg active:scale-95 transition-transform"
          >
            View Property →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Map = ({
  listings = [],
  center = { lat: 4.0511, lng: 9.7679 },
  zoom = 13,
  onMarkerClick,
  onViewProperty,
  selectedListingId,
  className = '',
  showControls = true,
  height = '100%',
}) => {
  const mapRef          = useRef(null);
  const mapInstanceRef  = useRef(null);
  const tileLayerRef    = useRef(null);
  const labelLayerRef   = useRef(null);
  const clusterGroupRef = useRef(null);
  const poiLayersRef    = useRef({});
  const userMarkerRef   = useRef(null);
  const searchPinRef    = useRef(null);
  const searchTimerRef  = useRef(null);
  const initCalledRef   = useRef(false);

  const [isLoading,       setIsLoading]       = useState(true);
  const [activeLayer,     setActiveLayer]     = useState('street');
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [activePOIs,      setActivePOIs]      = useState(new Set());
  const [poiLoading,      setPOILoading]      = useState(new Set());
  const [searchQuery,     setSearchQuery]     = useState('');
  const [searchResults,   setSearchResults]   = useState([]);
  const [isSearching,     setIsSearching]     = useState(false);
  const [searchSource,    setSearchSource]    = useState('');  // 'google' | 'osm'
  const [contextInfo,     setContextInfo]     = useState(null);
  const [showPOIDrawer,   setShowPOIDrawer]   = useState(false);
  const [activeFilter,    setActiveFilter]    = useState('all');
  const [previewListing,  setPreviewListing]  = useState(null);

  // ── CSS + Scripts → init ─────────────────────────────────────────────────
  useEffect(() => {
    // ── Preconnect to CDNs so DNS + TLS is resolved before scripts load ──
    ['https://unpkg.com', 'https://tile.openstreetmap.org', 'https://basemaps.cartocdn.com'].forEach(origin => {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const l = document.createElement('link');
        l.rel = 'preconnect'; l.href = origin; l.crossOrigin = 'anonymous';
        document.head.appendChild(l);
      }
    });

    // ── Inject all CSS at once ──
    injectCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',                              'leaflet-css');
    injectCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',          'cluster-css');
    injectCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css', 'cluster-def-css');

    // ── Load Leaflet first (MarkerCluster depends on it), then cluster in parallel ──
    // If Leaflet is already loaded (e.g. another map instance), skip straight to cluster
    const leafletReady = window.L
      ? Promise.resolve()
      : loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'leaflet-js', 'L');

    leafletReady
      .then(() => loadScript(
        'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
        'cluster-js', 'MarkerClusterGroup'
      ))
      .then(() => initMap())
      .catch(err => console.error('Leaflet load error', err));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initCalledRef.current  = false;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && clusterGroupRef.current) updateMarkers();
  }, [listings, selectedListingId, activeFilter]);

  // ── Search with debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchSource(''); return; }
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Try Google first — check if it actually used Google or fell back
        let usedGoogle = true;
        let results;
        try {
          results = await googlePlaceSearch(searchQuery);
          if (results.length === 0) {
            results  = await nominatimSearch(searchQuery);
            usedGoogle = false;
          }
        } catch {
          results    = await nominatimSearch(searchQuery);
          usedGoogle = false;
        }
        setSearchResults(results.slice(0, 5));
        setSearchSource(usedGoogle ? 'google' : 'osm');
      } catch {
        setSearchResults([]);
        setSearchSource('');
      }
      setIsSearching(false);
    }, 400);
  }, [searchQuery]);

  // ── Global handlers ──────────────────────────────────────────────────────
  useEffect(() => {
    window.__mapViewProperty = (id) => {
      const listing = listings.find(x => String(x.id) === String(id));
      if (!listing) return;
      if (onViewProperty) onViewProperty(listing);
      else if (onMarkerClick) onMarkerClick(listing);
    };
    window.__mapListingClick = window.__mapViewProperty;
    return () => {
      delete window.__mapViewProperty;
      delete window.__mapListingClick;
    };
  }, [listings, onViewProperty, onMarkerClick]);

  // ── Init Map ─────────────────────────────────────────────────────────────
  const initMap = () => {
    if (!mapRef.current || !window.L || !window.L.markerClusterGroup || initCalledRef.current) return;
    initCalledRef.current = true;
    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl:         false,
      scrollWheelZoom:     true,
      doubleClickZoom:     true,
      touchZoom:           true,
      dragging:            true,
      tap:                 true,
      tapTolerance:        15,
      zoomSnap:            0.5,
      zoomDelta:           0.5,
      wheelPxPerZoomLevel: 60,
      preferCanvas:        true,
    }).setView([center.lat, center.lng], zoom);

    const def = TILE_LAYERS.street;
    tileLayerRef.current = L.tileLayer(def.url, {
      attribution: def.attribution,
      maxZoom:     def.maxZoom,
      crossOrigin: true,
    }).addTo(map);

    clusterGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom:   true,
      maxClusterRadius:    60,
      iconCreateFunction: (cluster) => {
        const n = cluster.getChildCount();
        return L.divIcon({
          html:       `<div class="homi-cluster">${n}</div>`,
          className:  '',
          iconSize:   [46, 46],
          iconAnchor: [23, 23],
        });
      },
    });
    map.addLayer(clusterGroupRef.current);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    map.on('contextmenu', async (e) => {
      try {
        const info = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        setContextInfo({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5), address: info.display_name });
      } catch {
        setContextInfo({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5), address: 'Unknown location' });
      }
    });
    map.on('click', () => {
      setContextInfo(null);
      setShowLayerPicker(false);
      setPreviewListing(null);
    });

    mapInstanceRef.current = map;
    setIsLoading(false);
    updateMarkersWithMap(map);
    setTimeout(() => map.invalidateSize(), 100);
  };

  // ─── Marker HTML ─────────────────────────────────────────────────────────
  const buildMarkerHtml = (listing, isSelected) => {
    const priceInK = listing.price ? `${(listing.price / 1000).toFixed(0)}K` : 'N/A';
    const bg    = isSelected ? 'linear-gradient(135deg,#92400E,#78350F)' : 'linear-gradient(135deg,#D97706,#B45309)';
    const sh    = isSelected ? '0 6px 20px rgba(146,64,14,0.45)' : '0 4px 12px rgba(217,119,6,0.3)';
    const sc    = isSelected ? 'scale(1.15) translateY(-2px)' : 'scale(1)';
    const pinBg = isSelected ? '#92400E' : '#D97706';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="background:${bg};color:white;padding:8px 14px;border-radius:8px;
          font-weight:600;font-size:13px;font-family:system-ui,sans-serif;
          box-shadow:${sh};border:2px solid white;white-space:nowrap;
          transform:${sc};transition:all 0.3s;position:relative;">
          ${priceInK} XAF
          <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;"></div>
          <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${pinBg};"></div>
        </div>
        <div style="margin-top:2px;width:32px;height:32px;background:${pinBg};
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.2);
          display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg)">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>`;
  };

  // ─── Popup HTML (desktop only) ────────────────────────────────────────────
  const buildPopupHtml = (listing) => `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-width:280px;">
      ${listing.image ? `
        <div style="position:relative;">
          <img src="${listing.image}" alt="${listing.title}"
            style="width:100%;height:178px;object-fit:cover;display:block;"/>
          ${listing.type ? `<span style="position:absolute;top:10px;left:10px;
            background:rgba(217,119,6,0.92);color:white;font-size:10px;font-weight:700;
            padding:3px 9px;border-radius:20px;text-transform:uppercase;">
            ${listing.listingType || listing.type}</span>` : ''}
        </div>` : ''}
      <div style="padding:14px 16px 16px;">
        <h3 style="margin:0 0 7px;font-size:15px;font-weight:700;color:#111827;line-height:1.35;">${listing.title}</h3>
        ${listing.location ? `
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#D97706">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span style="font-size:12px;color:#6B7280;">${listing.location}</span>
          </div>` : ''}
        <div style="font-size:20px;font-weight:800;color:#D97706;margin-bottom:10px;">
          ${listing.price ? listing.price.toLocaleString() + ' XAF' : 'Price on request'}
          ${listing.listingType ? `<span style="font-size:11px;font-weight:600;color:#9CA3AF;margin-left:6px;">${listing.listingType}</span>` : ''}
        </div>
        ${(listing.bedrooms || listing.bathrooms || listing.area) ? `
          <div style="display:flex;gap:16px;flex-wrap:wrap;padding-top:10px;border-top:1px solid #F3F4F6;margin-bottom:12px;">
            ${listing.bedrooms  ? `<span style="font-size:13px;color:#6B7280;">${listing.bedrooms} beds</span>`  : ''}
            ${listing.bathrooms ? `<span style="font-size:13px;color:#6B7280;">${listing.bathrooms} baths</span>` : ''}
            ${listing.area      ? `<span style="font-size:13px;color:#6B7280;">${listing.area} m²</span>`        : ''}
          </div>` : ''}
        <button onclick="window.__mapViewProperty('${listing.id}')"
          style="width:100%;padding:10px;background:linear-gradient(135deg,#D97706,#B45309);
            color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;
            cursor:pointer;font-family:inherit;transition:opacity 0.15s;"
          onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
          View Property →
        </button>
      </div>
    </div>`;

  // ─── Update Markers ───────────────────────────────────────────────────────
  const updateMarkersWithMap = (map) => {
    const L       = window.L;
    const cluster = clusterGroupRef.current;
    if (!L || !cluster || !map) return;

    cluster.clearLayers();
    const bounds = [];
    const mobile = window.innerWidth < 768;

    // Apply listing type filter
    const filtered = activeFilter === 'all' ? listings : listings.filter(l => {
      const f = LISTING_FILTERS.find(x => x.id === activeFilter);
      if (!f) return true;
      if (f.txType)   return (l.listingType || l.transaction_type || '').toLowerCase() === f.txType;
      if (f.propType) return (l.propertyType || l.property_type   || '').toLowerCase() === f.propType;
      return true;
    });

    filtered.forEach((listing) => {
      const lat = listing.lat || listing.coordinates?.lat;
      const lng = listing.lng || listing.coordinates?.lng;
      if (lat == null || lng == null) return;

      bounds.push([lat, lng]);
      const isSelected = listing.id === selectedListingId;

      const icon = L.divIcon({
        html:        buildMarkerHtml(listing, isSelected),
        className:   'homi-marker',
        iconSize:    [80, 70],
        iconAnchor:  [40, 70],
        popupAnchor: [0, -70],
      });

      const marker = L.marker([lat, lng], { icon });

      if (mobile) {
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setPreviewListing(listing);
          onMarkerClick?.(listing);
          map.panTo([lat, lng], { animate: true, duration: 0.4 });
        });
      } else {
        marker.bindPopup(buildPopupHtml(listing), { maxWidth: 320, className: 'homi-popup' });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onMarkerClick?.(listing);
        });
        if (isSelected) {
          cluster.on('animationend', () => marker.openPopup());
        }
      }

      cluster.addLayer(marker);
    });

    // Recenter only on filtered set
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  };

  const updateMarkers = () => updateMarkersWithMap(mapInstanceRef.current);

  // ─── Tile Layer Switch ────────────────────────────────────────────────────
  const switchLayer = useCallback((layerId) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L   = window.L;
    const map = mapInstanceRef.current;
    const def = TILE_LAYERS[layerId];
    if (tileLayerRef.current)  map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) { map.removeLayer(labelLayerRef.current); labelLayerRef.current = null; }
    tileLayerRef.current = L.tileLayer(def.url, {
      attribution: def.attribution, maxZoom: def.maxZoom,
      subdomains: def.subdomains || '', crossOrigin: true,
    }).addTo(map);
    if (def.labelUrl) {
      labelLayerRef.current = L.tileLayer(def.labelUrl, {
        maxZoom: def.maxZoom, subdomains: def.labelSubdomains || 'abcd', opacity: 1,
      }).addTo(map);
    }
    clusterGroupRef.current?.bringToFront?.();
    setActiveLayer(layerId);
    setShowLayerPicker(false);
  }, []);

  // ─── POI Toggle ───────────────────────────────────────────────────────────
  const togglePOI = useCallback(async (cat) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L   = window.L;
    const map = mapInstanceRef.current;
    if (activePOIs.has(cat.id)) {
      if (poiLayersRef.current[cat.id]) { map.removeLayer(poiLayersRef.current[cat.id]); delete poiLayersRef.current[cat.id]; }
      setActivePOIs(prev => { const s = new Set(prev); s.delete(cat.id); return s; });
      return;
    }
    setPOILoading(prev => new Set(prev).add(cat.id));
    const pois = await fetchPOIs(map.getBounds(), cat.osmTag, cat.osmValue);
    const layer = L.layerGroup();
    pois.forEach((poi) => {
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:${cat.color};border:2.5px solid white;
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.22);font-size:13px;">${POI_EMOJI[cat.id] || '📍'}</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14],
      });
      L.marker([poi.lat, poi.lon], { icon })
        .bindPopup(`
          <div style="font-family:system-ui;padding:6px;min-width:160px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${poi.tags?.name || cat.label}</div>
            ${poi.tags?.['addr:street']  ? `<div style="font-size:12px;color:#6B7280;">${poi.tags['addr:street']}</div>` : ''}
            ${poi.tags?.opening_hours    ? `<div style="font-size:12px;color:#10B981;margin-top:4px;">🕐 ${poi.tags.opening_hours}</div>` : ''}
            ${poi.tags?.phone            ? `<div style="font-size:12px;color:#3B82F6;margin-top:3px;">📞 ${poi.tags.phone}</div>` : ''}
          </div>`, { maxWidth: 220, className: 'homi-popup' })
        .addTo(layer);
    });
    layer.addTo(map);
    poiLayersRef.current[cat.id] = layer;
    setActivePOIs(prev => new Set(prev).add(cat.id));
    setPOILoading(prev => { const s = new Set(prev); s.delete(cat.id); return s; });
  }, [activePOIs]);

  // ─── Place a search pin on the map ───────────────────────────────────────
  const selectSearchResult = (result) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L   = window.L;
    const lat = result.lat;
    const lng = result.lng;

    mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });

    if (searchPinRef.current) mapInstanceRef.current.removeLayer(searchPinRef.current);
    searchPinRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#1D4ED8;color:white;padding:6px 11px;border-radius:9px;
            font-size:11px;font-weight:700;white-space:nowrap;max-width:200px;
            overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(29,78,216,0.4);
            border:2px solid white;font-family:system-ui;">${result.name}</div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
            border-top:7px solid #1D4ED8;margin-top:-1px;"></div>
          <div style="width:10px;height:10px;background:#1D4ED8;border:3px solid white;
            border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);margin-top:2px;"></div>
        </div>`,
        className: '', iconSize: [200, 60], iconAnchor: [100, 60],
      })
    }).addTo(mapInstanceRef.current);

    setSearchQuery(result.name);
    setSearchResults([]);
    setSearchSource('');
  };

  // ─── Controls ─────────────────────────────────────────────────────────────
  const handleZoomIn    = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut   = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter  = () => {
    if (!mapInstanceRef.current) return;
    if (listings.length > 0 && clusterGroupRef.current) {
      const b = clusterGroupRef.current.getBounds();
      if (b.isValid()) { mapInstanceRef.current.flyToBounds(b, { padding: [80, 80], maxZoom: 15, animate: true, duration: 1 }); return; }
    }
    mapInstanceRef.current.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 1 });
  };
  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    navigator.geolocation.getCurrentPosition(({ coords: { latitude: lat, longitude: lng } }) => {
      mapInstanceRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
      if (userMarkerRef.current) mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:48px;height:48px;background:rgba(37,99,235,0.15);
              border-radius:50%;animation:pulseRing 2s ease-out infinite;"></div>
            <div style="width:18px;height:18px;background:#2563EB;border:3px solid white;
              border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5);position:relative;z-index:2;"></div>
          </div>`,
          className: '', iconSize: [48, 48], iconAnchor: [24, 24],
        })
      }).bindPopup('<b>Your location</b>').addTo(mapInstanceRef.current);
      setTimeout(() => {
        if (userMarkerRef.current) { mapInstanceRef.current?.removeLayer(userMarkerRef.current); userMarkerRef.current = null; }
      }, 5000);
    }, (err) => console.warn('Geolocation error:', err));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }} />

      {showControls && !isLoading && (<>

        {/* ── Search bar ── */}
        <div className="absolute top-3 left-3 z-[1000]" style={{ maxWidth: 310, width: 'calc(100% - 64px)' }}>
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search a location…"
                className="flex-1 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              {isSearching && <Loader2 className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0 animate-spin" />}
              {searchQuery && !isSearching && (
                <button className="mr-3 flex-shrink-0" onClick={() => {
                  setSearchQuery(''); setSearchResults([]); setSearchSource('');
                  if (searchPinRef.current) mapInstanceRef.current?.removeLayer(searchPinRef.current);
                }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                </button>
              )}
            </div>

            {/* ── Search results dropdown ── */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
                {/* Source badge */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Results</span>
                  {searchSource === 'google' ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400">OpenStreetMap</span>
                  )}
                </div>

                {searchResults.map((r, i) => {
                  // Property-context tag badge
                  const tagMeta = {
                    rent:       { label: 'For Rent',   bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
                    sale:       { label: 'For Sale',   bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
                    land:       { label: 'Land',       bg: '#E0F2FE', color: '#075985', border: '#7DD3FC' },
                    commercial: { label: 'Commercial', bg: '#EDE9FE', color: '#4C1D95', border: '#C4B5FD' },
                    area:       { label: 'Area',       bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
                  };
                  const tag = tagMeta[r.icon] || tagMeta.area;
                  return (
                    <button key={i} onClick={() => selectSearchResult(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                      {/* Tag badge */}
                      <span style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}
                        className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {tag.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 leading-tight truncate">{r.name}</div>
                        {r.formatted_address && r.formatted_address !== r.name && (
                          <div className="text-xs text-gray-400 mt-0.5 truncate">{r.formatted_address}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right controls ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
          <div className="relative">
            <button
              onClick={() => setShowLayerPicker(p => !p)}
              className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200"
              aria-label="Map style"
            >
              <Layers className="w-5 h-5 text-gray-700" />
            </button>
            {showLayerPicker && (
              <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1002] w-40">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">Map Style</div>
                {Object.entries(TILE_LAYERS).map(([id, def]) => {
                  const Icon = def.icon;
                  return (
                    <button key={id} onClick={() => switchLayer(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${activeLayer === id ? 'bg-amber-50 text-amber-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {def.label}
                      {activeLayer === id && <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={handleZoomIn}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleZoomOut}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleRecenter}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200">
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleMyLocation}
            className="w-11 h-11 bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all">
            <Navigation className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ── Listing type filter bar — mobile ── */}
        <div className="md:hidden absolute z-[1000]"
          style={{ bottom: previewListing ? 268 : 16, left: '50%', transform: 'translateX(-50%)', transition: 'bottom 0.3s ease' }}>
          <div className="flex items-center gap-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 px-2 py-1.5 whitespace-nowrap">
            {LISTING_FILTERS.map(f => {
              const isActive = activeFilter === f.id;
              return (
                <button key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                  style={isActive
                    ? { background: f.activeBg, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }
                    : { color: '#6B7280' }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Listing type filter bar — desktop ── */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="flex items-center gap-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 px-2 py-1.5">
            {LISTING_FILTERS.map(f => {
              const isActive = activeFilter === f.id;
              return (
                <button key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={isActive
                    ? { background: f.activeBg, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }
                    : { color: '#6B7280' }}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Context info */}
        {contextInfo && (
          <div className="absolute bottom-20 left-3 z-[1000] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Location</span>
                </div>
                <p className="text-sm text-gray-700 leading-snug">{contextInfo.address}</p>
                <p className="text-xs text-gray-400 mt-1">{contextInfo.lat}, {contextInfo.lng}</p>
              </div>
              <button onClick={() => setContextInfo(null)}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-[10px] text-gray-300 mt-2 italic">Right-click anywhere for location info</p>
          </div>
        )}
      </>)}

      {/* ── Mobile bottom sheet preview ── */}
      {previewListing && (
        <MobilePreview
          listing={previewListing}
          onViewProperty={(listing) => {
            setPreviewListing(null);
            if (onViewProperty) onViewProperty(listing);
            else if (onMarkerClick) onMarkerClick(listing);
          }}
          onClose={() => setPreviewListing(null)}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-[2000]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <MapPin className="w-16 h-16 text-amber-600 animate-bounce" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-amber-600 rounded-full animate-ping" />
              </div>
            </div>
            <p className="text-gray-700 font-medium">Loading map…</p>
            <p className="text-sm text-gray-500 mt-1">Finding properties near you</p>
          </div>
        </div>
      )}

      <style>{`
        .homi-marker { background: none !important; border: none !important; }
        .homi-cluster {
          width:44px; height:44px;
          background:linear-gradient(135deg,#D97706,#B45309);
          border:3px solid white; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          color:white; font-weight:800; font-size:14px;
          box-shadow:0 4px 14px rgba(217,119,6,0.4);
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        }
        .homi-popup .leaflet-popup-content-wrapper {
          border-radius:16px !important; padding:0 !important; overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.15) !important;
          border:1px solid rgba(0,0,0,0.06);
        }
        .homi-popup .leaflet-popup-content { margin:0 !important; width:100% !important; }
        .homi-popup .leaflet-popup-tip-container { display:none; }
        .homi-popup .leaflet-popup-close-button {
          top:8px !important; right:8px !important;
          width:24px !important; height:24px !important;
          background:rgba(0,0,0,0.4) !important; border-radius:50% !important;
          color:white !important; font-size:16px !important; z-index:10 !important;
          display:flex !important; align-items:center !important; justify-content:center !important;
        }
        .leaflet-control-scale-line {
          border:2px solid #374151 !important; border-top:none !important;
          background:rgba(255,255,255,0.88) !important;
          font-size:11px !important; font-weight:600 !important; color:#374151 !important;
          border-radius:0 0 5px 5px !important; padding:1px 6px !important;
        }
        .leaflet-control-attribution {
          background:rgba(255,255,255,0.45) !important;
          border-radius:6px 0 0 0 !important;
          font-size:8px !important;
          padding:1px 5px !important;
          color:#aaa !important;
          opacity:0.55 !important;
          transition:opacity 0.2s;
        }
        .leaflet-control-attribution:hover {
          opacity:1 !important;
          background:rgba(255,255,255,0.95) !important;
          color:#555 !important;
        }
        .leaflet-control-attribution a { color:#aaa !important; }
        .leaflet-control-attribution:hover a { color:#2563EB !important; }
        .leaflet-cluster-anim .leaflet-marker-icon,
        .leaflet-cluster-anim .leaflet-marker-shadow {
          transition:transform 0.3s ease-out, opacity 0.3s ease-in;
        }
        @keyframes pulseRing {
          0%   { transform:scale(0.4); opacity:0.8; }
          100% { transform:scale(1.7); opacity:0; }
        }
      `}</style>
    </div>
  );
};

export default Map;