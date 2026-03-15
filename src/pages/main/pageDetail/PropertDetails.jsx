// src/pages/public/pageDetail/PropertyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight, MapPin, Bed, Bath,
  Maximize, Share2, Heart, Phone, CheckCircle2,
  Calendar, Car, Zap, Home, TrendingUp, Building2,
  Layers, Sofa, MessageSquare, ExternalLink, User, Loader2, Flag
} from 'lucide-react';
import Map from '../../../components/Map';
import ShareModal from '../../../components/ShareModal';
import SendMessageModal from '../../../components/SendMessageModal';
import ReportModal from '../../../components/ReportModal';
import { useFavorites } from '../../../hooks/useFavorites.jsx';
import { useUserAuth  } from '../../../context/UserAuthContext';
import { useAgentAuth } from '../../../context/AgentAuthContext';
import { fetchProperty } from '../../../api/public/properties';

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────
const WaIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── strip "null" strings the backend sometimes returns ──────────────────────
const clean = (v) => (v && v !== 'null' && v !== '' ? v : null);

// ─── Field normaliser ─────────────────────────────────────────────────────────
const normalise = (raw) => {
  if (!raw) return null;

  const photos = (raw.photos || [])
    .map(p => (typeof p === 'string' ? p : p.photo_url || p.preview || null))
    .filter(Boolean);
  const coverPhoto = raw.cover_photo || raw.image || null;
  const images = photos.length
    ? photos
    : raw.images?.length
      ? raw.images.filter(Boolean)
      : coverPhoto ? [coverPhoto] : [];

  const location =
    raw.location ||
    [raw.address, raw.city, raw.region].filter(Boolean).join(', ') ||
    '—';

  const txType = raw.transaction_type || raw.listingType || raw.type || '';
  const listingType =
    txType === 'sale'     ? 'For Sale' :
    txType === 'rent'     ? 'For Rent' :
    txType === 'For Sale' ? 'For Sale' :
    txType === 'For Rent' ? 'For Rent' : txType || 'For Sale';

  // ── owner fields — exactly as returned by /public/properties/:id ──────────
  const ownerName   = clean(raw.owner_name)   || null;
  const ownerAvatar = clean(raw.owner_avatar) || null;
  const ownerPhone  = clean(raw.owner_phone)  || null;
  // whatsapp: prefer owner_whatsapp, fall back to phone
  const ownerWa     = clean(raw.owner_whatsapp) ?? ownerPhone;
  const ownerVerified = Boolean(raw.owner_verified);
  const ownerRole     = raw.owner_role  || 'agent';
  const ownerAgency   = clean(raw.agency_name) || null;
  const ownerBio      = clean(raw.owner_bio)   || null;
  const ownerId       = raw.owner_id           || null;

  const parkingVal   = raw.parking   != null ? Number(raw.parking)   : null;
  const generatorVal = raw.generator != null ? Number(raw.generator) : null;

  const furnishedRaw = raw.furnished || '';
  const furnished    = furnishedRaw
    ? furnishedRaw.charAt(0).toUpperCase() + furnishedRaw.slice(1).replace('-', ' ')
    : null;

  return {
    id: raw.id, title: raw.title || '—', description: raw.description || '',
    price:    raw.price    != null ? Number(raw.price)    : null,
    location, address: raw.address || '', city: raw.city || '', region: raw.region || '',
    bedrooms:  raw.bedrooms  != null ? Number(raw.bedrooms)  : null,
    bathrooms: raw.bathrooms != null ? Number(raw.bathrooms) : null,
    area:      raw.area      != null ? Number(raw.area)      : null,
    propertyType: raw.property_type || raw.propertyType || '',
    listingType,
    yearBuilt:   raw.year_built   || raw.yearBuilt   || '',
    furnished,
    floor:       raw.floor        != null ? String(raw.floor)        : '',
    totalFloors: raw.total_floors != null ? String(raw.total_floors) : '',
    parking: parkingVal, generator: generatorVal, status: raw.status || null,
    images,
    lat: raw.lat || 4.0511,
    lng: raw.lng || 9.7679,
    ownerId, ownerName, ownerAvatar, ownerPhone, ownerWa,
    ownerVerified, ownerRole, ownerAgency, ownerBio,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
const PropertyDetails = ({ listing: rawListing, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab,         setActiveTab]         = useState('overview');
  const [mounted,           setMounted]           = useState(false);
  const [shareOpen,         setShareOpen]         = useState(false);
  const [msgOpen,           setMsgOpen]           = useState(false);
  const [reportOpen,        setReportOpen]        = useState(false);
  const [heartAnim,         setHeartAnim]         = useState(false);
  const [fullData,          setFullData]          = useState(null);
  const [detailLoading,     setDetailLoading]     = useState(false);

  const { user }                                = useUserAuth();
  const { agent }                               = useAgentAuth();
  const activeUser = user || agent;             // whoever is logged in
  const { isFavorited, toggle: toggleFavorite } = useFavorites();
  const favorited = rawListing ? isFavorited(rawListing.id) : false;
  const navigate  = useNavigate();

  // merge: fullData wins over rawListing so owner fields appear once loaded
  const listing = normalise(fullData ?? rawListing);

  // ── fetch full detail (has owner_phone, owner_name, owner_id …) ──────────
  useEffect(() => {
    if (!isOpen || !rawListing?.id) return;
    setFullData(null);
    setDetailLoading(true);
    fetchProperty(rawListing.id)
      .then(data => { if (data && !data.error) setFullData(data); })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [isOpen, rawListing?.id]);

  useEffect(() => {
    if (isOpen && listing) {
      setCurrentImageIndex(0);
      setActiveTab('overview');
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    } else {
      setMounted(false);
    }
  }, [isOpen, rawListing?.id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape')     handleClose();
      if (e.key === 'ArrowLeft')  prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, currentImageIndex]);

  if (!isOpen || !listing) return null;

  const fallback  = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
  const images    = listing.images.length ? listing.images : [fallback];
  const prevImage = () => setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1));

  const handleClose = () => { setMounted(false); setTimeout(onClose, 320); };

  const handleFavorite = async () => {
    const result = await toggleFavorite(listing.id);
    if (result === 'unauthenticated') { navigate('/auth'); return; }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
  };

  const handleMessageSent = (inquiryId) => {
    setMsgOpen(false);
    handleClose();
    const dest = activeUser?.role === 'agent'
      ? `/agent/leads?conversation=${inquiryId}`
      : `/user/messages?thread=${inquiryId}`;
    setTimeout(() => navigate(dest), 340);
  };

  const hasValidOwnerId = listing.ownerId
    && String(listing.ownerId) !== 'undefined'
    && listing.ownerId !== 'preview';

  const goToAgent = () => {
    if (!hasValidOwnerId) return;
    handleClose();
    setTimeout(() => navigate(`/agent/${listing.ownerId}`), 320);
  };

  const formatPrice = (p) => p != null ? Number(p).toLocaleString('fr-CM') : '—';
  const formatArea  = (a) => a != null ? Number(a).toLocaleString('fr-FR') : '—';

  const ownerInitials = (listing.ownerName || 'HA')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const isRent    = listing.listingType === 'For Rent';
  const isNoRooms = ['land', 'commercial'].includes(listing.propertyType?.toLowerCase());

  const whatsappMsg = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce: "${listing.title}" sur HOMi.`
  );

  const dynamicFeatures = [
    listing.parking   === 1                && 'Secure Parking',
    listing.generator === 1                && 'Backup Generator',
    listing.furnished === 'Furnished'      && 'Fully Furnished',
    listing.furnished === 'Semi furnished' && 'Semi-Furnished',
  ].filter(Boolean);

  const allFeatures = [...new Set([
    ...dynamicFeatures,
    'Running Water', 'Electricity (ENEO)', '24h Security',
    'Modern Kitchen', 'High-Speed Internet Ready', 'Water Tank',
    'Balcony / Terrace', 'Storage Room',
  ])];

  const baseDetails = [
    { Icon: Home,       color: 'bg-amber-100  text-amber-700',  label: 'Property Type',
      value: listing.propertyType ? listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1) : '—' },
    { Icon: TrendingUp, color: 'bg-purple-100 text-purple-700', label: 'Transaction',  value: listing.listingType },
    { Icon: Maximize,   color: 'bg-green-100  text-green-700',
      label: isNoRooms && listing.propertyType?.toLowerCase() === 'land' ? 'Plot Size' : 'Area',
      value: listing.area != null ? `${formatArea(listing.area)} m²` : '—' },
    { Icon: Car,        color: 'bg-green-100  text-green-700',  label: 'Parking',
      value: listing.parking === 1 ? 'Available' : listing.parking === 0 ? 'Not available' : '—' },
    { Icon: Zap,        color: 'bg-yellow-100 text-yellow-700', label: 'Generator',
      value: listing.generator === 1 ? 'Included' : listing.generator === 0 ? 'Not included' : '—' },
  ];

  const extendedDetails = isNoRooms ? [] : [
    { Icon: Calendar,  color: 'bg-blue-100   text-blue-700',   label: 'Year Built',   value: listing.yearBuilt   || '—' },
    { Icon: Sofa,      color: 'bg-pink-100   text-pink-700',   label: 'Furnished',    value: listing.furnished   || '—' },
    { Icon: Layers,    color: 'bg-indigo-100 text-indigo-700', label: 'Floor',        value: listing.floor ? `Floor ${listing.floor}` : '—' },
    { Icon: Building2, color: 'bg-slate-100  text-slate-700',  label: 'Total Floors', value: listing.totalFloors || '—' },
  ];

  const detailRows = [...baseDetails, ...extendedDetails];

  // ─── Contact sidebar ──────────────────────────────────────────────────────
  const ContactSidebar = () => (
    <div className="space-y-4">

      {/* Price card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
          {isRent ? 'Monthly Rent' : 'Asking Price'}
        </p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-extrabold text-amber-700">{formatPrice(listing.price)}</span>
          <span className="text-base font-semibold text-amber-600">XAF</span>
          {isRent && <span className="text-sm text-amber-500 font-medium">/month</span>}
        </div>
        <div className={`mt-3 pt-3 border-t border-amber-100 grid gap-2 text-center ${isNoRooms ? 'grid-cols-1 max-w-[120px]' : 'grid-cols-3'}`}>
          {!isNoRooms && [
            { v: listing.bedrooms  ?? '—', l: 'Beds'  },
            { v: listing.bathrooms ?? '—', l: 'Baths' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-xl font-extrabold text-gray-900">{v}</div>
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{l}</div>
            </div>
          ))}
          <div>
            <div className="text-xl font-extrabold text-gray-900">{formatArea(listing.area)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">m²</div>
          </div>
        </div>
      </div>

      {/* Agent card */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">

        {detailLoading ? (
          /* shimmer while fetching */
          <div className="space-y-3 animate-pulse">
            <div className="h-3 w-20 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-amber-100 rounded-xl" />
          </div>
        ) : (
          <>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listed by</p>

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div
                onClick={hasValidOwnerId ? goToAgent : undefined}
                className={`flex-shrink-0 w-14 h-14 rounded-full overflow-hidden shadow-md ${
                  hasValidOwnerId ? 'ring-2 ring-amber-300 hover:ring-amber-500 cursor-pointer transition-all' : ''
                }`}>
                {listing.ownerAvatar
                  ? <img src={listing.ownerAvatar} alt={listing.ownerName} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center ${
                      listing.ownerRole === 'agent'
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <span className={`text-xl font-extrabold ${listing.ownerRole === 'agent' ? 'text-amber-700' : 'text-gray-500'}`}>
                        {ownerInitials}
                      </span>
                    </div>
                }
              </div>

              <div className="flex-1 min-w-0">
                {hasValidOwnerId ? (
                  <button onClick={goToAgent}
                    className="font-bold text-gray-900 hover:text-amber-700 transition-colors flex items-center gap-1 group text-left w-full">
                    <span className="truncate">{listing.ownerName || 'HOMi Agent'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 flex-shrink-0" />
                  </button>
                ) : (
                  <p className="font-bold text-gray-900 truncate">{listing.ownerName || 'HOMi Agent'}</p>
                )}
                <p className="text-sm text-gray-500 truncate">
                  {listing.ownerAgency || (listing.ownerRole === 'agent' ? 'Licensed Real Estate Agent' : 'Private Owner')}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {listing.ownerVerified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                    listing.ownerRole === 'agent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.ownerRole === 'agent' ? 'Agent' : 'Private Owner'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {listing.ownerBio && (
              <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-amber-200 pl-3 line-clamp-3">
                {listing.ownerBio}
              </p>
            )}

            {/* View profile — only agents have a profile page */}
            {hasValidOwnerId && listing.ownerRole === 'agent' && (
              <button onClick={goToAgent}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-700 rounded-xl font-semibold text-sm transition-all active:scale-95">
                <User className="w-4 h-4" />
                View Agent Profile
              </button>
            )}

            {/* Phone */}
            {listing.ownerPhone ? (
              <a href={`tel:${listing.ownerPhone}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="text-sm font-bold text-gray-900">{listing.ownerPhone}</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 opacity-40">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="text-sm font-bold text-gray-400">Not available</p>
                </div>
              </div>
            )}

            {/* WhatsApp — only show if number exists */}
            {listing.ownerWa && (
              <a href={`https://wa.me/${listing.ownerWa.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <WaIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
                  <p className="text-sm font-bold text-gray-900">{listing.ownerWa.replace(/[^0-9+]/g, '')}</p>
                </div>
              </a>
            )}

            {/* Send Message */}
            <button onClick={() => setMsgOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md">
              <MessageSquare className="w-4 h-4" /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: mounted ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: mounted ? 'translateY(0)' : 'translateY(100%)' }}
        role="dialog" aria-modal="true" aria-label={listing.title}
      >
        {/* Sticky header */}
        <div className="flex-none flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10">
          <button onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 mx-4 overflow-hidden">
            <p className="font-bold text-gray-900 truncate leading-tight text-sm sm:text-base">{listing.title}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {detailLoading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin mr-1" />}
            {activeUser && (
              <button onClick={() => setReportOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                aria-label="Report listing" title="Report this listing">
                <Flag className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            )}
            <button onClick={() => setShareOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={handleFavorite}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors relative">
              <Heart className={`w-4 h-4 transition-all duration-200 ${
                favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              } ${heartAnim ? 'scale-125' : 'scale-100'}`} />
              {heartAnim && favorited && (
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-28 lg:pb-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

              {/* Left column */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* Gallery */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden select-none">
                  <div className="relative h-64 sm:h-80 lg:h-[420px]">
                    <img
                      key={images[currentImageIndex]}
                      src={images[currentImageIndex]}
                      alt={`${listing.title} — photo ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      style={{ animation: 'fadeImg 0.25s ease' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                      {listing.listingType}
                    </span>
                    {listing.status && listing.status !== 'approved' && (
                      <span className="absolute top-4 left-28 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                        {listing.status}
                      </span>
                    )}
                    <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                    {images.length > 1 && (
                      <>
                        <button onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95">
                          <ChevronLeft className="w-5 h-5 text-gray-900" />
                        </button>
                        <button onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95">
                          <ChevronRight className="w-5 h-5 text-gray-900" />
                        </button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 px-4 py-3 bg-gray-900 overflow-x-auto scrollbar-hide">
                      {images.map((img, idx) => (
                        <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex ? 'border-amber-500 scale-105' : 'border-white/20 opacity-50 hover:opacity-80'
                          }`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title block */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug mb-1">{listing.title}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      {[listing.address, listing.city, listing.region].filter(Boolean).join(', ') || listing.location}
                    </p>
                  </div>
                  <button onClick={handleFavorite}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all active:scale-95 ${
                      favorited ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                    }`}>
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
                    <span className="text-xs font-semibold">{favorited ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                {/* Mobile price */}
                <div className="lg:hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-extrabold text-amber-700">{formatPrice(listing.price)}</span>
                    <span className="text-lg font-semibold text-amber-600">XAF</span>
                    {isRent && <span className="text-sm text-amber-500 font-medium">/ month</span>}
                  </div>
                  <div className={`grid gap-3 ${isNoRooms ? 'grid-cols-1 max-w-[120px]' : 'grid-cols-3'}`}>
                    {!isNoRooms && [
                      { Icon: Bed,  v: listing.bedrooms  ?? '—', l: 'Beds',  c: 'bg-amber-100 text-amber-700' },
                      { Icon: Bath, v: listing.bathrooms ?? '—', l: 'Baths', c: 'bg-blue-100  text-blue-700'  },
                    ].map(({ Icon, v, l, c }) => (
                      <div key={l} className="text-center bg-white rounded-xl p-3 shadow-sm">
                        <div className={`w-8 h-8 rounded-full ${c} flex items-center justify-center mx-auto mb-1`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">{v}</div>
                        <div className="text-xs text-gray-500">{l}</div>
                      </div>
                    ))}
                    <div className="text-center bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-1">
                        <Maximize className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{formatArea(listing.area)}</div>
                      <div className="text-xs text-gray-500">m²</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100 bg-gray-50/60">
                    {['overview', 'features', 'location'].map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 text-sm font-semibold capitalize relative transition-colors ${
                          activeTab === tab ? 'text-amber-700' : 'text-gray-500 hover:text-gray-800'
                        }`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {activeTab === 'overview' && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-2">About this property</h3>
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {listing.description ||
                              `This property in ${listing.city || listing.location} offers modern living in a prime location.`}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {detailRows.map(({ Icon, color, label, value }) => (
                            <div key={label}
                              className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors">
                              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                                <div className="text-sm font-bold text-gray-900 truncate">{String(value)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'features' && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Features &amp; Amenities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {allFeatures.map((feature) => (
                            <div key={feature}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition-colors group">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-sm text-gray-700 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Map: always mounted, shown/hidden via display — loads instantly */}
                    <div style={{ display: activeTab === 'location' ? 'block' : 'none' }}>
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Location</h3>
                        <div className="h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                          <Map
                            listings={[fullData ?? rawListing]}
                            center={{ lat: listing.lat, lng: listing.lng }}
                            zoom={15} showControls={false} height="100%"
                          />
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-0.5">Address</p>
                            <p className="text-sm text-gray-700">{listing.address || listing.location}</p>
                            {listing.city && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {listing.city}{listing.region ? `, ${listing.region}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact sidebar — mobile inline */}
                <div className="lg:hidden">
                  <ContactSidebar />
                </div>
              </div>

              {/* Right sticky sidebar (desktop) */}
              <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-6">
                  <ContactSidebar />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 flex gap-2 z-[10000]">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center bg-amber-50 rounded-xl py-3 gap-2">
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
              <span className="text-xs text-amber-600 font-medium">Loading contact…</span>
            </div>
          ) : (
            <>
              {listing.ownerPhone && (
                <a href={`tel:${listing.ownerPhone}`}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                  <span className="text-[9px] opacity-80 font-normal">{listing.ownerPhone}</span>
                </a>
              )}
              {listing.ownerWa && (
                <a href={`https://wa.me/${listing.ownerWa.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs transition-colors">
                  <WaIcon className="w-4 h-4" />
                  <span>WhatsApp</span>
                  <span className="text-[9px] opacity-80 font-normal">{listing.ownerWa.replace(/[^0-9+]/g, '')}</span>
                </a>
              )}
              <button onClick={() => setMsgOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              {hasValidOwnerId && listing.ownerRole === 'agent' && (
                <button onClick={goToAgent}
                  className="w-14 flex flex-col items-center justify-center gap-0.5 bg-white border-2 border-amber-200 text-amber-700 font-bold py-3 rounded-xl text-xs transition-colors hover:bg-amber-50">
                  <User className="w-4 h-4" />
                  <span className="text-[9px]">Agent</span>
                </button>
              )}
            </>
          )}
          <button onClick={handleFavorite}
            className={`w-14 flex items-center justify-center rounded-xl border-2 transition-all ${
              favorited ? 'bg-red-50 border-red-300 text-red-500' : 'bg-white border-gray-200 text-gray-400'
            }`}>
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} listing={rawListing} />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        subjectType="listing"
        subjectId={listing?.id}
        subjectTitle={listing?.title}
        linkedListingId={listing?.id}
      />

      <SendMessageModal
        isOpen={msgOpen}
        onClose={() => setMsgOpen(false)}
        listing={fullData ?? rawListing}
        isLoggedIn={!!activeUser}
        onLoginRequired={() => { setMsgOpen(false); handleClose(); setTimeout(() => navigate('/auth'), 320); }}
        onSent={handleMessageSent}
      />

      <style>{`
        @keyframes fadeImg { from { opacity: 0.6; } to { opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default PropertyDetails;