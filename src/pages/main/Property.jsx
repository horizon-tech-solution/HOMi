// src/pages/public/Properties.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Map as MapIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import LocationSearch from '../../components/LocationSearch';
import PropertyCard    from '../../components/PropertyCard';
import PropertyDetails from './pageDetail/PropertDetails';
import Map             from '../../components/Map';
import Loader          from '../../components/Loader';
import Button          from '../../components/Button';
import { fetchProperties } from '../../api/public/properties';
import { recordView, recordSearch } from '../../api/users/history';

// ── Normalise API row ─────────────────────────────────────────────────────────
const normalise = (l) => ({
  ...l,
  location:    l.address || l.city || '',
  type:        l.transaction_type,
  listingType: l.transaction_type === 'sale' ? 'For Sale' : 'For Rent',
  image:       l.cover_photo || l.photos?.[0] || '',
  images:      l.photos || [],
  isFavorited: false,
  lat: l.lat ?? null,
  lng: l.lng ?? null,
});

const EMPTY_FILTERS = {
  search: '', type: '', minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings,   setListings]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [selectedListing,            setSelectedListing]            = useState(null);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);

  const [showFilters,   setShowFilters]   = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(35);
  const [isDragging,    setIsDragging]    = useState(false);
  const [startY,        setStartY]        = useState(0);

  // Map center — driven by LocationSearch selection
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 });
  const [mapZoom,   setMapZoom]   = useState(13);
  // Bounding box from Nominatim for the selected location
  const [locationBbox, setLocationBbox] = useState(null);

  const sheetRef = useRef(null);

  // ── Filters state ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(() => ({
    search:    searchParams.get('search') || searchParams.get('q') || '',
    type:      searchParams.get('listingType') || searchParams.get('type') || '',
    minPrice:  searchParams.get('price_min')  || '',
    maxPrice:  searchParams.get('price_max')  || '',
    bedrooms:  searchParams.get('bedrooms')   || '',
    bathrooms: searchParams.get('bathrooms')  || '',
  }));

  // ── Smart fetch with radius expansion ────────────────────────────────────
  const [searchContext, setSearchContext] = useState(null);
  // { type: 'exact'|'expanded'|'recommended', originalQuery: string }

  const loadListings = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const loc = params.get('search') || params.get('q') || params.get('city') || params.get('neighborhood');
      const tx           = params.get('listingType') || params.get('type');
      const property_type = params.get('property_type');
      const price_min    = params.get('price_min');
      const price_max    = params.get('price_max');
      const bedrooms     = params.get('bedrooms');
      const bathrooms    = params.get('bathrooms');
      // Bbox params (set when user picks from LocationSearch dropdown)
      const lat_min = params.get('lat_min');
      const lat_max = params.get('lat_max');
      const lng_min = params.get('lng_min');
      const lng_max = params.get('lng_max');

      const baseParams = {};
      if (tx)            baseParams.listingType   = tx;
      if (property_type) baseParams.property_type = property_type;
      if (price_min)     baseParams.price_min     = price_min;
      if (price_max)     baseParams.price_max     = price_max;
      if (bedrooms)      baseParams.bedrooms      = bedrooms;
      if (bathrooms)     baseParams.bathrooms     = bathrooms;

      if (loc) {
        // ── Step 1: exact text search ────────────────────────────────────
        const res1 = await fetchProperties({ ...baseParams, search: loc, limit: 50 });
        const rows1 = (res1.data || []).map(normalise);
        if (rows1.length > 0) {
          setListings(rows1);
          setTotal(res1.total || rows1.length);
          setSearchContext({ type: 'exact', originalQuery: loc });
          return;
        }

        // ── Step 2: bbox search (geo-boundary from Nominatim) ────────────
        if (lat_min && lat_max && lng_min && lng_max) {
          const res2 = await fetchProperties({
            ...baseParams,
            lat_min, lat_max, lng_min, lng_max,
            limit: 50,
          });
          const rows2 = (res2.data || []).map(normalise);
          if (rows2.length > 0) {
            setListings(rows2);
            setTotal(res2.total || rows2.length);
            setSearchContext({ type: 'bbox', originalQuery: loc });
            return;
          }
        }

        // ── Step 3: broaden text — strip to first word ───────────────────
        const broadLoc = loc.split(/[,\s]+/)[0];
        if (broadLoc && broadLoc !== loc) {
          const res3 = await fetchProperties({ ...baseParams, search: broadLoc, limit: 50 });
          const rows3 = (res3.data || []).map(normalise);
          if (rows3.length > 0) {
            setListings(rows3);
            setTotal(res3.total || rows3.length);
            setSearchContext({ type: 'expanded', originalQuery: loc, expandedTo: broadLoc });
            return;
          }
        }

        // ── Step 4: no results anywhere — show all as recommendations ────
        const res4 = await fetchProperties({ ...baseParams, limit: 50 });
        const rows4 = (res4.data || []).map(normalise);
        setListings(rows4);
        setTotal(res4.total || rows4.length);
        setSearchContext({ type: 'recommended', originalQuery: loc });
        return;
      }

      // ── No location — normal fetch ────────────────────────────────────
      const res = await fetchProperties({ ...baseParams, limit: 50 });
      const rows = (res.data || []).map(normalise);
      setListings(rows);
      setTotal(res.total || rows.length);
      setSearchContext(null);

    } catch (e) {
      setError(`Failed to load: ${e.message}`);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(searchParams); }, [searchParams]);

  // Restore detail panel from URL
  useEffect(() => {
    const pid = searchParams.get('property');
    if (pid && listings.length > 0) {
      const found = listings.find(l => String(l.id) === pid);
      if (found) setSelectedPropertyForDetails(found);
    }
    if (!pid) setSelectedPropertyForDetails(null);
  }, [searchParams, listings]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  // Called when user picks a suggestion from LocationSearch dropdown
  // — immediately fires the search AND zooms the map
  const handleLocationSelect = async ({ label, shortLabel, lat, lng }) => {
    const val = shortLabel || label || '';
    setFilters(prev => ({ ...prev, search: val }));

    // Zoom map
    if (lat && lng) {
      setMapCenter({ lat, lng });
      setMapZoom(14);
    }

    // Build base params preserving active filters
    const p = new URLSearchParams();
    if (val) p.set('search', val);
    const cur = new URLSearchParams(searchParams);
    if (cur.get('listingType')) p.set('listingType', cur.get('listingType'));
    if (cur.get('price_min'))   p.set('price_min',   cur.get('price_min'));
    if (cur.get('price_max'))   p.set('price_max',   cur.get('price_max'));
    if (cur.get('bedrooms'))    p.set('bedrooms',    cur.get('bedrooms'));
    if (cur.get('bathrooms'))   p.set('bathrooms',   cur.get('bathrooms'));

    // Fetch bounding box from Nominatim for geo-boundary search
    try {
      const q   = encodeURIComponent(val + ' Cameroon');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.[0]?.boundingbox) {
        const [latMin, latMax, lngMin, lngMax] = data[0].boundingbox;
        p.set('lat_min', latMin);
        p.set('lat_max', latMax);
        p.set('lng_min', lngMin);
        p.set('lng_max', lngMax);
        setLocationBbox({ lat_min: latMin, lat_max: latMax, lng_min: lngMin, lng_max: lngMax });
      }
    } catch {}

    setSearchParams(p);
  };

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (filters.search)    p.set('search',      filters.search);
    if (filters.type)      p.set('listingType', filters.type);
    if (filters.minPrice)  p.set('price_min',   filters.minPrice);
    if (filters.maxPrice)  p.set('price_max',   filters.maxPrice);
    if (filters.bedrooms)  p.set('bedrooms',    filters.bedrooms);
    if (filters.bathrooms) p.set('bathrooms',   filters.bathrooms);
    setSearchParams(p);
    setShowFilters(false);

    // Auto-save to search history — fire-and-forget, never blocks render
    try {
      const criteria = {};
      if (filters.search)    criteria.q           = filters.search;
      if (filters.type)      criteria.listingType = filters.type;
      if (filters.minPrice)  criteria.price_min   = filters.minPrice;
      if (filters.maxPrice)  criteria.price_max   = filters.maxPrice;
      if (filters.bedrooms)  criteria.bedrooms    = filters.bedrooms;
      if (filters.bathrooms) criteria.bathrooms   = filters.bathrooms;
      if (Object.keys(criteria).length) recordSearch(criteria).catch(() => {});
    } catch {}
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchParams(new URLSearchParams());
  };

  // ── Map / card interactions ───────────────────────────────────────────────
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing.id);
    if (window.innerWidth < 1024) {
      setSheetExpanded(true);
      setTimeout(() => {
        document.getElementById(`listing-${listing.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handlePropertyClick = (listing) => {
    setSelectedPropertyForDetails(listing);
    recordView(listing.id).catch(() => {});
    const p = new URLSearchParams(searchParams);
    p.set('property', listing.id);
    navigate(`?${p.toString()}`, { replace: false });
  };

  const handleClosePropertyDetails = () => {
    setSelectedPropertyForDetails(null);
    const p = new URLSearchParams(searchParams);
    p.delete('property');
    navigate(`?${p.toString()}`, { replace: false });
  };

  // ── Bottom sheet drag ─────────────────────────────────────────────────────
  const handleTouchStart = (e) => { setIsDragging(true); setStartY(e.touches[0].clientY); };
  const handleTouchMove  = (e) => {
    if (!isDragging) return;
    const delta = startY - e.touches[0].clientY;
    setCurrentHeight(h => Math.max(15, Math.min(85, h + (delta / window.innerHeight) * 100)));
    setStartY(e.touches[0].clientY);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if      (currentHeight < 25) { setCurrentHeight(15); setSheetExpanded(false); }
    else if (currentHeight > 55) { setCurrentHeight(75); setSheetExpanded(true);  }
    else                         { setCurrentHeight(35); setSheetExpanded(false); }
  };
  const toggleSheet = () => {
    if (sheetExpanded) { setCurrentHeight(35); setSheetExpanded(false); }
    else               { setCurrentHeight(75); setSheetExpanded(true);  }
  };

  const hasActiveFilters = searchParams.toString().length > 0 && !searchParams.has('property');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── DESKTOP HEADER ─────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading…' : `${total} Properties`}
            </h1>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="md:col-span-2 xl:col-span-2">
              <LocationSearch
                value={filters.search}
                onChange={val => handleFilterChange('search', val)}
                onSelect={handleLocationSelect}
                placeholder="Search city or neighbourhood…"
                inputClassName="py-2 rounded-lg"
              />
            </div>

            <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none">
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <select value={filters.bedrooms} onChange={e => handleFilterChange('bedrooms', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none">
              <option value="">Beds</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>

            <select value={filters.bathrooms} onChange={e => handleFilterChange('bathrooms', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none">
              <option value="">Baths</option>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>

            <div className="flex gap-2">
              <input type="number" placeholder="Min Price" value={filters.minPrice}
                onChange={e => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" />
              <input type="number" placeholder="Max Price" value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button onClick={applyFilters}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white shadow-md sticky top-0 z-20 mb-4">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <LocationSearch
                value={filters.search}
                onChange={val => handleFilterChange('search', val)}
                onSelect={handleLocationSelect}
                placeholder="Search Douala, Bafoussam…"
                inputClassName="rounded-full border-2 border-gray-200 shadow-sm"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-full active:scale-95 transition-all shadow-lg flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-bold whitespace-nowrap">Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden z-[9999] animate-slide-up shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-5 space-y-5 pb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                  <LocationSearch
                    value={filters.search}
                    onChange={val => handleFilterChange('search', val)}
                    onSelect={handleLocationSelect}
                    placeholder="Any city or neighbourhood…"
                    inputClassName="border-2 border-gray-200 rounded-xl py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Property Type</label>
                  <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white text-gray-900">
                    <option value="">Buy or Rent</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Bedrooms</label>
                    <select value={filters.bedrooms} onChange={e => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-white text-gray-900">
                      <option value="">Any</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Bathrooms</label>
                    <select value={filters.bathrooms} onChange={e => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-white text-gray-900">
                      <option value="">Any</option>
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Price Range (XAF)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={e => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-white text-gray-900" />
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={e => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-white text-gray-900" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2 -mx-5 px-5 border-t border-gray-200">
                  <button onClick={clearFilters}
                    className="flex-1 px-5 py-4 bg-white border-2 border-gray-400 text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-all">
                    Clear All
                  </button>
                  <button onClick={applyFilters}
                    className="flex-1 px-5 py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-xl">
                    Show {total} Results
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex h-[calc(100vh-180px)]">
        <div className="lg:w-1/2 xl:w-3/5 relative">
          <Map
            listings={listings}
            center={mapCenter}
            zoom={mapZoom}
            onMarkerClick={handleMarkerClick}
            onViewProperty={handlePropertyClick}
            selectedListingId={selectedListing}
            height="100%"
            showSearch={false}
          />
        </div>
        <div className="lg:w-1/2 xl:w-2/5 overflow-y-auto bg-white">
          <div className="p-4">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <Button onClick={() => loadListings(searchParams)}>Retry</Button>
              </div>
            ) : (
              <>
                {/* Smart context banner */}
                <SearchContextBanner context={searchContext} onClear={clearFilters} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {listings.map(listing => (
                    <div key={listing.id} id={`listing-${listing.id}`}
                      className={`transition-all ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
                      onMouseEnter={() => setSelectedListing(listing.id)}
                      onMouseLeave={() => setSelectedListing(null)}>
                      <PropertyCard listing={listing} onClick={() => handlePropertyClick(listing)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────── */}
      <div className="lg:hidden h-[calc(100vh-76px)] relative overflow-hidden">
        <Map
          listings={listings}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerClick={handleMarkerClick}
          onViewProperty={handlePropertyClick}
          selectedListingId={selectedListing}
          height="100%"
          showSearch={false}
        />
        <div ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-10"
          style={{ height: `${currentHeight}vh`, touchAction: 'none' }}>
          <div className="sticky top-0 bg-white rounded-t-3xl px-4 py-3 cursor-grab active:cursor-grabbing z-10"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleSheet}>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">
                    {loading ? 'Loading…' : `${listings.length} properties`}
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={e => { e.stopPropagation(); clearFilters(); }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium">Clear</button>
                  )}
                </div>
                {sheetExpanded
                  ? <ChevronDown className="w-5 h-5 text-gray-400" />
                  : <ChevronUp   className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] px-4 pb-4">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 text-sm mb-3">{error}</p>
                <Button onClick={() => loadListings(searchParams)}>Retry</Button>
              </div>
            ) : (
              <>
                <SearchContextBanner context={searchContext} onClear={clearFilters} compact />
                <div className={`grid gap-4 ${sheetExpanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {listings.map(listing => (
                    <div key={listing.id} id={`listing-${listing.id}`}
                      className={`transition-all ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}>
                      <PropertyCard listing={listing} onClick={() => handlePropertyClick(listing)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PropertyDetails
        listing={selectedPropertyForDetails}
        isOpen={!!selectedPropertyForDetails}
        onClose={handleClosePropertyDetails}
      />

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// ── Smart search context banner ───────────────────────────────────────────────
const SearchContextBanner = ({ context, onClear, compact = false }) => {
  if (!context) return null;

  if (context.type === 'bbox') {
    return (
      <div className={`flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-xl mb-4 ${compact ? 'p-3' : 'p-4'}`}>
        <span className="text-lg flex-shrink-0">📍</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-green-900 ${compact ? 'text-xs' : 'text-sm'}`}>
            Properties within <span className="font-bold">"{context.originalQuery}"</span>
          </p>
          <p className={`text-green-700 mt-0.5 text-xs`}>
            Found using geo-boundary search
          </p>
        </div>
        <button onClick={onClear} className="text-green-400 hover:text-green-600 text-xs flex-shrink-0 mt-0.5">Clear</button>
      </div>
    );
  }

  if (context.type === 'expanded') {
    return (
      <div className={`flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl mb-4 ${compact ? 'p-3' : 'p-4'}`}>
        <span className="text-lg flex-shrink-0">🔍</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-amber-900 ${compact ? 'text-xs' : 'text-sm'}`}>
            No results in <span className="font-bold">"{context.originalQuery}"</span>
          </p>
          <p className={`text-amber-700 mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>
            Showing properties in <span className="font-semibold">{context.expandedTo}</span> instead
          </p>
        </div>
        <button onClick={onClear} className="text-amber-400 hover:text-amber-600 text-xs flex-shrink-0 mt-0.5">
          Clear
        </button>
      </div>
    );
  }

  if (context.type === 'recommended') {
    return (
      <div className={`flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl mb-4 ${compact ? 'p-3' : 'p-4'}`}>
        <span className="text-lg flex-shrink-0">💡</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-blue-900 ${compact ? 'text-xs' : 'text-sm'}`}>
            No properties found near <span className="font-bold">"{context.originalQuery}"</span>
          </p>
          <p className={`text-blue-700 mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>
            Here are our latest listings — something might catch your eye
          </p>
        </div>
        <button onClick={onClear} className="text-blue-400 hover:text-blue-600 text-xs flex-shrink-0 mt-0.5">
          Clear
        </button>
      </div>
    );
  }

  return null;
};

export default Properties;