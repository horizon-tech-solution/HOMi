import React, { useState } from 'react';
import { MapPin, Heart, Share2, Bed, Bath, Maximize } from 'lucide-react';
import Card from './Card';

const PropertyCard = ({ listing, onFavorite, onShare, onClick }) => {
  const [isFavorited, setIsFavorited] = useState(listing?.isFavorited || false);
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite(listing.id, !isFavorited);
    }
  };
  
  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare(listing);
    }
  };
  
  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
  
  return (
    <Card hover className="overflow-hidden" onClick={onClick}>
      <div className="relative">
        <img
          src={listing?.images?.[0] || listing?.image || defaultImage}
          alt={listing?.title || 'Property'}
          className="w-full h-56 object-cover"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        
        <div className="absolute top-4 left-4">
          <span className="bg-amber-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            {listing?.listingType || listing?.type || 'For Sale'}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg backdrop-blur-sm"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
          <button
            onClick={handleShareClick}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg backdrop-blur-sm"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
            {listing?.title || 'Modern Apartment'}
          </h3>
          <div className="text-xl font-bold text-amber-700 whitespace-nowrap">
            {listing?.price ? `${listing.price.toLocaleString()}` : '50,000'} <span className="text-sm">XAF</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-amber-700" />
          <span className="line-clamp-1 font-medium">
            {listing?.location || listing?.address || 'Douala, Cameroon'}
          </span>
        </div>
        
        <div className="flex items-center gap-5 text-sm text-gray-700 border-t border-gray-200 pt-4">
          {(listing?.bedrooms || listing?.bedrooms === 0) && (
            <div className="flex items-center font-medium">
              <Bed className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>{listing.bedrooms} Beds</span>
            </div>
          )}
          {(listing?.bathrooms || listing?.bathrooms === 0) && (
            <div className="flex items-center font-medium">
              <Bath className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>{listing.bathrooms} Baths</span>
            </div>
          )}
          {(listing?.area || listing?.size) && (
            <div className="flex items-center font-medium">
              <Maximize className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>{listing.area || listing.size} m²</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;