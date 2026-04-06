// src/components/PropertyCard.jsx
import React, { useState } from 'react';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import Card from './Card';

const PropertyCard = ({ listing, onFavorite, onClick }) => {
  const [isFavorited, setIsFavorited] = useState(listing?.isFavorited || false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavorite) onFavorite(listing.id, !isFavorited);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';

  return (
    <Card hover className="overflow-hidden group" onClick={onClick}>
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={listing?.images?.[0] || listing?.image || defaultImage}
          alt={listing?.title || 'Property'}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = defaultImage; }}
        />
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {listing?.listingType || listing?.type || 'For Sale'}
          </span>
        </div>
        {/* Favourite */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-500'}`} strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <p className="text-amber-700 font-bold text-base mb-1">
          {listing?.price ? listing.price.toLocaleString() : '—'}{' '}
          <span className="text-xs font-semibold text-amber-600">XAF</span>
        </p>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-2">
          {listing?.title || 'Property Listing'}
        </h3>

        {/* Location */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-amber-600" />
          <span className="line-clamp-1">{listing?.location || listing?.address || 'Cameroon'}</span>
        </div>

        {/* Stats */}
        {(listing?.bedrooms != null || listing?.bathrooms != null || listing?.area || listing?.size) && (
          <div className="flex items-center gap-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
            {listing?.bedrooms != null && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-gray-400" />
                <span>{listing.bedrooms} bd</span>
              </div>
            )}
            {listing?.bathrooms != null && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-gray-400" />
                <span>{listing.bathrooms} ba</span>
              </div>
            )}
            {(listing?.area || listing?.size) && (
              <div className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-gray-400" />
                <span>{listing.area || listing.size} m²</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PropertyCard;