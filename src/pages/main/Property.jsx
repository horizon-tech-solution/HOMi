import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { SlidersHorizontal, Map as MapIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import PropertyDetails from './pageDetail/PropertDetails';
import Map from '../../components/Map';
import Loader from '../../components/Loader';
import Button from '../../components/Button';

const CITIES = [
  { id: 'douala', name: 'Douala', coordinates: { lat: 4.0511, lng: 9.7679 } },
  { id: 'yaounde', name: 'Yaoundé', coordinates: { lat: 3.8480, lng: 11.5021 } }
];

const LOCATIONS = [
  'Douala',
  'Yaoundé',
  'Bonanjo, Douala',
  'Akwa, Douala',
  'Bepanda, Douala',
  'Bonaberi, Douala',
  'Makepe, Douala',
  'Bonapriso, Douala',
  'Deido, Douala',
  'New Bell, Douala',
  'Bastos, Yaoundé',
  'Nlongkak, Yaoundé',
  'Melen, Yaoundé',
  'Ekounou, Yaoundé',
  'Odza, Yaoundé',
  'Centre Ville, Yaoundé',
  'Essos, Yaoundé',
  'Mvog-Mbi, Yaoundé',
];

const MOCK_LISTINGS = [
  {
    id: 1,
    title: 'Modern 3BR Apartment in Bonanjo',
    price: 75000,
    location: 'Bonanjo, Douala',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    type: 'rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502672260066-6bc36a22c340?w=600&h=400&fit=crop'
    ],
    lat: 4.0511,
    lng: 9.7579
  },
  {
    id: 2,
    title: 'Luxury Villa with Pool',
    price: 250000,
    location: 'Bastos, Yaoundé',
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    type: 'sale',
    listingType: 'For Sale',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop'
    ],
    lat: 3.8680,
    lng: 11.5221
  },
  {
    id: 3,
    title: 'Cozy Studio Apartment',
    price: 35000,
    location: 'Akwa, Douala',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    type: 'rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
    lat: 4.0611,
    lng: 9.7479
  },
  {
    id: 4,
    title: 'Spacious Family House',
    price: 180000,
    location: 'Bepanda, Douala',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    type: 'sale',
    listingType: 'For Sale',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'],
    lat: 4.0711,
    lng: 9.7679
  },
  {
    id: 5,
    title: 'Commercial Space Downtown',
    price: 120000,
    location: 'Centre Ville, Douala',
    bedrooms: 0,
    bathrooms: 2,
    area: 150,
    type: 'rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'],
    lat: 4.0411,
    lng: 9.7579
  },
  {
    id: 6,
    title: 'Garden Apartment',
    price: 65000,
    location: 'Nlongkak, Yaoundé',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    type: 'rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop'],
    lat: 3.8380,
    lng: 11.5121
  },
];

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
  const searchInputRef = useRef(null);
  const sheetRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(35);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  });

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  // Handle property ID from URL on page load/refresh
  useEffect(() => {
    const propertyId = searchParams.get('property');
    if (propertyId && listings.length > 0) {
      const property = listings.find(l => l.id.toString() === propertyId);
      if (property) {
        setSelectedPropertyForDetails(property);
      }
    }
  }, [searchParams, listings]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const propertyId = searchParams.get('property');
      if (!propertyId) {
        setSelectedPropertyForDetails(null);
      } else if (listings.length > 0) {
        const property = listings.find(l => l.id.toString() === propertyId);
        if (property) {
          setSelectedPropertyForDetails(property);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams, listings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_LISTINGS];
      
      const search = searchParams.get('search');
      const type = searchParams.get('type');
      
      if (search) {
        filtered = filtered.filter(l => 
          l.location.toLowerCase().includes(search.toLowerCase()) ||
          l.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (type) {
        filtered = filtered.filter(l => l.type === type);
      }
      
      setListings(filtered);
      setLoading(false);
    }, 1000);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'search') {
      if (value.length > 0) {
        const filtered = LOCATIONS.filter(loc => 
          loc.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLocations(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handleLocationSelect = (location) => {
    setFilters(prev => ({ ...prev, search: location }));
    setShowSuggestions(false);
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing.id);
    if (window.innerWidth < 1024) {
      setSheetExpanded(true);
      setTimeout(() => {
        const element = document.getElementById(`listing-${listing.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  const handlePropertyClick = (listing) => {
    setSelectedPropertyForDetails(listing);
    // Update URL with property ID
    const params = new URLSearchParams(searchParams);
    params.set('property', listing.id);
    navigate(`?${params.toString()}`, { replace: false });
  };

  const handleClosePropertyDetails = () => {
    setSelectedPropertyForDetails(null);
    // Remove property ID from URL
    const params = new URLSearchParams(searchParams);
    params.delete('property');
    navigate(`?${params.toString()}`, { replace: false });
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const viewportHeight = window.innerHeight;
    const deltaPercent = (deltaY / viewportHeight) * 100;
    
    let newHeight = currentHeight + deltaPercent;
    newHeight = Math.max(15, Math.min(85, newHeight));
    
    setCurrentHeight(newHeight);
    setStartY(currentY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (currentHeight < 25) {
      setCurrentHeight(15);
      setSheetExpanded(false);
    } else if (currentHeight > 55) {
      setCurrentHeight(75);
      setSheetExpanded(true);
    } else {
      setCurrentHeight(35);
      setSheetExpanded(false);
    }
  };

  const toggleSheet = () => {
    if (sheetExpanded) {
      setCurrentHeight(35);
      setSheetExpanded(false);
    } else {
      setCurrentHeight(75);
      setSheetExpanded(true);
    }
  };

  const mapCenter = filters.search && CITIES.find(c => c.name.toLowerCase().includes(filters.search.toLowerCase()))
    ? CITIES.find(c => c.name.toLowerCase().includes(filters.search.toLowerCase())).coordinates 
    : { lat: 4.0511, lng: 9.7679 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DESKTOP HEADER */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {listings.length} Properties
              </h1>
              {searchParams.toString() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brown-600 hover:text-brown-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="md:col-span-2 xl:col-span-2 relative" ref={searchInputRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search location (e.g., Douala, Bonanjo...)"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onFocus={() => filters.search && setShowSuggestions(true)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
                />
                <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {showSuggestions && filteredLocations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
                  {filteredLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full px-4 py-3 text-left hover:bg-brown-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <MapIcon className="w-4 h-4 text-brown-600 flex-shrink-0" />
                      <span className="text-gray-900">{location}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
            >
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>

            <select
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
            >
              <option value="">Baths</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white shadow-md sticky top-0 z-20 mb-4">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Douala, Bonanjo..."
                value={filters.search}
                onChange={(e) => {
                  handleFilterChange('search', e.target.value);
                  if (e.target.value) {
                    const params = new URLSearchParams();
                    params.append('search', e.target.value);
                    setSearchParams(params);
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none bg-white shadow-sm"
              />
              <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brown-600 to-brown-700 text-white rounded-full hover:from-brown-700 hover:to-brown-800 active:scale-95 transition-all shadow-lg flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-bold whitespace-nowrap">Filters</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-60 z-[9998]" 
              onClick={() => setShowFilters(false)}
            />
            
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden z-[9999] animate-slide-up shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-5 space-y-5 pb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none bg-white"
                    />
                    {showSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[10000]">
                        {filteredLocations.map((location, index) => (
                          <button
                            key={index}
                            onClick={() => handleLocationSelect(location)}
                            className="w-full px-4 py-3 text-left hover:bg-brown-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-900"
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Property Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none appearance-none bg-white text-gray-900"
                  >
                    <option value="">Buy or Rent</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Bedrooms</label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none appearance-none bg-white text-gray-900"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Bathrooms</label>
                    <select
                      value={filters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none appearance-none bg-white text-gray-900"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Price Range (XAF)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none bg-white text-gray-900"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2 -mx-5 px-5 border-t border-gray-200 mt-6">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-5 py-4 bg-white border-2 border-gray-400 text-gray-800 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-all shadow-sm text-base"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-5 py-4 bg-gradient-to-r from-brown-600 to-brown-700 text-white rounded-xl font-bold hover:from-brown-700 hover:to-brown-800 active:scale-[0.98] transition-all shadow-xl text-base"
                  >
                    Show {listings.length} Results
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex h-[calc(100vh-180px)]">
        <div className="lg:w-1/2 xl:w-3/5 relative">
          <Map
            listings={listings}
            center={mapCenter}
            onMarkerClick={handleMarkerClick}
            selectedListingId={selectedListing}
            height="100%"
          />
        </div>

        <div className="lg:w-1/2 xl:w-2/5 overflow-y-auto bg-white">
          <div className="p-4">
            {loading ? (
              <Loader text="Finding properties..." />
            ) : listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    id={`listing-${listing.id}`}
                    className={`transition-all ${
                      selectedListing === listing.id ? 'ring-2 ring-brown-500 rounded-xl' : ''
                    }`}
                    onMouseEnter={() => setSelectedListing(listing.id)}
                    onMouseLeave={() => setSelectedListing(null)}
                  >
                    <PropertyCard 
                      listing={listing}
                      onClick={() => handlePropertyClick(listing)}
                    />
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

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden h-[calc(100vh-76px)] relative overflow-hidden">
        <Map
          listings={listings}
          center={mapCenter}
          onMarkerClick={handleMarkerClick}
          selectedListingId={selectedListing}
          height="100%"
        />

        <div 
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-10"
          style={{ 
            height: `${currentHeight}vh`,
            touchAction: 'none'
          }}
        >
          <div 
            className="sticky top-0 bg-white rounded-t-3xl px-4 py-3 cursor-grab active:cursor-grabbing z-10"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleSheet}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{listings.length} properties</h3>
                  {searchParams.toString() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFilters();
                      }}
                      className="text-xs text-brown-600 hover:text-brown-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {sheetExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-60px)] px-4 pb-4">
            {loading ? (
              <Loader text="Finding properties..." />
            ) : listings.length > 0 ? (
              <div className={`grid gap-4 ${sheetExpanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    id={`listing-${listing.id}`}
                    className={`transition-all ${
                      selectedListing === listing.id ? 'ring-2 ring-brown-500 rounded-xl' : ''
                    }`}
                  >
                    <PropertyCard 
                      listing={listing}
                      onClick={() => handlePropertyClick(listing)}
                    />
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

      {/* Property Details Modal */}
      <PropertyDetails
        listing={selectedPropertyForDetails}
        isOpen={!!selectedPropertyForDetails}
        onClose={handleClosePropertyDetails}
      />

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Properties;