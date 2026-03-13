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

// ── Normalise API row → shape PropertyCard + Map expect ──────────────────────
const normalise = (l) => ({
  ...l,
  // Map / card expect these aliases
  location:    l.address || `${l.city}`,
  type:        l.transaction_type,                         // 'rent' | 'sale'
  listingType: l.transaction_type === 'sale' ? 'For Sale' : 'For Rent',
  image:       l.cover_photo || l.photos?.[0] || '',
  images:      l.photos || [],
  isFavorited: false,
  // lat/lng already injected by backend
  lat: l.lat ?? null,
  lng: l.lng ?? null,
});

// ── Empty filters ─────────────────────────────────────────────────────────────
const EMPTY_FILTERS = {
  search:     '',
  type:       '',
  minPrice:   '',
  maxPrice:   '',
  bedrooms:   '',
  bathrooms:  '',
};

// ─────────────────────────────────────────────────────────────────────────────
const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings,   setListings]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [selectedListing,           setSelectedListing]           = useState(null);   // hovered map pin id
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null); // detail panel

  const [showFilters,       setShowFilters]       = useState(false);
  const [sheetExpanded,     setSheetExpanded]     = useState(false);
  const [currentHeight,     setCurrentHeight]     = useState(35);
  const [isDragging,        setIsDragging]        = useState(false);
  const [startY,            setStartY]            = useState(0);

  const sheetRef       = useRef(null);

  // ── Build filters from URL on mount ─────────────────────────────────────────
  const [filters, setFilters] = useState(() => ({
    search:    searchParams.get('q')           || searchParams.get('search') || '',
    type:      searchParams.get('listingType') || searchParams.get('type')   || '',
    minPrice:  searchParams.get('price_min')   || '',
    maxPrice:  searchParams.get('price_max')   || '',
    bedrooms:  searchParams.get('bedrooms')    || '',
    bathrooms: '',
  }));

  // ── Fetch listings from backend ──────────────────────────────────────────────
  const loadListings = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      // Map frontend filter keys → API param names
      const apiParams = {};
      if (params.get('search')      || params.get('q'))           apiParams.q              = params.get('search') || params.get('q');
      if (params.get('listingType') || params.get('type'))        apiParams.listingType    = params.get('listingType') || params.get('type');
      if (params.get('city'))                                      apiParams.city           = params.get('city');
      if (params.get('property_type'))                             apiParams.property_type  = params.get('property_type');
      if (params.get('price_min'))                                 apiParams.price_min      = params.get('price_min');
      if (params.get('price_max'))                                 apiParams.price_max      = params.get('price_max');
      if (params.get('bedrooms'))                                  apiParams.bedrooms       = params.get('bedrooms');
      if (params.get('neighborhood'))                              apiParams.q              = params.get('neighborhood');

      const res = await fetchProperties({ ...apiParams, limit: 50 });
      const rows = (res.data || []).map(normalise);
      setListings(rows);
      setTotal(res.total || rows.length);
    } catch (e) {
      console.error('[Properties] API error:', e.message);
      setError(`Failed to load properties: ${e.message}`);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(searchParams); }, [searchParams]);

  // ── Restore detail panel from URL ?property=id ───────────────────────────
  useEffect(() => {
    const pid = searchParams.get('property');
    if (pid && listings.length > 0) {
      const found = listings.find(l => String(l.id) === pid);
      if (found) setSelectedPropertyForDetails(found);
    }
    if (!pid) setSelectedPropertyForDetails(null);
  }, [searchParams, listings]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLocationSelect = ({ label, shortLabel, lat, lng }) => {
    const val = shortLabel || label || '';
    setFilters(prev => ({ ...prev, search: val }));
    // If Nominatim gave us coordinates, update map center immediately
    if (lat && lng) setMapCenter({ lat, lng });
    const p = new URLSearchParams(searchParams);
    if (val) p.set('search', val); else p.delete('search');
    setSearchParams(p);
  };

    const applyFilters = () => {
    const p = new URLSearchParams();
    if (filters.search)    p.set('search',    filters.search);
    if (filters.type)      p.set('listingType', filters.type);
    if (filters.minPrice)  p.set('price_min',  filters.minPrice);
    if (filters.maxPrice)  p.set('price_max',  filters.maxPrice);
    if (filters.bedrooms)  p.set('bedrooms',   filters.bedrooms);
    setSearchParams(p);
    setShowFilters(false);
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
    const deltaP = (delta / window.innerHeight) * 100;
    setCurrentHeight(h => Math.max(15, Math.min(85, h + deltaP)));
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

  // ── Map center — updated when user picks a location from LocationSearch ──
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 });

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
            {/* Location search */}
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

          {/* Apply button (desktop) */}
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

        {/* Mobile Filter Sheet */}
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
        {/* Map — left side */}
        <div className="lg:w-1/2 xl:w-3/5 relative">
          <Map
            listings={listings}
            center={mapCenter}
            onMarkerClick={handleMarkerClick}
            onViewProperty={handlePropertyClick}
            selectedListingId={selectedListing}
            height="100%"
          />
        </div>

        {/* List — right side */}
        <div className="lg:w-1/2 xl:w-2/5 overflow-y-auto bg-white">
          <div className="p-4">
            {loading ? (
              <Loader text="Finding properties…" />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <Button onClick={() => loadListings(searchParams)}>Retry</Button>
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map(listing => (
                  <div key={listing.id} id={`listing-${listing.id}`}
                    className={`transition-all ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
                    onMouseEnter={() => setSelectedListing(listing.id)}
                    onMouseLeave={() => setSelectedListing(null)}>
                    <PropertyCard listing={listing} onClick={() => handlePropertyClick(listing)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────── */}
      <div className="lg:hidden h-[calc(100vh-76px)] relative overflow-hidden">
        <Map
          listings={listings}
          center={mapCenter}
          onMarkerClick={handleMarkerClick}
          onViewProperty={handlePropertyClick}
          selectedListingId={selectedListing}
          height="100%"
        />

        {/* Draggable bottom sheet */}
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
            ) : listings.length > 0 ? (
              <div className={`grid gap-4 ${sheetExpanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {listings.map(listing => (
                  <div key={listing.id} id={`listing-${listing.id}`}
                    className={`transition-all ${selectedListing === listing.id ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}>
                    <PropertyCard listing={listing} onClick={() => handlePropertyClick(listing)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4 text-sm">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Property Detail Panel ─────────────────────────────────────── */}
      <PropertyDetails
        listing={selectedPropertyForDetails}
        isOpen={!!selectedPropertyForDetails}
        onClose={handleClosePropertyDetails}
      />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0);    }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Properties;