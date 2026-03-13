import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Search, Clock, MessageSquare, Star, Bell,
  Settings, Plus, TrendingUp, Home, Eye, MapPin,
  Bed, Bath, Maximize, ArrowRight, AlertCircle,
  CheckCircle, Building2, Loader2
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchDashboard } from '../../api/users/dashboard';
import { useUserAuth } from '../../context/UserAuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats         = data?.stats         || { favorites: 0, savedSearches: 0, recentViews: 0, unreadMessages: 0 };
  const recentActivity = data?.recentActivity || [];
  const favorites     = data?.favorites     || [];
  const savedSearches = data?.savedSearches || [];

  const quickActions = [
    { icon: Search,       label: 'Find Properties', description: 'Browse available listings',  action: () => navigate('/properties'),       color: 'bg-blue-500'  },
    { icon: Plus,         label: 'List Property',   description: 'Sell or rent your property', action: () => navigate('/sell'),             color: 'bg-amber-600' },
    { icon: MessageSquare,label: 'Messages',         description: 'Chat with agents',           action: () => navigate('/user/messages'),color: 'bg-green-500' },
    { icon: Settings,     label: 'Settings',         description: 'Manage your account',        action: () => navigate('/user/settings'),    color: 'bg-gray-600'  },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Failed to load dashboard</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav unreadCount={stats.unreadMessages} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Here's what's happening with your property search</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard icon={Heart}        label="Favorites"      value={stats.favorites}      color="text-red-500 bg-red-50"    onClick={() => navigate('/user/favorites')} />
          <StatCard icon={Search}       label="Saved Searches" value={stats.savedSearches}  color="text-blue-500 bg-blue-50"  onClick={() => navigate('/user/saved-searches')} />
          <StatCard icon={Clock}        label="Recent Views"   value={stats.recentViews}    color="text-amber-500 bg-amber-50" onClick={() => navigate('/user/history')} />
          <StatCard icon={MessageSquare}label="Messages"       value={stats.unreadMessages} color="text-green-500 bg-green-50" badge={stats.unreadMessages > 0} onClick={() => navigate('/user/notifications')} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button key={index} onClick={action.action} className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all group">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 text-center mb-1">{action.label}</span>
                      <span className="text-xs text-gray-500 text-center">{action.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Favorites */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Favorites</h2>
                <button onClick={() => navigate('/user/favorites')} className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {favorites.length === 0 ? (
                <EmptyState icon={Heart} message="No favorites yet" sub="Browse properties and save ones you like" action={() => navigate('/properties')} actionLabel="Browse Properties" />
              ) : (
                <div className="space-y-4">
                  {favorites.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <EmptyState icon={Bell} message="No recent activity" sub="Your activity will appear here" />
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">

            {/* Saved Searches */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Saved Searches</h2>
                <button onClick={() => navigate('/user/saved-searches')} className="text-amber-600 hover:text-amber-700 font-semibold text-sm">All</button>
              </div>
              {savedSearches.length === 0 ? (
                <EmptyState icon={Search} message="No saved searches" sub="Save a search to get notified of new listings" />
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm pr-2">{search.name}</p>
                        {search.new_results_count > 0 && (
                          <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full font-bold flex-shrink-0">
                            {search.new_results_count} new
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">Updated {search.last_checked ? new Date(search.last_checked).toLocaleDateString() : 'recently'}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate('/properties')} className="w-full mt-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> New Search
              </button>
            </div>

            {/* Become Agent CTA */}
            {user?.role === 'user' && (
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Become an Agent</h2>
                </div>
                <p className="text-teal-100 text-sm leading-relaxed mb-4">
                  List properties, connect with buyers, and grow your real estate business.
                </p>
                <button onClick={() => navigate('/user/become-agent')} className="w-full py-3 bg-white text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-all">
                  Learn More
                </button>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-blue-50 rounded-2xl shadow-sm p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Tip of the Day</h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Properties with 6+ high-quality photos get 3x more inquiries. Always check photos before scheduling a viewing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, badge, onClick }) => (
  <button onClick={onClick} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all text-left group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      {badge && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
    </div>
    <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{value}</div>
    <div className="text-sm sm:text-base text-gray-600 font-medium">{label}</div>
  </button>
);

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/properties?property=${property.listing_id || property.id}`)} className="flex gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {property.photo_url ? (
          <img src={property.photo_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
            {property.transaction_type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">{property.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{property.city}</span>
        </p>
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-700 mb-2">
          {property.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>}
          {property.area && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area}m²</span>}
        </div>
        <p className="text-base sm:text-lg font-bold text-amber-600">
          {Number(property.price).toLocaleString()} XAF
          {property.transaction_type === 'rent' && <span className="text-xs font-normal text-gray-600">/mo</span>}
        </p>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const iconMap = {
    lead: MessageSquare, message: MessageSquare, viewing: Eye,
    offer: Star, property: Home, system: Bell, success: CheckCircle, analytics: TrendingUp,
  };
  const colorMap = {
    lead: 'text-blue-500 bg-blue-50', message: 'text-green-500 bg-green-50',
    viewing: 'text-amber-500 bg-amber-50', offer: 'text-purple-500 bg-purple-50',
    property: 'text-teal-500 bg-teal-50', system: 'text-gray-500 bg-gray-50',
    success: 'text-green-500 bg-green-50', analytics: 'text-blue-500 bg-blue-50',
  };
  const Icon  = iconMap[activity.type]  || Bell;
  const color = colorMap[activity.type] || 'text-gray-500 bg-gray-50';

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
        <p className="text-gray-600 text-sm">{activity.message}</p>
        <p className="text-gray-400 text-xs mt-1">{new Date(activity.created_at).toLocaleDateString()}</p>
      </div>
      {!activity.read_at && <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />}
    </div>
  );
};

const EmptyState = ({ icon: Icon, message, sub, action, actionLabel }) => (
  <div className="text-center py-8">
    <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
    <p className="font-semibold text-gray-600">{message}</p>
    {sub && <p className="text-gray-400 text-sm mt-1">{sub}</p>}
    {action && (
      <button onClick={action} className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold hover:bg-amber-700">
        {actionLabel}
      </button>
    )}
  </div>
);

export default UserDashboard;