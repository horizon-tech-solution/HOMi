import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, MapPin, Bed, Bath, Maximize, X, Filter, Calendar } from 'lucide-react';
import UserNav from '../../components/UserNav';

const UserHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  
  const [browseHistory, setBrowseHistory] = useState([
    {
      id: 1,
      title: '2BR Apartment in Akwa',
      location: 'Akwa, Douala',
      price: 35000,
      listingType: 'For Sale',
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      type: 'sale',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      viewedAt: '2 hours ago',
      viewCount: 3
    },
    {
      id: 2,
      title: 'Studio near University',
      location: 'Ngoa-Ekelle, Yaoundé',
      price: 50000,
      listingType: 'For Rent',
      bedrooms: 1,
      bathrooms: 1,
      area: 35,
      type: 'rent',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      viewedAt: 'Yesterday',
      viewCount: 1
    },
    {
      id: 3,
      title: 'Commercial Space Downtown',
      location: 'Bonanjo, Douala',
      price: 250000,
      listingType: 'For Rent',
      bedrooms: null,
      bathrooms: 2,
      area: 150,
      type: 'rent',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      viewedAt: '3 days ago',
      viewCount: 2
    }
  ]);

  const [searchHistory, setSearchHistory] = useState([
    {
      id: 1,
      query: '2-3 bedroom apartments in Douala',
      filters: { location: 'Douala', beds: '2-3', type: 'Apartment', priceMax: '50M' },
      searchedAt: 'Today',
      resultCount: 45
    },
    {
      id: 2,
      query: 'Land for sale in Yaoundé',
      filters: { location: 'Yaoundé', type: 'Land', purpose: 'Sale' },
      searchedAt: 'Yesterday',
      resultCount: 28
    },
    {
      id: 3,
      query: 'Studio apartments under 75,000 FCFA',
      filters: { beds: 'Studio', priceMax: '75000', purpose: 'Rent' },
      searchedAt: '3 days ago',
      resultCount: 12
    },
    {
      id: 4,
      query: 'Commercial properties in Bonanjo',
      filters: { location: 'Bonanjo, Douala', type: 'Commercial' },
      searchedAt: '1 week ago',
      resultCount: 8
    }
  ]);

  const removeBrowseItem = (id) => {
    setBrowseHistory(browseHistory.filter(item => item.id !== id));
  };

  const removeSearchItem = (id) => {
    setSearchHistory(searchHistory.filter(item => item.id !== id));
  };

  const clearAllBrowse = () => {
    setBrowseHistory([]);
  };

  const clearAllSearch = () => {
    setSearchHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Your Activity
          </h1>
          <p className="text-gray-600">
            Track your property views and searches
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'browse'
                ? 'border-b-2 border-amber-600 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Browse History ({browseHistory.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'search'
                ? 'border-b-2 border-amber-600 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search History ({searchHistory.length})
            </div>
          </button>
        </div>

        {/* Browse History Tab */}
        {activeTab === 'browse' && (
          <div>
            {browseHistory.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No browse history yet</h3>
                <p className="text-gray-600 mb-6">Properties you view will appear here</p>
                <button className="px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700">
                  Start browsing
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Recently viewed properties
                  </p>
                  <button
                    onClick={clearAllBrowse}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                  {browseHistory.map((property) => (
                    <BrowseHistoryCard
                      key={property.id}
                      property={property}
                      onRemove={removeBrowseItem}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Search History Tab */}
        {activeTab === 'search' && (
          <div>
            {searchHistory.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No search history yet</h3>
                <p className="text-gray-600 mb-6">Your searches will appear here</p>
                <button className="px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700">
                  Start searching
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Your recent searches
                  </p>
                  <button
                    onClick={clearAllSearch}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  {searchHistory.map((search) => (
                    <SearchHistoryCard
                      key={search.id}
                      search={search}
                      onRemove={removeSearchItem}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BrowseHistoryCard = ({ property, onRemove }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/properties?property=${property.id}`);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-40 sm:w-48 h-40 flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
              {property.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                {property.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(property.id);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <p className="text-lg font-bold text-amber-600 mb-2">
            {property.price.toLocaleString()} <span className="text-xs font-normal">XAF</span>
            {property.type === 'rent' && <span className="text-xs font-normal text-gray-600">/mo</span>}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-700 mb-2">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {property.bathrooms}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              {property.area} sqm
            </span>
          </div>

          <div className="mt-auto pt-2 border-t flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Viewed {property.viewedAt}
              {property.viewCount > 1 && ` • ${property.viewCount} times`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchHistoryCard = ({ search, onRemove }) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h3 className="font-bold text-gray-900">{search.query}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(search.filters).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {key}: {value}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {search.searchedAt}
            </span>
            <span>{search.resultCount} results found</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onRemove(search.id)}
            className="p-2 hover:bg-gray-100 rounded transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <button className="px-3 py-2 text-amber-600 font-semibold text-sm hover:bg-amber-50 rounded-lg transition-all whitespace-nowrap">
            Search again
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;