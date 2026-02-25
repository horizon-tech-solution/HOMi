import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin, ZoomIn, ZoomOut, Maximize2, Navigation,
  Layers, Search, X, Loader2, Info, Mountain,
  Coffee, Hospital, GraduationCap, ShoppingBag, Building2,
  Map as MapIcon, Satellite
} from 'lucide-react';

// ─── Tile Layers ──────────────────────────────────────────────────────────────
const TILE_LAYERS = {
  street: {
    label: 'Street',
    icon: MapIcon,
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: '',
  },
  clean: {
    label: 'Clean',
    icon: MapIcon,
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
  },
  satellite: {
    label: 'Satellite',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO / OSM',
    maxZoom: 19,
  },
  hybrid: {
    label: 'Hybrid',
    icon: Layers,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    labelSubdomains: 'abcd',
    attribution: 'Imagery &copy; Esri | Labels &copy; CARTO / OSM',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain',
    icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors | OpenTopoMap',
    maxZoom: 17,
    subdomains: 'abc',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const geocode = async (q) => {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return r.json();
};

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
  s.onload  = resolve;
  s.onerror = reject;
  document.body.appendChild(s);
});

// ─────────────────────────────────────────────────────────────────────────────
//  MAP COMPONENT
//
//  Props:
//    listings          – array of listing objects
//    center            – { lat, lng } default map center
//    zoom              – default zoom level
//    onMarkerClick     – called when a marker is clicked (highlights card in list)
//    onViewProperty    – called when "View Property" button in popup is clicked
//                        (opens the detail panel). Falls back to onMarkerClick
//                        if not provided.
//    selectedListingId – id of the currently selected listing
//    className / height / showControls – layout props
// ─────────────────────────────────────────────────────────────────────────────
const Map = ({
  listings = [],
  center = { lat: 4.0511, lng: 9.7679 },
  zoom = 13,
  onMarkerClick,
  onViewProperty,          // ← NEW: wired to the popup "View Property" CTA
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
  const [contextInfo,     setContextInfo]     = useState(null);

  // ── CSS + Scripts → init ──────────────────────────────────────────────────
  useEffect(() => {
    injectCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',                              'leaflet-css');
    injectCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',          'cluster-css');
    injectCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css', 'cluster-def-css');

    loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'leaflet-js', 'L')
      .then(() => loadScript(
        'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
        'cluster-js', 'MarkerClusterGroup'
      ))
      .then(() => { setTimeout(initMap, 50); })
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
  }, [listings, selectedListingId]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try { setSearchResults((await geocode(searchQuery)).slice(0, 5)); }
      catch { setSearchResults([]); }
      setIsSearching(false);
    }, 400);
  }, [searchQuery]);

  // ── Popup "View Property" CTA handler ────────────────────────────────────
  // Priority: onViewProperty → onMarkerClick → no-op
  // This is what gets called when the user clicks "View Property →" inside a popup.
  useEffect(() => {
    window.__mapViewProperty = (id) => {
      const listing = listings.find(x => String(x.id) === String(id));
      if (!listing) return;
      if (onViewProperty) {
        onViewProperty(listing);
      } else if (onMarkerClick) {
        onMarkerClick(listing);
      }
    };
    // Keep legacy handler for any other callers
    window.__mapListingClick = window.__mapViewProperty;

    return () => {
      delete window.__mapViewProperty;
      delete window.__mapListingClick;
    };
  }, [listings, onViewProperty, onMarkerClick]);

  // ── Init Map ─────────────────────────────────────────────────────────────
  const initMap = () => {
    if (!mapRef.current)              return;
    if (!window.L)                    return;
    if (!window.L.markerClusterGroup) return;
    if (initCalledRef.current)        return;
    initCalledRef.current = true;

    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl:         false,
      scrollWheelZoom:     true,
      doubleClickZoom:     true,
      touchZoom:           true,
      dragging:            true,
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
    map.on('click', () => { setContextInfo(null); setShowLayerPicker(false); });

    mapInstanceRef.current = map;
    setIsLoading(false);
    updateMarkersWithMap(map);
    setTimeout(() => map.invalidateSize(), 100);
  };

  // ─── Marker HTML ──────────────────────────────────────────────────────────
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

  // ─── Popup HTML — CTA calls window.__mapViewProperty ─────────────────────
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
            ${listing.bedrooms ? `<span style="display:flex;align-items:center;gap:4px;font-size:13px;color:#6B7280;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>${listing.bedrooms} beds</span>` : ''}
            ${listing.bathrooms ? `<span style="display:flex;align-items:center;gap:4px;font-size:13px;color:#6B7280;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 6h11M12 18h7M12 18v-6"/>
              </svg>${listing.bathrooms} baths</span>` : ''}
            ${listing.area ? `<span style="display:flex;align-items:center;gap:4px;font-size:13px;color:#6B7280;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>${listing.area} m²</span>` : ''}
          </div>` : ''}
        <button onclick="window.__mapViewProperty('${listing.id}')"
          style="width:100%;padding:10px;background:linear-gradient(135deg,#D97706,#B45309);
            color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;
            cursor:pointer;font-family:inherit;transition:opacity 0.15s;"
          onmouseover="this.style.opacity='0.88'"
          onmouseout="this.style.opacity='1'">
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

    listings.forEach((listing) => {
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
      marker.bindPopup(buildPopupHtml(listing), { maxWidth: 320, className: 'homi-popup' });

      // Marker click → highlight card in list (onMarkerClick)
      marker.on('click', () => onMarkerClick?.(listing));

      if (isSelected) cluster.on('animationend', () => marker.openPopup());
      cluster.addLayer(marker);
    });

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
      attribution: def.attribution,
      maxZoom:     def.maxZoom,
      subdomains:  def.subdomains || '',
      crossOrigin: true,
    }).addTo(map);

    if (def.labelUrl) {
      labelLayerRef.current = L.tileLayer(def.labelUrl, {
        maxZoom:    def.maxZoom,
        subdomains: def.labelSubdomains || 'abcd',
        opacity:    1,
      }).addTo(map);
    }

    if (clusterGroupRef.current) clusterGroupRef.current.bringToFront?.();
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

  // ─── Search ───────────────────────────────────────────────────────────────
  const selectSearchResult = (result) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L     = window.L;
    const lat   = parseFloat(result.lat);
    const lng   = parseFloat(result.lon);
    const label = result.display_name.split(',').slice(0, 2).join(',');
    mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    if (searchPinRef.current) mapInstanceRef.current.removeLayer(searchPinRef.current);
    searchPinRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#1D4ED8;color:white;padding:6px 11px;border-radius:9px;
            font-size:11px;font-weight:700;white-space:nowrap;max-width:190px;
            overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(29,78,216,0.4);
            border:2px solid white;font-family:system-ui;">${label}</div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
            border-top:7px solid #1D4ED8;margin-top:-1px;"></div>
          <div style="width:10px;height:10px;background:#1D4ED8;border:3px solid white;
            border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);margin-top:2px;"></div>
        </div>`,
        className: '', iconSize: [190, 60], iconAnchor: [95, 60],
      })
    }).addTo(mapInstanceRef.current);
    setSearchQuery(label);
    setSearchResults([]);
  };

  // ─── Controls ─────────────────────────────────────────────────────────────
  const handleZoomIn  = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleRecenter = () => {
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
        {/* Search */}
        <div className="absolute top-3 left-3 z-[1000]" style={{ maxWidth: 310, width: 'calc(100% - 72px)' }}>
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search a location…"
                className="flex-1 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
              {isSearching && <Loader2 className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0 animate-spin" />}
              {searchQuery && !isSearching && (
                <button className="mr-3 flex-shrink-0" onClick={() => {
                  setSearchQuery(''); setSearchResults([]);
                  if (searchPinRef.current) mapInstanceRef.current?.removeLayer(searchPinRef.current);
                }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => selectSearchResult(r)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-800 leading-tight">{r.display_name.split(',').slice(0,2).join(',')}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.display_name.split(',').slice(2,4).join(',')}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
          <div className="relative">
            <button onClick={() => setShowLayerPicker(p => !p)}
              className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all border border-gray-200"
              aria-label="Map style">
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

        {/* POI toolbar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="flex items-center gap-1 bg-white rounded-2xl shadow-xl border border-gray-100 px-2.5 py-1.5">
            {POI_CATEGORIES.map(cat => {
              const Icon     = cat.icon;
              const isActive = activePOIs.has(cat.id);
              const loading  = poiLoading.has(cat.id);
              return (
                <button key={cat.id} onClick={() => togglePOI(cat)} title={cat.label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                  style={isActive ? { background: cat.color } : {}}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{cat.label}</span>
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
          background:rgba(255,255,255,0.82) !important;
          border-radius:8px 0 0 0 !important; font-size:10px !important; padding:2px 7px !important;
        }
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