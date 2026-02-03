import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, MapPin, Bed, Bath, Maximize, Car, Calendar, TrendingUp, Phone, Mail, ChevronLeft, ChevronRight, Home, DollarSign, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/Button';
import Map from '../../../components/Map';

const PropertyDetails = ({ listing, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(listing?.isFavorited || false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !listing) return null;

  const images = listing.images || [listing.image] || [];
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this property: ${listing.title}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-0 lg:p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative bg-white w-full h-full lg:h-[96vh] lg:max-w-[1400px] lg:rounded-xl overflow-hidden shadow-2xl flex flex-col animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md  border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{listing.title}</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                {listing.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all active:scale-95 group"
            >
              <Share2 className="w-5 h-5 text-gray-700 group-hover:text-amber-600 transition-colors" />
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="w-11 h-11 flex items-center justify-center hover:bg-red-50 rounded-full transition-all active:scale-95"
            >
              <Heart className={`w-5 h-5 transition-all ${isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Image Gallery */}
          <div className="relative bg-gradient-to-b from-gray-900 to-black">
            <div className="relative h-72 md:h-96 lg:h-[500px]">
              <img
                src={images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-7 h-7 text-gray-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-7 h-7 text-gray-900" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-6 right-6 bg-black/75 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Property Badge */}
              <div className="absolute top-6 left-6">
                <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {listing.listingType || 'For Sale'}
                </span>
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 p-6 overflow-x-auto bg-gradient-to-b from-black to-gray-900 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all transform ${
                      idx === currentImageIndex 
                        ? 'border-amber-500 scale-105 shadow-xl' 
                        : 'border-white/20 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-[1400px] mx-auto">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8 p-4 lg:p-8">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Mobile Title */}
                <div className="md:hidden bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{listing.title}</h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    {listing.location}
                  </p>
                </div>

                {/* Price & Key Stats */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-8 h-8 text-amber-600" />
                    <div>
                      <div className="text-sm text-amber-900 font-medium">Price</div>
                      <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                        {listing.price ? `${listing.price.toLocaleString()} XAF` : 'Contact for price'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 lg:gap-6">
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Bed className="w-6 h-6 text-amber-700" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{listing.bedrooms || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Bedrooms</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bath className="w-6 h-6 text-blue-700" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{listing.bathrooms || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Bathrooms</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Maximize className="w-6 h-6 text-green-700" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{listing.area || 0}</div>
                      <div className="text-sm text-gray-600 font-medium">m²</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex px-6">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-6 font-semibold transition-all relative ${
                          activeTab === 'overview'
                            ? 'text-amber-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Overview
                        {activeTab === 'overview' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('features')}
                        className={`py-4 px-6 font-semibold transition-all relative ${
                          activeTab === 'features'
                            ? 'text-amber-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Features
                        {activeTab === 'features' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('location')}
                        className={`py-4 px-6 font-semibold transition-all relative ${
                          activeTab === 'location'
                            ? 'text-amber-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Location
                        {activeTab === 'location' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-full"></div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 lg:p-8">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">About this property</h3>
                          <p className="text-gray-700 leading-relaxed text-lg">
                            {listing.description || 'This beautiful property offers modern living in a prime location. Perfect for families or professionals looking for comfort and convenience. Features include spacious rooms, modern amenities, and excellent connectivity to key areas.'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Home className="w-6 h-6 text-amber-700" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 font-medium">Property Type</div>
                              <div className="font-bold text-gray-900 text-lg">{listing.propertyType || 'Residential'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-6 h-6 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 font-medium">Year Built</div>
                              <div className="font-bold text-gray-900 text-lg">{listing.yearBuilt || '2020'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Car className="w-6 h-6 text-green-700" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 font-medium">Parking</div>
                              <div className="font-bold text-gray-900 text-lg">{listing.parking || '2 spaces'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-6 h-6 text-purple-700" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 font-medium">Status</div>
                              <div className="font-bold text-gray-900 text-lg">{listing.listingType || 'For Sale'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'features' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">Property Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {['Air Conditioning', 'Heating System', 'Balcony', 'Garden', 'Security System', 'Modern Kitchen', 'Parking Space', 'Storage Room', 'High-Speed Internet', 'Backup Generator'].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all group">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-gray-800 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'location' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">Location & Map</h3>
                        <div className="h-72 lg:h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                          <Map
                            listings={[listing]}
                            center={{ lat: listing.lat || 4.0511, lng: listing.lng || 9.7679 }}
                            zoom={14}
                            showControls={true}
                          />
                        </div>
                        <div className="flex items-start gap-3 p-5 bg-amber-50 rounded-xl border border-amber-200">
                          <MapPin className="w-6 h-6 mt-0.5 flex-shrink-0 text-amber-700" />
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Address</div>
                            <span className="text-gray-700">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Agent Card (Sticky on desktop) */}
              <div className="lg:col-span-1 mt-6 lg:mt-0">
                <div className="sticky top-8 bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-amber-700">RC</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Ryan Crighton</h3>
                    <p className="text-sm text-gray-600 mt-1">Rothwell Gornt Companies</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Verified Agent
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md" icon={Phone}>
                      Call Agent
                    </Button>
                    <Button variant="secondary" className="w-full border-2 hover:bg-gray-50" icon={Mail}>
                      Send Message
                    </Button>
                  </div>
                  
                  <div className="text-center pt-6 border-t-2 border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Listed by</p>
                    <p className="font-bold text-gray-900">Verified Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;