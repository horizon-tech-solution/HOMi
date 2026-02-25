import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, MapPin, Bed, Bath,
  Maximize, Share2, Heart, Phone, Mail, CheckCircle2,
  Calendar, Car, TrendingUp, Home, DollarSign
} from 'lucide-react';
import Map from '../../../components/Map';

// ─── PropertyDetails ──────────────────────────────────────────────────────────
//  Props: listing (object|null), isOpen (bool), onClose (fn)
//
//  Renders as a full-screen modal (mobile) / wide right-side panel (desktop).
//  Animates in from the right on open, slides out on close.
// ─────────────────────────────────────────────────────────────────────────────
const PropertyDetails = ({ listing, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited,       setIsFavorited]       = useState(false);
  const [activeTab,         setActiveTab]         = useState('overview');
  const [mounted,           setMounted]           = useState(false);   // controls CSS transition

  // ── Reset state whenever a new property opens ────────────────────────────
  useEffect(() => {
    if (isOpen && listing) {
      setCurrentImageIndex(0);
      setActiveTab('overview');
      setIsFavorited(listing.isFavorited || false);
      // Tiny delay so the "closed" state is painted before we add the "open" class
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    } else {
      setMounted(false);
    }
  }, [isOpen, listing?.id]);

  // ── Lock body scroll while open ──────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Keyboard: Escape to close, arrows for gallery ────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prevImage();
      if (e.key === 'ArrowRight')  nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, currentImageIndex]);

  if (!listing) return null;

  const images = (listing.images?.length ? listing.images : [listing.image]).filter(Boolean);

  const prevImage = () => setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // ── Close with animation ─────────────────────────────────────────────────
  const handleClose = () => {
    setMounted(false);
    // Wait for transition to finish before notifying parent
    setTimeout(onClose, 320);
  };

  const FEATURES = [
    'Air Conditioning', 'Backup Generator', 'Balcony / Terrace',
    'Secure Parking', '24h Security', 'Modern Kitchen',
    'High-Speed Internet', 'Storage Room', 'Garden / Green Space',
    'Water Tank',
  ];

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: mounted ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {/*
        Mobile  : full-screen, slides up from bottom
        Desktop : right-side drawer, fixed width, slides in from right
      */}
      <div
        className="
          fixed z-[9999] bg-white flex flex-col
          inset-0
          lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[780px] xl:w-[900px]
          lg:shadow-[-24px_0_60px_rgba(0,0,0,0.18)]
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        "
        style={{
          transform: mounted
            ? 'translate(0,0)'
            : window.innerWidth >= 1024
              ? 'translateX(100%)'
              : 'translateY(100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={listing.title}
      >
        {/* ── Fixed Header ───────────────────────────────────────────────── */}
        <div className="flex-none flex items-center justify-between px-4 lg:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10">
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex-1 mx-4 hidden sm:block overflow-hidden">
            <p className="font-semibold text-gray-900 truncate leading-tight">{listing.title}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
              {listing.location}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFavorited(f => !f)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
            >
              <Heart className={`w-4 h-4 transition-all duration-200 ${isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Image Gallery ─────────────────────────────────────────────── */}
          <div className="relative bg-gray-900 select-none">
            <div className="relative h-64 sm:h-80 lg:h-[360px]">
              {/* Main image */}
              <img
                key={images[currentImageIndex]}
                src={images[currentImageIndex]}
                alt={`${listing.title} — photo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                style={{ animation: 'fadeImg 0.25s ease' }}
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Listing type badge */}
              <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                {listing.listingType || 'For Sale'}
              </span>

              {/* Counter */}
              <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </span>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 bg-gray-900 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-amber-500 scale-105'
                        : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Content grid ─────────────────────────────────────────────── */}
          <div className="p-4 lg:p-6 space-y-5">

            {/* Mobile title */}
            <div className="sm:hidden">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />{listing.location}
              </p>
            </div>

            {/* ── Price + Stats card ───────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-amber-700">
                  {listing.price ? listing.price.toLocaleString() : '—'}
                </span>
                <span className="text-lg font-semibold text-amber-600">XAF</span>
                {listing.listingType === 'For Rent' && (
                  <span className="text-sm text-amber-500 font-medium">/ month</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Bed,      value: listing.bedrooms  || 0, label: 'Beds',   color: 'bg-amber-100 text-amber-700' },
                  { Icon: Bath,     value: listing.bathrooms || 0, label: 'Baths',  color: 'bg-blue-100   text-blue-700'  },
                  { Icon: Maximize, value: listing.area      || 0, label: 'm²',     color: 'bg-green-100  text-green-700' },
                ].map(({ Icon, value, label, color }) => (
                  <div key={label} className="text-center bg-white rounded-xl p-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-gray-100 bg-gray-50/60">
                {['overview', 'features', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-semibold capitalize relative transition-colors ${
                      activeTab === tab ? 'text-amber-700' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5">

                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-2">About this property</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {listing.description ||
                          `This ${listing.bedrooms ? listing.bedrooms + '-bedroom' : ''} property in ${listing.location} offers modern living in a prime location. Perfect for ${listing.type === 'rent' ? 'tenants' : 'buyers'} looking for comfort and convenience with excellent connectivity to key areas of the city.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { Icon: Home,       color: 'bg-amber-100 text-amber-700',  label: 'Property Type', value: listing.propertyType || 'Residential' },
                        { Icon: Calendar,   color: 'bg-blue-100   text-blue-700',  label: 'Year Built',    value: listing.yearBuilt    || '2020'         },
                        { Icon: Car,        color: 'bg-green-100  text-green-700', label: 'Parking',       value: listing.parking      || '1–2 spaces'   },
                        { Icon: TrendingUp, color: 'bg-purple-100 text-purple-700',label: 'Status',        value: listing.listingType  || 'Available'    },
                      ].map(({ Icon, color, label, value }) => (
                        <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors">
                          <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                            <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900">Included Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FEATURES.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition-colors group"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900">Location</h3>

                    {/* Mini map */}
                    <div className="h-56 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <Map
                        listings={[listing]}
                        center={{ lat: listing.lat || 4.0511, lng: listing.lng || 9.7679 }}
                        zoom={15}
                        showControls={false}
                        height="100%"
                      />
                    </div>

                    {/* Address pill */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-0.5">Address</p>
                        <p className="text-sm text-gray-700">{listing.location}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Agent Card ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Listed by</p>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-xl font-extrabold text-amber-700">HR</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Homi Realty</p>
                  <p className="text-sm text-gray-500">Licensed Real Estate Agent</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+237699000000"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <a
                  href={`https://wa.me/237699000000?text=${encodeURIComponent(`Hi, I'm interested in: ${listing.title} (${window.location.href})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md"
                >
                  {/* WhatsApp icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-700 rounded-xl font-semibold text-sm transition-all active:scale-95">
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </div>

            {/* bottom padding so last card clears the safe area on mobile */}
            <div className="h-6" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeImg {
          from { opacity: 0.6; }
          to   { opacity: 1;   }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default PropertyDetails;