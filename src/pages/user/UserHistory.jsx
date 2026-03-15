import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, MapPin, Bed, Bath, Maximize, X, Calendar, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchHistory, fetchSavedSearches, deleteSavedSearch } from '../../api/users/history';
import searchImage  from '../../assets/images/search.svg';
import historyImage from '../../assets/images/history.svg';

// ── Human-readable criteria labels ───────────────────────────────────────────
const CRITERIA_LABELS = {
  q:            { label: 'Location',  icon: '📍' },
  search:       { label: 'Location',  icon: '📍' },
  city:         { label: 'City',      icon: '🏙️' },
  listingType:  { label: 'Type',      icon: '🏷️' },
  type:         { label: 'Type',      icon: '🏷️' },
  price_min:    { label: 'Min price', icon: '💰', fmt: (v) => Number(v).toLocaleString() + ' XAF' },
  price_max:    { label: 'Max price', icon: '💰', fmt: (v) => Number(v).toLocaleString() + ' XAF' },
  bedrooms:     { label: 'Beds',      icon: '🛏️', fmt: (v) => `${v}+` },
  bathrooms:    { label: 'Baths',     icon: '🚿', fmt: (v) => `${v}+` },
};
const HIDDEN_KEYS = new Set(['hash']); // internal dedup key, never shown

const formatCriteriaValue = (key, value) => {
  const meta = CRITERIA_LABELS[key];
  if (!meta) return String(value);
  if (meta.fmt) return meta.fmt(value);
  // Normalise listingType values
  if (key === 'listingType' || key === 'type') {
    if (value === 'sale')   return 'For Sale';
    if (value === 'rent')   return 'For Rent';
  }
  return String(value);
};

// ─────────────────────────────────────────────────────────────────────────────
const UserHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');

  const [browseHistory, setBrowseHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [error,         setError]         = useState(null);
  const [removing,      setRemoving]      = useState(null);

  useEffect(() => {
    fetchHistory()
      .then((res) => setBrowseHistory(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingBrowse(false));

    fetchSavedSearches()
      .then((res) => setSearchHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingSearch(false));
  }, []);

  const removeSearchItem = async (id) => {
    setRemoving(id);
    try {
      await deleteSavedSearch(id);
      setSearchHistory((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Your Activity</h1>
          <p className="text-gray-500 text-sm">Track your property views and searches</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
          <TabButton
            active={activeTab === 'browse'}
            onClick={() => setActiveTab('browse')}
            icon={Clock}
            label="Browse History"
            count={browseHistory.length}
          />
          <TabButton
            active={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
            icon={Search}
            label="Search History"
            count={searchHistory.length}
          />
        </div>

        {/* Browse History */}
        {activeTab === 'browse' && (
          <>
            {loadingBrowse ? <LoadingSpinner /> : error ? (
              <ErrorState message={error} />
            ) : browseHistory.length === 0 ? (
              <EmptyState
                image={historyImage}
                title="No browse history yet"
                sub="Properties you view will appear here"
                actionLabel="Start browsing"
                onAction={() => navigate('/properties')}
              />
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{browseHistory.length} recently viewed</p>
                <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2">
                  {browseHistory.map((property) => (
                    <BrowseHistoryCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Search History */}
        {activeTab === 'search' && (
          <>
            {loadingSearch ? <LoadingSpinner /> : searchHistory.length === 0 ? (
              <EmptyState
                image={searchImage}
                title="No search history yet"
                sub="Searches you make will be saved here automatically"
                actionLabel="Start searching"
                onAction={() => navigate('/properties')}
              />
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{searchHistory.length} saved searches</p>
                <div className="space-y-3">
                  {searchHistory.map((search) => (
                    <SearchHistoryCard
                      key={search.id}
                      search={search}
                      onRemove={removeSearchItem}
                      removing={removing === search.id}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Browse History Card ───────────────────────────────────────────────────────
const BrowseHistoryCard = ({ property }) => {
  const navigate = useNavigate();
  const isRent   = property.transaction_type === 'rent';

  return (
    <div
      onClick={() => navigate(`/properties?property=${property.listing_id || property.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-100 transition-all overflow-hidden group cursor-pointer"
    >
      <div className="flex">
        {/* Photo */}
        <div className="relative w-36 sm:w-44 h-36 sm:h-40 flex-shrink-0 bg-gray-100">
          {property.photo_url
            ? <img src={property.photo_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🏠</div>
          }
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded">
            {isRent ? 'Rent' : 'Sale'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">{property.title}</h3>

          <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0 text-amber-500" />
            <span className="truncate">{property.city}{property.region ? `, ${property.region}` : ''}</span>
          </p>

          <p className="text-base font-black text-amber-600 mb-2">
            {Number(property.price).toLocaleString()}
            <span className="text-xs font-normal text-gray-400 ml-1">XAF{isRent ? '/mo' : ''}</span>
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-auto">
            {property.bedrooms  && <span className="flex items-center gap-0.5"><Bed      className="w-3 h-3" />{property.bedrooms}</span>}
            {property.bathrooms && <span className="flex items-center gap-0.5"><Bath     className="w-3 h-3" />{property.bathrooms}</span>}
            {property.area      && <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />{property.area}m²</span>}
          </div>

          <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Viewed {property.viewed_at
                ? new Date(property.viewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : 'recently'}
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Search History Card ───────────────────────────────────────────────────────
const SearchHistoryCard = ({ search, onRemove, removing }) => {
  const navigate = useNavigate();

  const criteria = (() => {
    try { return typeof search.criteria === 'string' ? JSON.parse(search.criteria) : search.criteria; }
    catch { return {}; }
  })();

  // Visible criteria — skip hidden internal keys
  const visibleEntries = Object.entries(criteria).filter(([k]) => !HIDDEN_KEYS.has(k));

  const handleSearchAgain = (e) => {
    e.stopPropagation();
    // Build URL params — map criteria keys to what Properties.jsx expects
    const p = new URLSearchParams();
    Object.entries(criteria).forEach(([k, v]) => {
      if (!HIDDEN_KEYS.has(k)) p.set(k, v);
    });
    navigate(`/properties?${p.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:border-amber-100 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Search className="w-4 h-4 text-amber-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{search.name}</h3>
            <button
              onClick={() => onRemove(search.id)}
              disabled={removing}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-40 flex-shrink-0"
            >
              {removing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                : <X className="w-3.5 h-3.5 text-gray-400" />
              }
            </button>
          </div>

          {/* Criteria tags — human readable */}
          {visibleEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleEntries.map(([key, value]) => {
                const meta  = CRITERIA_LABELS[key];
                const label = meta?.label || key;
                const fmt   = formatCriteriaValue(key, value);
                return (
                  <span key={key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-full font-medium">
                    {meta?.icon && <span className="text-[11px]">{meta.icon}</span>}
                    {label}: <span className="text-gray-900 font-semibold">{fmt}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {search.created_at
                ? new Date(search.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Recently saved'}
              {search.new_results_count > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-amber-600 text-white text-[10px] rounded-full font-bold">
                  {search.new_results_count} new
                </span>
              )}
            </div>

            <button
              onClick={handleSearchAgain}
              className="flex items-center gap-1 px-3 py-1.5 text-amber-600 font-semibold text-xs hover:bg-amber-50 rounded-lg transition-all"
            >
              Search again <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Shared helpers ────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      active ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count > 0 && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <AlertCircle className="w-12 h-12 text-red-400" />
    <p className="text-gray-600 font-semibold text-sm">{message}</p>
    <button onClick={() => window.location.reload()}
      className="px-5 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold hover:bg-amber-700">
      Retry
    </button>
  </div>
);

const EmptyState = ({ image, title, sub, actionLabel, onAction }) => (
  <div className="text-center py-16">
    <img src={image} alt={title} className="w-40 h-40 sm:w-52 sm:h-52 mx-auto mb-6 opacity-80" />
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-400 text-sm mb-6">{sub}</p>
    {onAction && (
      <button onClick={onAction}
        className="px-6 py-2.5 bg-amber-600 text-white rounded-full text-sm font-bold hover:bg-amber-700">
        {actionLabel}
      </button>
    )}
  </div>
);

export default UserHistory;