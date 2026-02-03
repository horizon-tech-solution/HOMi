import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, Trash2 } from 'lucide-react';
import UserNav from '../../components/UserNav';
import PropertyDetails from '../main/pageDetail/PropertDetails';

const UserFav = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: 'Modern 3BR Apartment in Bonanjo',
      location: 'Bonanjo, Douala',
      price: 75000,
      listingType: 'For Sale',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'sale',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
      ],
      savedDate: '2 days ago',
      lat: 4.0511,
      lng: 9.7579
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool',
      location: 'Bastos, Yaoundé',
      price: 150000,
      listingType: 'For Rent',
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      type: 'rent',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      savedDate: '1 week ago',
      lat: 3.8680,
      lng: 11.5221
    },
    {
      id: 3,
      title: 'Commercial Land Plot',
      location: 'Bonapriso, Douala',
      price: 25000000,
      listingType: 'For Sale',
      bedrooms: null,
      bathrooms: null,
      area: 500,
      type: 'sale',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      savedDate: '3 weeks ago',
      lat: 4.0411,
      lng: 9.7479
    }
  ]);

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const handleCloseDetails = () => {
    setSelectedProperty(null);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
      <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6 sm:mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* House 1 */}
          <g>
            <circle cx="60" cy="100" r="35" fill="#FEF3C7" opacity="0.3"/>
            <rect x="40" y="90" width="40" height="45" fill="#3B82F6" rx="2"/>
            <polygon points="35,90 60,70 85,90" fill="#2563EB"/>
            <rect x="50" y="100" width="8" height="10" fill="#FCD34D"/>
            <rect x="65" y="100" width="8" height="10" fill="#FCD34D"/>
            <rect x="55" y="115" width="10" height="20" fill="#1E40AF"/>
          </g>
          
          {/* Building */}
          <g>
            <circle cx="120" cy="80" r="30" fill="#FEF3C7" opacity="0.3"/>
            <rect x="105" y="60" width="30" height="75" fill="#3B82F6" rx="2"/>
            <rect x="110" y="70" width="6" height="8" fill="#93C5FD"/>
            <rect x="119" y="70" width="6" height="8" fill="#93C5FD"/>
            <rect x="110" y="82" width="6" height="8" fill="#93C5FD"/>
            <rect x="119" y="82" width="6" height="8" fill="#93C5FD"/>
            <rect x="110" y="94" width="6" height="8" fill="#93C5FD"/>
            <rect x="119" y="94" width="6" height="8" fill="#93C5FD"/>
            <rect x="110" y="106" width="6" height="8" fill="#93C5FD"/>
            <rect x="119" y="106" width="6" height="8" fill="#93C5FD"/>
            <rect x="115" y="120" width="10" height="15" fill="#1E40AF"/>
          </g>
          
          {/* House 2 */}
          <g>
            <circle cx="165" cy="110" r="30" fill="#FEF3C7" opacity="0.3"/>
            <rect x="150" y="100" width="30" height="35" fill="#F59E0B" rx="2"/>
            <polygon points="145,100 165,85 185,100" fill="#D97706"/>
            <rect x="157" y="108" width="6" height="8" fill="#FCD34D"/>
            <rect x="167" y="108" width="6" height="8" fill="#FCD34D"/>
            <rect x="160" y="120" width="8" height="15" fill="#92400E"/>
          </g>
        </svg>
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
        Save homes for safe keeping
      </h2>
      <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 text-center max-w-md">
        Whenever you find homes you like, select the <Heart className="w-5 h-5 inline text-red-500" /> to save them here.
      </p>
      <button className="px-6 sm:px-8 py-3 sm:py-4 bg-amber-600 text-white rounded-full font-bold text-base sm:text-lg hover:bg-amber-700 transition-all">
        Search for homes
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  My Favorites
                </h1>
                <p className="text-gray-600">{favorites.length} saved properties</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="recent">Recently saved</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="beds">Bedrooms</option>
                </select>

                {/* View Toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="3" y="3" width="6" height="6" rx="1"/>
                      <rect x="11" y="3" width="6" height="6" rx="1"/>
                      <rect x="3" y="11" width="6" height="6" rx="1"/>
                      <rect x="11" y="11" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="3" y="4" width="14" height="2" rx="1"/>
                      <rect x="3" y="9" width="14" height="2" rx="1"/>
                      <rect x="3" y="14" width="14" height="2" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {favorites.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onRemove={removeFavorite}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Details Modal */}
      <PropertyDetails
        listing={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

const PropertyCard = ({ property, onRemove, viewMode }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate to properties page with this property ID
    navigate(`/properties?property=${property.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => onRemove(property.id)}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all group"
            >
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </button>
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                {property.type}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                <p className="text-gray-600 flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">
                  {property.price} <span className="text-sm font-normal">FCFA</span>
                  {property.type === 'For Rent' && <span className="text-sm font-normal text-gray-600">/mo</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-700 mb-3">
              {property.beds && (
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {property.beds} beds
                </span>
              )}
              {property.baths && (
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.baths} baths
                </span>
              )}
              <span className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                {property.size}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <p className="text-sm text-gray-500">Saved {property.savedDate}</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-amber-600 font-semibold hover:bg-amber-50 rounded-lg transition-all">
                  View details
                </button>
                <button 
                  onClick={() => onRemove(property.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(property.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
        >
          <Heart className="w-5 h-5 text-red-500 fill-current" />
        </button>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
            {property.listingType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-2xl font-bold text-amber-600 mb-2">
          {property.price.toLocaleString()} <span className="text-sm font-normal">XAF</span>
          {property.type === 'rent' && <span className="text-sm font-normal text-gray-600">/mo</span>}
        </p>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <p className="text-gray-600 flex items-center gap-1 text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          {property.location}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-700 mb-3 pb-3 border-b">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            {property.area} sqm
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Saved {property.savedDate}</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(property.id);
            }}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFav;