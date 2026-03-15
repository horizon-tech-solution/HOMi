import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Search, Clock, MessageSquare, Star, Bell,
  Settings, Plus, TrendingUp, Home, Eye, MapPin,
  Bed, Bath, Maximize, ArrowRight, AlertCircle,
  CheckCircle, Building2, Loader2, Camera, User
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import { fetchDashboard } from '../../api/users/dashboard';
import { useUserAuth } from '../../context/UserAuthContext';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 72 }) => {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const src     = user?.avatar_url || user?.avatar || null;
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size,
        background: src ? 'transparent' : 'linear-gradient(135deg,#f59e0b,#d97706)',
        border: '3px solid #fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}
    >
      {src
        ? <img src={src} alt={user?.name} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.36, fontWeight: 700, color: '#fff' }}>{initial}</span>
      }
    </div>
  );
};

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

  const stats          = data?.stats         || { favorites: 0, savedSearches: 0, recentViews: 0, unreadMessages: 0 };
  const recentActivity = data?.recentActivity || [];
  const favorites      = data?.favorites     || [];
  const savedSearches  = data?.savedSearches || [];

  const quickActions = [
    { icon: Search,        label: 'Find Properties', description: 'Browse listings',  action: () => navigate('/properties'),    color: '#3b82f6' },
    { icon: Plus,          label: 'List Property',   description: 'Sell or rent',      action: () => navigate('/user/sell/list-property'),          color: '#d97706' },
    { icon: MessageSquare, label: 'Messages',         description: 'Chat with agents', action: () => navigate('/user/messages'), color: '#10b981' },
    { icon: Settings,      label: 'Settings',         description: 'Manage account',   action: () => navigate('/user/settings'), color: '#6b7280' },
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav unreadCount={stats.unreadMessages} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Profile welcome card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-5 sm:gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => navigate('/user/settings')}>
              <Avatar user={user} size={100} />
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-0.5">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight truncate">
                {firstName}  
              </h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">
                Here's what's happening with your property search.
              </p>
            </div>

           
          </div>

          {/* Info strip */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-6 flex-wrap">
            {[
              { label: 'Member since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '—' },
              { label: 'Role',         value: user?.role === 'agent' ? 'Agent' : 'Member'                      },
              { label: 'Email',        value: user?.email || '—'                                               },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-gray-700 text-sm font-medium truncate max-w-[180px]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <StatCard icon={Heart}         label="Favorites"      value={stats.favorites}      color="text-red-500 bg-red-50"     onClick={() => navigate('/user/favorites')} />
          <StatCard icon={Search}        label="Saved Searches" value={stats.savedSearches}  color="text-blue-500 bg-blue-50"   onClick={() => navigate('/user/saved-searches')} />
          <StatCard icon={Clock}         label="Recent Views"   value={stats.recentViews}    color="text-amber-500 bg-amber-50" onClick={() => navigate('/user/history')} />
          <StatCard icon={MessageSquare} label="Messages"       value={stats.unreadMessages} color="text-green-500 bg-green-50" badge={stats.unreadMessages > 0} onClick={() => navigate('/user/notifications')} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button key={index} onClick={action.action}
                      className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all group">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                        style={{ background: action.color + '15' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 text-center mb-0.5">{action.label}</span>
                      <span className="text-xs text-gray-400 text-center">{action.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Favorites */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Favorites</h2>
                <button onClick={() => navigate('/user/favorites')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Saved Searches</h2>
                <button onClick={() => navigate('/user/saved-searches')} className="text-amber-600 hover:text-amber-700 font-semibold text-sm">All</button>
              </div>
              {savedSearches.length === 0 ? (
                <EmptyState icon={Search} message="No saved searches" sub="Save a search to get notified" />
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
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
              <button onClick={() => navigate('/properties')} className="w-full mt-4 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> New Search
              </button>
            </div>

            {/* Become Agent CTA */}
            {user?.role === 'user' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <h2 className="text-base font-bold text-gray-900">Become an Agent</h2>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  List properties, connect with buyers, and grow your real estate business.
                </p>
                <button onClick={() => navigate('/user/become-agent')}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all text-sm">
                  Learn More
                </button>
              </div>
            )}

            {/* Tip */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-gray-900">Tip of the Day</h2>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Properties with 6+ high-quality photos get 3× more inquiries. Always check photos before scheduling a viewing.
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
  <button onClick={onClick} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      {badge && <div className="w-2 h-2 bg-red-500 rounded-full" />}
    </div>
    <div className="text-2xl font-black text-gray-900 mb-0.5">{value}</div>
    <div className="text-sm text-gray-500 font-medium">{label}</div>
  </button>
);

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/properties?property=${property.listing_id || property.id}`)}
      className="flex gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {property.photo_url
          ? <img src={property.photo_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Home className="w-7 h-7" /></div>
        }
        <div className="absolute top-1.5 left-1.5">
          <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-bold rounded">
            {property.transaction_type === 'sale' ? 'Sale' : 'Rent'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm">{property.title}</h3>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{property.city}</span>
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
          {property.bedrooms  && <span className="flex items-center gap-0.5"><Bed      className="w-3 h-3" />{property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-0.5"><Bath     className="w-3 h-3" />{property.bathrooms}</span>}
          {property.area      && <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />{property.area}m²</span>}
        </div>
        <p className="text-sm font-bold text-amber-600">
          {Number(property.price).toLocaleString()} XAF
          {property.transaction_type === 'rent' && <span className="text-xs font-normal text-gray-400">/mo</span>}
        </p>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const iconMap  = { lead: MessageSquare, message: MessageSquare, viewing: Eye, offer: Star, property: Home, system: Bell, success: CheckCircle, analytics: TrendingUp };
  const colorMap = { lead: 'text-blue-500 bg-blue-50', message: 'text-green-500 bg-green-50', viewing: 'text-amber-500 bg-amber-50', offer: 'text-purple-500 bg-purple-50', property: 'text-teal-500 bg-teal-50', system: 'text-gray-500 bg-gray-50', success: 'text-green-500 bg-green-50', analytics: 'text-blue-500 bg-blue-50' };
  const Icon  = iconMap[activity.type]  || Bell;
  const color = colorMap[activity.type] || 'text-gray-500 bg-gray-50';
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
        <p className="text-gray-500 text-xs">{activity.message}</p>
        <p className="text-gray-400 text-xs mt-0.5">{new Date(activity.created_at).toLocaleDateString()}</p>
      </div>
      {!activity.read_at && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />}
    </div>
  );
};

const EmptyState = ({ icon: Icon, message, sub, action, actionLabel }) => (
  <div className="text-center py-8">
    <Icon className="w-9 h-9 text-gray-200 mx-auto mb-3" />
    <p className="font-semibold text-gray-500 text-sm">{message}</p>
    {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    {action && (
      <button onClick={action} className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold hover:bg-amber-700">
        {actionLabel}
      </button>
    )}
  </div>
);

export default UserDashboard;