// src/pages/public/Properties.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
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
  search: '', type: '', minPrice: '', maxPrice: '',
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

  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 });
  const [mapZoom,   setMapZoom]   = useState(13);
  const [locationBbox, setLocationBbox] = useState(null);

  const sheetRef = useRef(null);

  const [filters, setFilters] = useState(() => ({
    search:   searchParams.get('search') || searchParams.get('q') || '',
    type:     searchParams.get('listingType') || searchParams.get('type') || '',
    minPrice: searchParams.get('price_min') || '',
    maxPrice: searchParams.get('price_max') || '',
  }));

  const [searchContext, setSearchContext] = useState(null);

  const loadListings = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const loc = params.get('search') || params.get('q') || params.get('city') || params.get('neighborhood');
      const tx        = params.get('listingType') || params.get('type');
      const price_min = params.get('price_min');
      const price_max = params.get('price_max');
      const lat_min   = params.get('lat_min');
      const lat_max   = params.get('lat_max');
      const lng_min   = params.get('lng_min');
      const lng_max   = params.get('lng_max');

      const baseParams = {};
      if (tx)        baseParams.listingType = tx;
      if (price_min) baseParams.price_min   = price_min;
      if (price_max) baseParams.price_max   = price_max;

      if (loc) {
        const res1 = await fetchProperties({ ...baseParams, search: loc, limit: 50 });
        const rows1 = (res1.data || []).map(normalise);
        if (rows1.length > 0) {
          setListings(rows1); setTotal(res1.total || rows1.length);
          setSearchContext({ type: 'exact', originalQuery: loc }); return;
        }

        if (lat_min && lat_max && lng_min && lng_max) {
          const res2 = await fetchProperties({ ...baseParams, lat_min, lat_max, lng_min, lng_max, limit: 50 });
          const rows2 = (res2.data || []).map(normalise);
          if (rows2.length > 0) {
            setListings(rows2); setTotal(res2.total || rows2.length);
            setSearchContext({ type: 'bbox', originalQuery: loc }); return;
          }
        }

        const broadLoc = loc.split(/[,\s]+/)[0];
        if (broadLoc && broadLoc !== loc) {
          const res3 = await fetchProperties({ ...baseParams, search: broadLoc, limit: 50 });
          const rows3 = (res3.data || []).map(normalise);
          if (rows3.length > 0) {
            setListings(rows3); setTotal(res3.total || rows3.length);
            setSearchContext({ type: 'expanded', originalQuery: loc, expandedTo: broadLoc }); return;
          }
        }

        const res4 = await fetchProperties({ ...baseParams, limit: 50 });
        const rows4 = (res4.data || []).map(normalise);
        setListings(rows4); setTotal(res4.total || rows4.length);
        setSearchContext({ type: 'recommended', originalQuery: loc }); return;
      }

      const res = await fetchProperties({ ...baseParams, limit: 50 });
      const rows = (res.data || []).map(normalise);
      setListings(rows); setTotal(res.total || rows.length);
      setSearchContext(null);

    } catch (e) {
      setError(`Failed to load: ${e.message}`);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(searchParams); }, [searchParams]);

  useEffect(() => {
    const pid = searchParams.get('property');
    if (pid && listings.length > 0) {
      const found = listings.find(l => String(l.id) === pid);
      if (found) setSelectedPropertyForDetails(found);
    }
    if (!pid) setSelectedPropertyForDetails(null);
  }, [searchParams, listings]);

  const handleFilterChange = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleLocationSelect = async ({ label, shortLabel, lat, lng }) => {
    const val = shortLabel || label || '';
    setFilters(prev => ({ ...prev, search: val }));
    if (lat && lng) { setMapCenter({ lat, lng }); setMapZoom(14); }

    const p = new URLSearchParams();
    if (val) p.set('search', val);
    const cur = new URLSearchParams(searchParams);
    if (cur.get('listingType')) p.set('listingType', cur.get('listingType'));
    if (cur.get('price_min'))   p.set('price_min',   cur.get('price_min'));
    if (cur.get('price_max'))   p.set('price_max',   cur.get('price_max'));

    try {
      const q   = encodeURIComponent(val + ' Cameroon');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.[0]?.boundingbox) {
        const [latMin, latMax, lngMin, lngMax] = data[0].boundingbox;
        p.set('lat_min', latMin); p.set('lat_max', latMax);
        p.set('lng_min', lngMin); p.set('lng_max', lngMax);
        setLocationBbox({ lat_min: latMin, lat_max: latMax, lng_min: lngMin, lng_max: lngMax });
      }
    } catch {}
    setSearchParams(p);
  };

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (filters.search)   p.set('search',      filters.search);
    if (filters.type)     p.set('listingType', filters.type);
    if (filters.minPrice) p.set('price_min',   filters.minPrice);
    if (filters.maxPrice) p.set('price_max',   filters.maxPrice);
    setSearchParams(p);
    setShowFilters(false);
    try {
      const criteria = {};
      if (filters.search)   criteria.q           = filters.search;
      if (filters.type)     criteria.listingType = filters.type;
      if (filters.minPrice) criteria.price_min   = filters.minPrice;
      if (filters.maxPrice) criteria.price_max   = filters.maxPrice;
      if (Object.keys(criteria).length) recordSearch(criteria).catch(() => {});
    } catch {}
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchParams(new URLSearchParams());
  };

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
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">

          {/* Top row: title + result count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {loading ? 'Loading…' : `${total} Properties`}
              </h1>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium border border-amber-200 bg-amber-50 px-2 py-1 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Search bar row */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">

            {/* Location — takes most space */}
            <div className="flex-1 min-w-0">
              <LocationSearch
                value={filters.search}
                onChange={val => handleFilterChange('search', val)}
                onSelect={handleLocationSelect}
                placeholder="City or neighbourhood…"
                inputClassName="bg-transparent border-0 focus:ring-0 py-2 text-sm"
              />
            </div>

            <div className="w-px h-8 bg-gray-300 flex-shrink-0" />

            {/* Sale / Rent */}
            <select
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
              className="bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 py-2 px-3 cursor-pointer flex-shrink-0 min-w-[110px]"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <div className="w-px h-8 bg-gray-300 flex-shrink-0" />

            {/* Price range */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={e => handleFilterChange('minPrice', e.target.value)}
                className="w-28 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 py-2 px-2 placeholder-gray-400"
              />
              <span className="text-gray-300 text-sm">–</span>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)}
                className="w-28 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 py-2 px-2 placeholder-gray-400"
              />
            </div>

            {/* Search button */}
            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

        </div>
      </div>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <LocationSearch
                value={filters.search}
                onChange={val => handleFilterChange('search', val)}
                onSelect={handleLocationSelect}
                placeholder="Search Douala, Bafoussam…"
                inputClassName="rounded-xl border border-gray-200 shadow-sm text-sm py-2.5"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white rounded-xl active:scale-95 transition-all shadow-md flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold">Filter</span>
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[9999] animate-slide-up shadow-2xl">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 pt-1">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="px-5 pb-6 space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                  <LocationSearch
                    value={filters.search}
                    onChange={val => handleFilterChange('search', val)}
                    onSelect={handleLocationSelect}
                    placeholder="Any city or neighbourhood…"
                    inputClassName="border border-gray-200 rounded-xl py-3 text-sm"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Listing Type</label>
                  <div className="flex gap-2">
                    {['', 'sale', 'rent'].map(val => (
                      <button
                        key={val}
                        onClick={() => handleFilterChange('type', val)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          filters.type === val
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        {val === '' ? 'Any' : val === 'sale' ? 'For Sale' : 'For Rent'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price Range (XAF)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={e => handleFilterChange('minPrice', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                    <span className="text-gray-300 font-medium">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={e => handleFilterChange('maxPrice', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-[2] py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 active:scale-[0.98] transition-all shadow-lg"
                  >
                    Show {total} Results
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex h-[calc(100vh-153px)]">

        {/* Map — left side */}
        <div className="w-[55%] flex-shrink-0 relative">
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

        {/* Cards — right side, fixed-width scroll container */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white border-l border-gray-100">
          <div className="p-4">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <Button onClick={() => loadListings(searchParams)}>Retry</Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🏠</p>
                <p className="text-gray-600 font-medium">No properties found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-4 text-amber-600 text-sm font-medium underline">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <SearchContextBanner context={searchContext} onClear={clearFilters} />
                {/* Single-column grid so cards don't overflow the panel */}
                <div className="grid grid-cols-1 gap-3">
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      id={`listing-${listing.id}`}
                      className={`transition-all duration-150 ${
                        selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''
                      }`}
                      onMouseEnter={() => setSelectedListing(listing.id)}
                      onMouseLeave={() => setSelectedListing(null)}
                    >
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
      <div className="lg:hidden h-[calc(100vh-68px)] relative overflow-hidden">
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

        {/* Bottom sheet */}
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-[height] duration-300 ease-out z-10"
          style={{ height: `${currentHeight}vh`, touchAction: 'none' }}
        >
          {/* Drag handle + header */}
          <div
            className="sticky top-0 bg-white rounded-t-2xl px-4 pt-3 pb-3 cursor-grab active:cursor-grabbing z-10 border-b border-gray-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleSheet}
          >
            <div className="flex justify-center mb-2.5">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">
                  {loading ? 'Loading…' : `${listings.length} properties`}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={e => { e.stopPropagation(); clearFilters(); }}
                    className="text-xs text-amber-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              {sheetExpanded
                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                : <ChevronUp   className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto h-[calc(100%-70px)] px-4 py-3">
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
                <div className="grid grid-cols-1 gap-3 pb-4">
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      id={`listing-${listing.id}`}
                      className={`transition-all ${
                        selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''
                      }`}
                    >
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
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
};

// ── Smart search context banner ───────────────────────────────────────────────
const SearchContextBanner = ({ context, onClear, compact = false }) => {
  if (!context) return null;

  const configs = {
    bbox:        { bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-900',  sub: 'text-green-700',  btn: 'text-green-400 hover:text-green-600', icon: '📍', title: (c) => `Properties within "${c.originalQuery}"`, sub: () => 'Showing results by geo-boundary' },
    expanded:    { bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-900',  sub: 'text-amber-700',  btn: 'text-amber-400 hover:text-amber-600', icon: '🔍', title: (c) => `No results in "${c.originalQuery}"`, sub: (c) => `Showing results in ${c.expandedTo} instead` },
    recommended: { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-900',   sub: 'text-blue-700',   btn: 'text-blue-400 hover:text-blue-600',   icon: '💡', title: (c) => `No properties near "${c.originalQuery}"`, sub: () => 'Here are our latest listings' },
  };

  const cfg = configs[context.type];
  if (!cfg) return null;

  return (
    <div className={`flex items-start gap-2.5 ${cfg.bg} border ${cfg.border} rounded-xl mb-3 ${compact ? 'p-3' : 'p-3.5'}`}>
      <span className="text-base flex-shrink-0">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${cfg.text} ${compact ? 'text-xs' : 'text-sm'}`}>{cfg.title(context)}</p>
        <p className={`${cfg.sub} mt-0.5 text-xs`}>{cfg.sub(context)}</p>
      </div>
      <button onClick={onClear} className={`${cfg.btn} text-xs flex-shrink-0 mt-0.5 transition-colors`}>Clear</button>
    </div>
  );
};

export default Properties;