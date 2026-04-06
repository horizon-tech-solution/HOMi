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
import emptyStateImg   from '../../assets/images/empty-state.svg';
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

const EMPTY_FILTERS = { search: '', type: '', minPrice: '', maxPrice: '' };

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ context, onClear }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <img src={emptyStateImg} alt="No properties found" className="w-48 h-48 mb-5 opacity-90" />
    <h3 className="text-gray-800 font-bold text-lg mb-1">
      {context?.originalQuery
        ? `No results for "${context.originalQuery}"`
        : 'No properties found'}
    </h3>
    <p className="text-gray-400 text-sm mb-5 max-w-xs">
      Try searching a different area or adjusting your filters.
    </p>
    {onClear && (
      <button
        onClick={onClear}
        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        Clear filters
      </button>
    )}
  </div>
);

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
  const [, setLocationBbox]       = useState(null);
  const [searchContext, setSearchContext] = useState(null);

  const sheetRef = useRef(null);

  const [filters, setFilters] = useState(() => ({
    search:   searchParams.get('search') || searchParams.get('q') || '',
    type:     searchParams.get('listingType') || searchParams.get('type') || '',
    minPrice: searchParams.get('price_min') || '',
    maxPrice: searchParams.get('price_max') || '',
  }));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const loadListings = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const loc       = params.get('search') || params.get('q') || params.get('city') || params.get('neighborhood');
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
        const res1  = await fetchProperties({ ...baseParams, search: loc, limit: 50 });
        const rows1 = (res1.data || []).map(normalise);
        if (rows1.length > 0) {
          setListings(rows1); setTotal(res1.total || rows1.length);
          setSearchContext({ type: 'exact', originalQuery: loc }); return;
        }

        if (lat_min && lat_max && lng_min && lng_max) {
          const res2  = await fetchProperties({ ...baseParams, lat_min, lat_max, lng_min, lng_max, limit: 50 });
          const rows2 = (res2.data || []).map(normalise);
          if (rows2.length > 0) {
            setListings(rows2); setTotal(res2.total || rows2.length);
            setSearchContext({ type: 'bbox', originalQuery: loc }); return;
          }
        }

        const broadLoc = loc.split(/[,\s]+/)[0];
        if (broadLoc && broadLoc !== loc) {
          const res3  = await fetchProperties({ ...baseParams, search: broadLoc, limit: 50 });
          const rows3 = (res3.data || []).map(normalise);
          if (rows3.length > 0) {
            setListings(rows3); setTotal(res3.total || rows3.length);
            setSearchContext({ type: 'expanded', originalQuery: loc, expandedTo: broadLoc }); return;
          }
        }

        // Nothing found
        setListings([]); setTotal(0);
        setSearchContext({ type: 'none', originalQuery: loc }); return;
      }

      const res  = await fetchProperties({ ...baseParams, limit: 50 });
      const rows = (res.data || []).map(normalise);
      setListings(rows); setTotal(res.total || rows.length);
      setSearchContext(null);

    } catch (e) {
      setError(e.message);
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleLocationSelect = async ({ label, shortLabel, lat, lng }) => {
    const val = shortLabel || label || '';
    setFilters(prev => ({ ...prev, search: val }));
    if (lat && lng) { setMapCenter({ lat, lng }); setMapZoom(14); }

    const p   = new URLSearchParams();
    if (val) p.set('search', val);
    const cur = new URLSearchParams(searchParams);
    if (cur.get('listingType')) p.set('listingType', cur.get('listingType'));
    if (cur.get('price_min'))   p.set('price_min',   cur.get('price_min'));
    if (cur.get('price_max'))   p.set('price_max',   cur.get('price_max'));

    try {
      const q    = encodeURIComponent(val + ' Cameroon');
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, { headers: { 'Accept-Language': 'en' } });
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

  const clearFilters = () => { setFilters(EMPTY_FILTERS); setSearchParams(new URLSearchParams()); };

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing.id);
    if (window.innerWidth < 1024) {
      setSheetExpanded(true);
      setTimeout(() => document.getElementById(`listing-${listing.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
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
  const showEmpty        = !loading && (!!error || listings.length === 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── DESKTOP HEADER ─────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">

          {/* Count + clear */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              {loading ? 'Loading…' : `${total} Propert${total === 1 ? 'y' : 'ies'}`}
            </h1>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-full transition-colors"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {/* ── Unified search bar ── */}
          <div className="flex items-stretch bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-[60px]">

            {/* Location */}
            <div className="flex flex-col justify-center flex-1 min-w-0 px-4 border-r border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</span>
              <LocationSearch
                value={filters.search}
                onChange={val => handleFilterChange('search', val)}
                onSelect={handleLocationSelect}
                placeholder="City or neighbourhood…"
                inputClassName="bg-transparent border-0 focus:ring-0 p-0 text-sm text-gray-800 placeholder-gray-400 leading-none"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col justify-center px-4 border-r border-gray-100 flex-shrink-0 min-w-[140px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Listing type</span>
              <select
                value={filters.type}
                onChange={e => handleFilterChange('type', e.target.value)}
                className="bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-800 p-0 cursor-pointer leading-none"
              >
                <option value="">Buy or Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Price */}
            <div className="flex flex-col justify-center px-4 border-r border-gray-100 flex-shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Price (XAF)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number" placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                  className="w-24 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-800 p-0 placeholder-gray-400 leading-none"
                />
                <span className="text-gray-300 text-xs">–</span>
                <input
                  type="number" placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  className="w-24 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-800 p-0 placeholder-gray-400 leading-none"
                />
              </div>
            </div>

            {/* Search CTA */}
            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-7 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

        </div>
      </div>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <LocationSearch
              value={filters.search}
              onChange={val => handleFilterChange('search', val)}
              onSelect={handleLocationSelect}
              placeholder="Search Douala, Bafoussam…"
              inputClassName="rounded-xl border border-gray-200 text-sm py-2.5"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-semibold">Filter</span>
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[9999] animate-slide-up shadow-2xl">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 pt-1">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="px-5 pb-8 space-y-4">
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
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Listing Type</label>
                  <div className="flex gap-2">
                    {['', 'sale', 'rent'].map(val => (
                      <button key={val} onClick={() => handleFilterChange('type', val)}
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
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price Range (XAF)</label>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={e => handleFilterChange('minPrice', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400" />
                    <span className="text-gray-300">–</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={e => handleFilterChange('maxPrice', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={clearFilters}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm">
                    Clear
                  </button>
                  <button onClick={applyFilters}
                    className="flex-[2] py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 active:scale-[0.98] shadow-lg">
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

        {/* Map */}
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

        {/* Listings panel */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50 border-l border-gray-100">
          <div className="p-4">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : showEmpty ? (
              <EmptyState context={searchContext} onClear={hasActiveFilters ? clearFilters : null} />
            ) : (
              <>
                <SearchContextBanner context={searchContext} onClear={clearFilters} />
                {/* ── 2-col card grid ── */}
                <div className="grid grid-cols-2 gap-3">
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      id={`listing-${listing.id}`}
                      className={`transition-all duration-150 ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
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

        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-[height] duration-300 ease-out z-10"
          style={{ height: `${currentHeight}vh`, touchAction: 'none' }}
        >
          <div
            className="sticky top-0 bg-white rounded-t-2xl px-4 pt-3 pb-3 cursor-grab active:cursor-grabbing z-10 border-b border-gray-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleSheet}
          >
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">
                  {loading ? 'Loading…' : `${listings.length} propert${listings.length === 1 ? 'y' : 'ies'}`}
                </span>
                {hasActiveFilters && (
                  <button onClick={e => { e.stopPropagation(); clearFilters(); }} className="text-xs text-amber-600 font-medium">
                    Clear
                  </button>
                )}
              </div>
              {sheetExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-68px)] px-3 py-3">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : showEmpty ? (
              <EmptyState context={searchContext} onClear={hasActiveFilters ? clearFilters : null} />
            ) : (
              <>
                <SearchContextBanner context={searchContext} onClear={clearFilters} compact />
                {/* 2-col when expanded, 1-col when peeking */}
                <div className={`grid gap-3 pb-4 ${sheetExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      id={`listing-${listing.id}`}
                      className={`transition-all ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
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

// ── Search context banner ─────────────────────────────────────────────────────
const SearchContextBanner = ({ context, onClear, compact = false }) => {
  if (!context || context.type === 'exact' || context.type === 'none') return null;

  const configs = {
    bbox:        { bg: 'bg-green-50 border-green-100', text: 'text-green-900', sub: 'text-green-700', btn: 'text-green-500', icon: '📍', title: c => `Near "${c.originalQuery}"`,              desc: () => 'Showing results by geo-boundary'   },
    expanded:    { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-900', sub: 'text-amber-700', btn: 'text-amber-500', icon: '🔍', title: c => `No results in "${c.originalQuery}"`,    desc: c => `Showing in ${c.expandedTo} instead` },
    recommended: { bg: 'bg-blue-50 border-blue-100',   text: 'text-blue-900',  sub: 'text-blue-700',  btn: 'text-blue-500',  icon: '💡', title: c => `Nothing near "${c.originalQuery}"`,    desc: () => 'Here are our latest listings'      },
  };

  const cfg = configs[context.type];
  if (!cfg) return null;

  return (
    <div className={`flex items-start gap-2.5 ${cfg.bg} border rounded-xl mb-3 ${compact ? 'p-3' : 'p-3.5'}`}>
      <span className="text-base flex-shrink-0">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${cfg.text} ${compact ? 'text-xs' : 'text-sm'}`}>{cfg.title(context)}</p>
        <p className={`${cfg.sub} mt-0.5 text-xs`}>{cfg.desc(context)}</p>
      </div>
      <button onClick={onClear} className={`${cfg.btn} text-xs flex-shrink-0 transition-colors`}>Clear</button>
    </div>
  );
};

export default Properties;