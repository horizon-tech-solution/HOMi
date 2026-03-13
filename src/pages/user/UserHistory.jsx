import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, MapPin, Bed, Bath, Maximize, X, Calendar, Loader2, AlertCircle } from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchHistory } from '../../api/users/history';
import { fetchSavedSearches, deleteSavedSearch } from '../../api/users/savedSearch';
import searchImage from '../../assets/images/search.svg';
import historyImage from '../../assets/images/history.svg';

const UserHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');

  const [browseHistory, setBrowseHistory]   = useState([]);
  const [searchHistory, setSearchHistory]   = useState([]);
  const [loadingBrowse, setLoadingBrowse]   = useState(true);
  const [loadingSearch, setLoadingSearch]   = useState(true);
  const [error, setError]                   = useState(null);
  const [removing, setRemoving]             = useState(null);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Activity</h1>
          <p className="text-gray-600">Track your property views and searches</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} icon={Clock} label={`Browse History (${browseHistory.length})`} />
          <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon={Search} label={`Search History (${searchHistory.length})`} />
        </div>

        {/* Browse History */}
        {activeTab === 'browse' && (
          <>
            {loadingBrowse ? (
              <LoadingSpinner />
            ) : error ? (
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
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">Recently viewed properties</p>
                </div>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
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
            {loadingSearch ? (
              <LoadingSpinner />
            ) : searchHistory.length === 0 ? (
              <EmptyState
                image={searchImage}
                title="No saved searches yet"
                sub="Save a search to track new listings"
                actionLabel="Start searching"
                onAction={() => navigate('/properties')}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">Your saved searches</p>
                </div>
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
  const isRent = property.transaction_type === 'rent';

  return (
    <div onClick={() => navigate(`/properties?property=${property.listing_id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
      <div className="flex">
        <div className="relative w-40 sm:w-48 h-40 flex-shrink-0 bg-gray-100">
          {property.photo_url
            ? <img src={property.photo_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🏠</div>
          }
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
              {isRent ? 'For Rent' : 'For Sale'}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.city}</span>
          </p>

          <p className="text-lg font-bold text-amber-600 mb-2">
            {Number(property.price).toLocaleString()} <span className="text-xs font-normal">XAF</span>
            {isRent && <span className="text-xs font-normal text-gray-600">/mo</span>}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-700 mb-2">
            {property.bedrooms  && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
            {property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>}
            {property.area      && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area}m²</span>}
          </div>

          <div className="mt-auto pt-2 border-t">
            <p className="text-xs text-gray-500">
              Viewed {property.viewed_at ? new Date(property.viewed_at).toLocaleDateString() : 'recently'}
            </p>
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

  const handleSearchAgain = (e) => {
    e.stopPropagation();
    const params = new URLSearchParams(criteria).toString();
    navigate(`/properties?${params}`);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h3 className="font-bold text-gray-900">{search.name}</h3>
          </div>

          {Object.keys(criteria).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(criteria).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {search.created_at ? new Date(search.created_at).toLocaleDateString() : 'Recently saved'}
            {search.new_results_count > 0 && (
              <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full font-bold">
                {search.new_results_count} new
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => onRemove(search.id)} disabled={removing} className="p-2 hover:bg-gray-100 rounded transition-all disabled:opacity-50">
            {removing ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <X className="w-4 h-4 text-gray-400" />}
          </button>
          <button onClick={handleSearchAgain} className="px-3 py-2 text-amber-600 font-semibold text-sm hover:bg-amber-50 rounded-lg transition-all whitespace-nowrap">
            Search again
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`pb-3 px-1 font-semibold transition-colors ${active ? 'border-b-2 border-amber-600 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5" />{label}
    </div>
  </button>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <AlertCircle className="w-12 h-12 text-red-400" />
    <p className="text-gray-600 font-semibold">{message}</p>
    <button onClick={() => window.location.reload()} className="px-5 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700">Retry</button>
  </div>
);

const EmptyState = ({ image, title, sub, actionLabel, onAction }) => (
  <div className="text-center py-16">
    <img src={image} alt={title} className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{sub}</p>
    {onAction && (
      <button onClick={onAction} className="px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700">
        {actionLabel}
      </button>
    )}
  </div>
);

export default UserHistory;