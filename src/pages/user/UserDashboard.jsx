import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Clock, 
  MessageSquare, 
  Star, 
  Bell,
  Settings,
  Plus,
  TrendingUp,
  Home,
  Eye,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Building2
} from 'lucide-react';
import UserNav from '../../components/UserNav';

const UserDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with actual API calls
  const [stats] = useState({
    favorites: 8,
    savedSearches: 3,
    recentViews: 15,
    unreadMessages: 4
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'favorite_added',
      title: 'Added to favorites',
      property: 'Modern 3BR Apartment in Bonanjo',
      time: '2 hours ago',
      icon: Heart,
      color: 'text-red-500 bg-red-50'
    },
    {
      id: 2,
      type: 'message_received',
      title: 'New message from agent',
      property: 'John Kamga responded to your inquiry',
      time: '5 hours ago',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      id: 3,
      type: 'price_drop',
      title: 'Price drop alert',
      property: 'Luxury Villa in Bastos dropped by 5M XAF',
      time: '1 day ago',
      icon: TrendingUp,
      color: 'text-green-500 bg-green-50'
    },
    {
      id: 4,
      type: 'property_viewed',
      title: 'Viewed property',
      property: 'Studio Apartment in Akwa',
      time: '2 days ago',
      icon: Eye,
      color: 'text-amber-500 bg-amber-50'
    }
  ]);

  const [favorites] = useState([
    {
      id: 1,
      title: 'Modern 3BR Apartment',
      location: 'Bonanjo, Douala',
      price: 75000,
      type: 'rent',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool',
      location: 'Bastos, Yaoundé',
      price: 250000000,
      type: 'sale',
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'
    },
    {
      id: 3,
      title: 'Commercial Space',
      location: 'Akwa, Douala',
      price: 120000,
      type: 'rent',
      bedrooms: null,
      bathrooms: 2,
      area: 150,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
    }
  ]);

  const [savedSearches] = useState([
    {
      id: 1,
      name: '2-3 bedroom apartments in Douala',
      criteria: 'Douala • 2-3 beds • For Rent',
      newResults: 5,
      lastChecked: '2 hours ago'
    },
    {
      id: 2,
      name: 'Houses under 100M XAF',
      criteria: 'Yaoundé • For Sale • Max 100M',
      newResults: 0,
      lastChecked: '1 day ago'
    },
    {
      id: 3,
      name: 'Land in Bonapriso',
      criteria: 'Bonapriso, Douala • Land • For Sale',
      newResults: 2,
      lastChecked: '3 days ago'
    }
  ]);

  const quickActions = [
    {
      icon: Search,
      label: 'Find Properties',
      description: 'Browse available listings',
      action: () => navigate('/properties'),
      color: 'bg-blue-500'
    },
    {
      icon: Plus,
      label: 'List Property',
      description: 'Sell or rent your property',
      action: () => navigate('/sell'),
      color: 'bg-amber-600'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      description: 'Chat with agents',
      action: () => navigate('/user/inquiries'),
      color: 'bg-green-500'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Manage your account',
      action: () => navigate('/user/settings'),
      color: 'bg-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNav unreadCount={stats.unreadMessages} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your property search
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Heart}
            label="Favorites"
            value={stats.favorites}
            color="text-red-500 bg-red-50"
            onClick={() => navigate('/user/favorites')}
          />
          <StatCard
            icon={Search}
            label="Saved Searches"
            value={stats.savedSearches}
            color="text-blue-500 bg-blue-50"
            onClick={() => navigate('/user/saved-searches')}
          />
          <StatCard
            icon={Clock}
            label="Recent Views"
            value={stats.recentViews}
            color="text-amber-500 bg-amber-50"
            onClick={() => navigate('/user/history')}
          />
          <StatCard
            icon={MessageSquare}
            label="Messages"
            value={stats.unreadMessages}
            color="text-green-500 bg-green-50"
            badge={stats.unreadMessages > 0}
            onClick={() => navigate('/user/notifications')}
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 text-center mb-1">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        {action.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Favorites */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Favorites</h2>
                <button
                  onClick={() => navigate('/user/favorites')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {favorites.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-gray-600 text-sm">{activity.property}</p>
                        <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Saved Searches */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Saved Searches</h2>
                <button
                  onClick={() => navigate('/user/saved-searches')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                >
                  All
                </button>
              </div>

              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900 text-sm pr-2">{search.name}</p>
                      {search.newResults > 0 && (
                        <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full font-bold flex-shrink-0">
                          {search.newResults} new
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{search.criteria}</p>
                    <p className="text-gray-400 text-xs">Updated {search.lastChecked}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/properties')}
                className="w-full mt-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Search
              </button>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">For You</h2>
              </div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                Based on your search history, we found 12 new properties that match your preferences.
              </p>
              <button
                onClick={() => navigate('/user/recommended')}
                className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all"
              >
                View Recommendations
              </button>
            </div>

            {/* Tips Card */}
            <div className="bg-blue-50 rounded-2xl shadow-sm p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Tip of the Day</h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Properties with 6+ high-quality photos get 3x more inquiries. Make sure to check property photos before scheduling a viewing.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                More tips →
              </button>
            </div>

            {/* Become Agent CTA */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6" />
                <h2 className="text-xl font-bold">Become an Agent</h2>
              </div>
              <p className="text-teal-100 text-sm leading-relaxed mb-4">
                List properties, connect with buyers, and grow your real estate business.
              </p>
              <button
                onClick={() => navigate('/user/become-agent')}
                className="w-full py-3 bg-white text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {badge && (
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm sm:text-base text-gray-600 font-medium">{label}</div>
    </button>
  );
};

// Property Card Component
const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/properties?property=${property.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
          {property.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>

        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-700 mb-2">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" />
              {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="w-3 h-3" />
            {property.area}m²
          </span>
        </div>

        <p className="text-base sm:text-lg font-bold text-amber-600">
          {property.price.toLocaleString()} XAF
          {property.type === 'rent' && <span className="text-xs font-normal text-gray-600">/mo</span>}
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;