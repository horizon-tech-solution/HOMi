import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import { 
  Building2, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreVertical,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Mock data - replace with actual API calls
  const stats = [
    {
      label: 'Total Listings',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Views',
      value: '12.5K',
      change: '+18%',
      trend: 'up',
      icon: Eye,
      color: 'bg-purple-500'
    },
    {
      label: 'New Leads',
      value: '47',
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Avg. Response Time',
      value: '2.4h',
      change: '-0.5h',
      trend: 'up',
      icon: Clock,
      color: 'bg-amber-500'
    }
  ];

  const recentListings = [
    {
      id: 1,
      title: 'Modern 3BR Apartment in Bonamoussadi',
      location: 'Bonamoussadi, Douala',
      price: '85,000,000 FCFA',
      type: 'For Sale',
      status: 'Active',
      views: 245,
      leads: 8,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      postedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool in Bonapriso',
      location: 'Bonapriso, Douala',
      price: '250,000,000 FCFA',
      type: 'For Sale',
      status: 'Active',
      views: 432,
      leads: 15,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
      postedDate: '5 days ago'
    },
    {
      id: 3,
      title: '2BR Apartment for Rent',
      location: 'Akwa, Douala',
      price: '150,000 FCFA/month',
      type: 'For Rent',
      status: 'Pending',
      views: 123,
      leads: 4,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      postedDate: '1 week ago'
    }
  ];

  const recentLeads = [
    {
      id: 1,
      name: 'Jean Paul Mbarga',
      property: 'Modern 3BR Apartment in Bonamoussadi',
      message: 'Interested in scheduling a viewing this weekend...',
      time: '2 hours ago',
      unread: true,
      avatar: 'https://ui-avatars.com/api/?name=Jean+Paul+Mbarga&background=random'
    },
    {
      id: 2,
      name: 'Marie Claire Ndongo',
      property: 'Luxury Villa with Pool in Bonapriso',
      message: 'Can you provide more details about the financing options?',
      time: '5 hours ago',
      unread: true,
      avatar: 'https://ui-avatars.com/api/?name=Marie+Claire+Ndongo&background=random'
    },
    {
      id: 3,
      name: 'Patrick Ewondo',
      property: '2BR Apartment for Rent',
      message: 'Is this still available? When can I move in?',
      time: '1 day ago',
      unread: false,
      avatar: 'https://ui-avatars.com/api/?name=Patrick+Ewondo&background=random'
    }
  ];

  const quickActions = [
    {
      label: 'Add New Property',
      icon: Plus,
      action: () => navigate('/agent/add-property'),
      color: 'bg-amber-600 hover:bg-amber-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={2} unreadNotifications={5} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your listings.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors`}
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Listings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Listings</h2>
                <button 
                  onClick={() => navigate('/agent/listings')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <img 
                        src={listing.image} 
                        alt={listing.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 hover:text-amber-600 cursor-pointer">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {listing.location}
                            </p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-lg font-bold text-amber-600">{listing.price}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            listing.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {listing.status}
                          </span>
                          <span className="text-xs text-gray-500">{listing.type}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {listing.leads} leads
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {listing.postedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Leads</h2>
                <button 
                  onClick={() => navigate('/agent/leads')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      lead.unread ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => navigate(`/agent/leads/${lead.id}`)}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={lead.avatar} 
                        alt={lead.name}
                        className="w-10 h-10 rounded-full"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                          {lead.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{lead.property}</p>
                        
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{lead.message}</p>
                        
                        <span className="text-xs text-gray-500">{lead.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 mt-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 fill-white" />
                <h3 className="text-lg font-bold">Performance</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Completion</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Agent Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="font-bold">4.8</span>
                      <span className="text-sm opacity-80">(127 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/agent/profile')}
                className="w-full mt-4 bg-white text-amber-600 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;