// src/pages/user/Listings/UserListings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Home, MapPin, Bed, Bath, Ruler, Eye, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, ChevronRight,
  Trash2, Edit, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import UserNav from '../../../components/UserNav';
import { fetchUserListings, deleteListing } from '../../../api/users/listings';
import listIcon from '../../assets/images/list.svg';
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p, type) =>
  Number(p).toLocaleString('fr-CM') + ' XAF' + (type === 'rent' ? '/mo' : '');

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:  { label: 'Under Review', color: '#d97706', bg: '#fef3c7', icon: Clock       },
  approved: { label: 'Live',         color: '#059669', bg: '#d1fae5', icon: CheckCircle },
  rejected: { label: 'Rejected',     color: '#dc2626', bg: '#fee2e2', icon: XCircle     },
  draft:    { label: 'Draft',        color: '#6b7280', bg: '#f3f4f6', icon: Edit        },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─── Listing Card ─────────────────────────────────────────────────────────────
const ListingCard = ({ listing, onDelete }) => {
  const navigate    = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirm,  setConfirm]  = useState(false);

  const cover = listing.cover_photo
    || (listing.photos?.[0])
    || null;

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try {
      await deleteListing(listing.id);
      onDelete(listing.id);
    } catch (e) {
      alert(e.message || 'Could not delete listing');
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ border: '1px solid #f0ebe3' }}
    >
      {/* Cover image */}
      <div
        className="relative w-full cursor-pointer"
        style={{ height: 180, background: '#f5f0ea' }}
        onClick={() => navigate(`/user/listings/${listing.id}`)}
      >
        {cover ? (
          <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: '#c4b49a' }}>
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs font-medium">No photos yet</span>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={listing.status} />
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#3d2b14', color: '#fdf8f2' }}
          >
            {listing.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-sm mb-1 line-clamp-1 cursor-pointer hover:underline"
          style={{ color: '#1a1208' }}
          onClick={() => navigate(`/user/listings/${listing.id}`)}
        >
          {listing.title}
        </h3>

        <p className="text-xs flex items-center gap-1 mb-3" style={{ color: '#a09080' }}>
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{[listing.city, listing.region].filter(Boolean).join(', ') || 'No location'}</span>
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 mb-3" style={{ color: '#8B6340' }}>
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1 text-xs">
              <Bed className="w-3.5 h-3.5" /> {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1 text-xs">
              <Bath className="w-3.5 h-3.5" /> {listing.bathrooms}
            </span>
          )}
          {listing.area > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Ruler className="w-3.5 h-3.5" /> {listing.area}m²
            </span>
          )}
        </div>

        {/* Price */}
        <p className="text-base font-bold mb-3" style={{ color: '#3d2b14' }}>
          {fmtPrice(listing.price, listing.transaction_type)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f5f0ea' }}>
          <span className="text-[11px]" style={{ color: '#c4b49a' }}>
            {timeAgo(listing.submitted_at || listing.created_at)}
          </span>

          <div className="flex items-center gap-2">
            {/* Delete */}
            {listing.status !== 'approved' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                style={{
                  background: confirm ? '#fee2e2' : '#f5f0ea',
                  color:      confirm ? '#dc2626' : '#a09080',
                  border:     confirm ? '1px solid #fca5a5' : '1px solid transparent',
                }}
              >
                {deleting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Trash2 className="w-3 h-3" />
                }
                {confirm ? 'Confirm' : 'Delete'}
              </button>
            )}

            <button
              onClick={() => navigate(`/user/listings/${listing.id}/edit`)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ background: '#faf6f0', color: '#8B6340', border: '1px solid #e8dfd0' }}
            >
              <Edit className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>

        {/* Rejection note */}
        {listing.status === 'rejected' && listing.rejection_reason && (
          <div
            className="mt-3 rounded-xl px-3 py-2 text-xs flex items-start gap-2"
            style={{ background: '#fee2e2', color: '#dc2626' }}
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {listing.rejection_reason}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const Empty = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <img
      src={listIcon}
      alt="No listings"
      className="w-40 h-40 mb-2"
      style={{ opacity: 0.85 }}
    />
    <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1208' }}>No listings yet</h3>
    <p className="text-sm mb-6 max-w-xs" style={{ color: '#a09080' }}>
      Submit your first property and our team will review it before it goes live.
    </p>
    
  </div>
);

// ─── Filter tab ───────────────────────────────────────────────────────────────
const Tab = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
    style={{
      background: active ? '#3d2b14' : 'transparent',
      color:      active ? '#fdf8f2' : '#a09080',
    }}
  >
    {label}
    {count > 0 && (
      <span
        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
        style={{
          background: active ? 'rgba(255,255,255,0.2)' : '#f0e8dc',
          color:      active ? '#fdf8f2'               : '#8B6340',
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    fetchUserListings()
      .then(r => setListings(Array.isArray(r) ? r : (r.data || [])))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all:      listings.length,
    pending:  listings.filter(l => l.status === 'pending').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  };

  const filtered = filter === 'all'
    ? listings
    : listings.filter(l => l.status === filter);

  const handleDelete = (id) => setListings(p => p.filter(l => l.id !== id));

  return (
    <div className="min-h-screen" style={{ background: '#fdfaf7' }}>
      <UserNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a1208' }}>My Listings</h1>
            <p className="text-sm mt-0.5" style={{ color: '#a09080' }}>
              Properties you've submitted to HOMi
            </p>
          </div>
          <button
            onClick={() => navigate('/user/sell/list-property')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ background: '#3d2b14', color: '#fdf8f2' }}
          >
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>

        {/* Filter tabs */}
        {!loading && !error && listings.length > 0 && (
          <div
            className="flex items-center gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
            style={{ background: '#f5f0ea' }}
          >
            {[
              { key: 'all',      label: 'All'          },
              { key: 'pending',  label: 'Under Review' },
              { key: 'approved', label: 'Live'         },
              { key: 'rejected', label: 'Rejected'     },
            ].map(t => (
              <Tab
                key={t.key}
                label={t.label}
                count={counts[t.key]}
                active={filter === t.key}
                onClick={() => setFilter(t.key)}
              />
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#c4b49a' }} />
            <span className="text-sm" style={{ color: '#c4b49a' }}>Loading your listings…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-8 h-8" style={{ color: '#dc2626' }} />
            <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#faf6f0', color: '#8B6340', border: '1px solid #e8dfd0' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && listings.length === 0 && (
          <Empty onAdd={() => navigate('/user/sell/list-property')} />
        )}

        {/* No results for filter */}
        {!loading && !error && listings.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-medium" style={{ color: '#a09080' }}>
              No {filter} listings
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-sm font-semibold"
              style={{ color: '#8B6340' }}
            >
              Show all
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Info note */}
        {!loading && !error && listings.length > 0 && (
          <div
            className="mt-8 rounded-2xl p-4 flex items-start gap-3 text-sm"
            style={{ background: '#faf6f0', border: '1px solid #e8dfd0' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8B6340' }} />
            <p style={{ color: '#8B6340' }}>
              Listings under review are checked by our team within 1–2 business days.
              Only approved listings are visible to other users.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}