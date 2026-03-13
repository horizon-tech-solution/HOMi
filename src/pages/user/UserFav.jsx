import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, Trash2, Loader2, AlertCircle } from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchFavorites, removeFavorite as removeFavoriteApi } from '../../api/users/favorites';
import favImage from '../../assets/images/fav.svg';

const UserFav = () => {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [removing, setRemoving]   = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy]     = useState('recent');

  useEffect(() => {
    fetchFavorites()
      .then((res) => setFavorites(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (e, listingId) => {
    e.stopPropagation();
    setRemoving(listingId);
    try {
      await removeFavoriteApi(listingId);
      // backend returns l.id as "id"
      setFavorites((prev) => prev.filter((f) => f.id !== listingId));
    } catch (err) {
      alert(err.message || 'Failed to remove favorite');
    } finally {
      setRemoving(null);
    }
  };

  const sorted = [...favorites].sort((a, b) => {
    if (sortBy === 'price-low')  return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'beds')       return (b.bedrooms || 0) - (a.bedrooms || 0);
    return new Date(b.favorited_at) - new Date(a.favorited_at);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {favorites.length === 0 ? (
          <EmptyState onSearch={() => navigate('/properties')} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Favorites</h1>
                <p className="text-gray-600">{favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}</p>
              </div>

              <div className="flex items-center gap-3">
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

                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="3" y="3" width="6" height="6" rx="1"/>
                      <rect x="11" y="3" width="6" height="6" rx="1"/>
                      <rect x="3" y="11" width="6" height="6" rx="1"/>
                      <rect x="11" y="11" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="3" y="4" width="14" height="2" rx="1"/>
                      <rect x="3" y="9" width="14" height="2" rx="1"/>
                      <rect x="3" y="14" width="14" height="2" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {sorted.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onRemove={handleRemove}
                  removing={removing === property.id}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Property Card ─────────────────────────────────────────────────────────────
const PropertyCard = ({ property, onRemove, removing, viewMode }) => {
  const navigate = useNavigate();

  // Backend returns cover_photo (not photo_url)
  const photo  = property.cover_photo || null;
  const price  = Number(property.price).toLocaleString();
  const isRent = property.transaction_type === 'rent';

  const RemoveBtn = ({ className = '' }) => (
    <button
      onClick={(e) => onRemove(e, property.id)}
      disabled={removing}
      className={`p-2 rounded-lg transition-all text-red-500 hover:bg-red-50 disabled:opacity-50 ${className}`}
    >
      {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );

  if (viewMode === 'list') {
    return (
      <div onClick={() => navigate(`/properties?property=${property.id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
            {photo
              ? <img src={photo} alt={property.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏠</div>
            }
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
            </div>
          </div>

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                <p className="text-gray-600 flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />{property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">
                  {price} <span className="text-sm font-normal">XAF</span>
                  {isRent && <span className="text-sm font-normal text-gray-600">/mo</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-700 mb-3">
              {property.bedrooms  && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.bedrooms} beds</span>}
              {property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms} baths</span>}
              {property.area      && <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{property.area}m²</span>}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <p className="text-sm text-gray-500">Saved {new Date(property.favorited_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/properties?property=${property.id}`); }} className="px-4 py-2 text-amber-600 font-semibold hover:bg-amber-50 rounded-lg transition-all">
                  View details
                </button>
                <RemoveBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => navigate(`/properties?property=${property.id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {photo
          ? <img src={photo} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏠</div>
        }
        <button
          onClick={(e) => onRemove(e, property.id)}
          disabled={removing}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all disabled:opacity-50"
        >
          {removing ? <Loader2 className="w-5 h-5 animate-spin text-red-400" /> : <Heart className="w-5 h-5 text-red-500 fill-current" />}
        </button>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-2xl font-bold text-amber-600 mb-2">
          {price} <span className="text-sm font-normal">XAF</span>
          {isRent && <span className="text-sm font-normal text-gray-600">/mo</span>}
        </p>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
        <p className="text-gray-600 flex items-center gap-1 text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />{property.city}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-700 mb-3 pb-3 border-b">
          {property.bedrooms  && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms}</span>}
          {property.area      && <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{property.area}m²</span>}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Saved {new Date(property.favorited_at).toLocaleDateString()}</p>
          <RemoveBtn />
        </div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onSearch }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
    <img
      src={favImage}
      alt="No favorites yet"
      className="w-48 h-48 sm:w-64 sm:h-64 mb-6 sm:mb-8"
    />
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
      Save homes for safe keeping
    </h2>
    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 text-center max-w-md">
      Whenever you find homes you like, select the <Heart className="w-5 h-5 inline text-red-500" /> to save them here.
    </p>
    <button onClick={onSearch} className="px-6 sm:px-8 py-3 sm:py-4 bg-amber-600 text-white rounded-full font-bold text-base sm:text-lg hover:bg-amber-700 transition-all">
      Search for homes
    </button>
  </div>
);

export default UserFav;