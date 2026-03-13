import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import { useUserAuth } from '../../context/UserAuthContext';
import { fetchDashboard } from '../../api/agents/dashboard';
import {
  Building2,
  Eye,
  Users,
  Clock,
  ArrowUpRight,
  Plus,
  MoreVertical,
  MapPin,
  Calendar,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const AgentDashboard = () => {
  const navigate   = useNavigate();
  const { user: agent } = useUserAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    </div>
  );

  // ── error ───────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-500">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="text-amber-600 font-semibold hover:underline">
          Retry
        </button>
      </div>
    </div>
  );

  const {
    totalListings    = 0,
    activeListings   = 0,
    pendingListings  = 0,
    totalViews       = 0,
    totalLeads       = 0,
    unreadNotifications = 0,
    recentListings   = [],
  } = data || {};

  const stats = [
    { label: 'Total Listings',  value: totalListings,  icon: Building2,    color: 'bg-blue-500'   },
    { label: 'Total Views',     value: totalViews,     icon: Eye,          color: 'bg-purple-500' },
    { label: 'Total Leads',     value: totalLeads,     icon: Users,        color: 'bg-green-500'  },
    { label: 'Pending Review',  value: pendingListings, icon: Clock,       color: 'bg-amber-500'  },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={totalLeads} unreadNotifications={unreadNotifications} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back{agent?.name ? `, ${agent.name.split(' ')[0]}` : ''}! Here's what's happening with your listings.
          </p>
        </div>

        {/* Quick action */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/agent/listings/add')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
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
                  View All <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {recentListings.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No listings yet</p>
                  <button
                    onClick={() => navigate('/agent/listings/add')}
                    className="mt-3 text-amber-600 font-semibold hover:underline text-sm"
                  >
                    Add your first property
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        {/* photo or placeholder */}
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {listing.cover_photo ? (
                            <img src={listing.cover_photo} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate pr-2">{listing.title}</h3>
                            <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {listing.city}{listing.region ? `, ${listing.region}` : ''}
                          </p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-base font-bold text-amber-600">
                              {Number(listing.price).toLocaleString()} FCFA
                              {listing.transaction_type === 'rent' ? '/mo' : ''}
                            </span>
                            <StatusBadge status={listing.status} />
                            <span className="text-xs text-gray-500 capitalize">{listing.transaction_type}</span>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(listing.submitted_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">

            {/* Verification status */}
            {agent?.verification_status !== 'verified' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-bold text-amber-800 mb-1">Account Pending Verification</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Your ID is being reviewed. You'll be notified once verified — usually within 24 hours.
                </p>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-amber-500 rounded-full h-2" style={{ width: '40%' }}></div>
                </div>
                <p className="text-xs text-amber-600 mt-1">Verification in progress</p>
              </div>
            )}

            {/* Summary card */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 fill-white" />
                <h3 className="text-lg font-bold">Summary</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-90">Active listings</span>
                  <span className="font-bold">{activeListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Pending review</span>
                  <span className="font-bold">{pendingListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Total leads</span>
                  <span className="font-bold">{totalLeads}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => navigate('/agent/listings')}
                  className="flex-1 bg-white text-amber-600 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  My Listings
                </button>
                <button
                  onClick={() => navigate('/agent/leads')}
                  className="flex-1 bg-white/20 text-white py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" /> Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    flagged:  'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d    = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default AgentDashboard;