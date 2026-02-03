import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Navigation, Home } from 'lucide-react';

const Map = ({ 
  listings = [], 
  center = { lat: 4.0511, lng: 9.7679 }, // Douala, Cameroon
  zoom = 12,
  onMarkerClick,
  selectedListingId,
  className = '',
  showControls = true,
  height = '100%'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && listings.length > 0) {
      updateMarkers();
    }
  }, [listings, selectedListingId]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
    }).setView([center.lat, center.lng], zoom);

    // Add modern map tiles - CartoDB Positron (clean, professional look)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsLoading(false);

    // Add markers if listings exist
    if (listings.length > 0) {
      updateMarkers();
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = [];

    // Add new markers
    listings.forEach(listing => {
      if ((listing.lat && listing.lng) || listing.coordinates) {
        const lat = listing.lat || listing.coordinates.lat;
        const lng = listing.lng || listing.coordinates.lng;
        
        bounds.push([lat, lng]);

        const isSelected = listing.id === selectedListingId;
        const priceInK = listing.price ? (listing.price / 1000).toFixed(0) : 'N/A';
        
        // Create modern card-style marker
        const markerHtml = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            <!-- Price Card -->
            <div style="
              background: ${isSelected ? 'linear-gradient(135deg, #92400E 0%, #78350F 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'};
              color: white;
              padding: 8px 14px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 13px;
              box-shadow: ${isSelected ? '0 6px 20px rgba(146, 64, 14, 0.4)' : '0 4px 12px rgba(217, 119, 6, 0.3)'};
              border: 2px solid white;
              white-space: nowrap;
              transform: ${isSelected ? 'scale(1.15) translateY(-2px)' : 'scale(1)'};
              transition: all 0.3s ease;
              position: relative;
            ">
              ${priceInK}K XAF
              <!-- Arrow pointer -->
              <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
              "></div>
              <div style="
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid ${isSelected ? '#92400E' : '#D97706'};
              "></div>
            </div>
            
            <!-- Home Icon Pin -->
            <div style="
              margin-top: 2px;
              width: 32px;
              height: 32px;
              background: ${isSelected ? '#92400E' : '#D97706'};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: markerHtml,
          className: 'custom-marker-pin',
          iconSize: [80, 70],
          iconAnchor: [40, 70],
          popupAnchor: [0, -70],
        });

        const marker = window.L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current);

        // Add click event
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(listing);
          }
        });

        // Enhanced popup with image
        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-width: 280px; padding: 4px;">
            ${listing.image ? `
              <img src="${listing.image}" 
                   alt="${listing.title}" 
                   style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;"
              />
            ` : ''}
            <div style="padding: 0 4px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1F2937; line-height: 1.4;">
                ${listing.title}
              </h3>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style="font-size: 13px; color: #6B7280;">${listing.location}</span>
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #D97706; margin-bottom: 10px;">
                ${listing.price ? `${listing.price.toLocaleString()} XAF` : 'Price on request'}
              </div>
              <div style="display: flex; gap: 16px; padding-top: 10px; border-top: 1px solid #E5E7EB;">
                ${listing.bedrooms ? `
                  <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6B7280;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    ${listing.bedrooms} beds
                  </div>
                ` : ''}
                ${listing.bathrooms ? `
                  <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6B7280;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 6h11"></path>
                      <path d="M12 18h7"></path>
                      <path d="M12 18v-6"></path>
                    </svg>
                    ${listing.bathrooms} baths
                  </div>
                ` : ''}
                ${listing.area ? `
                  <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6B7280;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                    ${listing.area} m²
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup'
        });

        // Auto open popup for selected marker
        if (isSelected) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { 
        padding: [80, 80],
        maxZoom: 15
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (markersRef.current.length > 0) {
        const bounds = markersRef.current.map(marker => marker.getLatLng());
        mapInstanceRef.current.fitBounds(bounds, { 
          padding: [80, 80],
          maxZoom: 15
        });
      } else {
        mapInstanceRef.current.setView([center.lat, center.lng], zoom);
      }
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 14);
          
          // Add a temporary marker for user location
          const userMarker = window.L.marker([latitude, longitude], {
            icon: window.L.divIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3B82F6;
                  border: 4px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          }).addTo(mapInstanceRef.current);
          
          setTimeout(() => userMarker.remove(), 5000);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg z-0" />
      
      {/* Enhanced Map Controls */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all duration-200 border border-gray-200"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all duration-200 border border-gray-200"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="w-11 h-11 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all duration-200 border border-gray-200"
            aria-label="Recenter map"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* My Location */}
          <button
            onClick={handleMyLocation}
            className="w-11 h-11 bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
            aria-label="My location"
          >
            <Navigation className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center z-20">
          <div className="text-center">
            <div className="relative">
              <MapPin className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-bounce" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-amber-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-gray-700 font-medium">Loading map...</p>
            <p className="text-sm text-gray-500 mt-1">Finding properties near you</p>
          </div>
        </div>
      )}

      {/* Custom CSS for popup */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker-pin:hover > div > div:first-child {
          transform: scale(1.05) !important;
        }
      `}</style>
    </div>
  );
};

export default Map;