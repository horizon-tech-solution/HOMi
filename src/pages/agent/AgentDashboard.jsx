import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import { useAgentAuth } from '../../context/AgentAuthContext';
import { fetchDashboard } from '../../api/agents/dashboard';
import AgentReviews from '../../components/AgentReviews';
import {
  Building2, Eye, Users, Clock, ArrowUpRight, Plus,
  MoreVertical, MapPin, Calendar, Star, Loader2,
  AlertCircle, MessageSquare, Camera, User,
} from 'lucide-react';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 72 }) => {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';
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

const AgentDashboard = () => {
  const navigate  = useNavigate();
  const { agent } = useAgentAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav />
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-500">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="text-amber-600 font-semibold hover:underline">Retry</button>
      </div>
    </div>
  );

  const {
    totalListings       = 0,
    activeListings      = 0,
    pendingListings     = 0,
    totalViews          = 0,
    totalLeads          = 0,
    unreadNotifications = 0,
    recentListings      = [],
    averageRating       = null,
    totalReviews        = 0,
  } = data || {};

  const firstName = agent?.name?.split(' ')[0] || 'there';

  const stats = [
    { label: 'Total Listings', value: totalListings,  icon: Building2 },
    { label: 'Total Views',    value: totalViews,     icon: Eye       },
    { label: 'Total Leads',    value: totalLeads,     icon: Users     },
    { label: 'Pending Review', value: pendingListings, icon: Clock    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={totalLeads} unreadNotifications={unreadNotifications} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Profile welcome card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => navigate('/agent/profile')}>
              <Avatar user={agent} size={72} />
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-0.5">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight truncate">{firstName}</h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">Here's what's happening with your listings.</p>

              {/* Rating pill */}
              {totalReviews > 0 && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border border-amber-100 bg-amber-50">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-700">
                    {averageRating ? Number(averageRating).toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-amber-600">
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/agent/profile')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <User className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-6 flex-wrap">
            {[
              { label: 'Agency', value: agent?.agency_name || '—' },
              { label: 'Role',   value: 'Agent'                    },
              { label: 'Email',  value: agent?.email || '—'        },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-gray-700 text-sm font-medium truncate max-w-[180px]">{value}</p>
              </div>
            ))}
            <div className="ml-auto">
              {agent?.verification_status === 'verified'
                ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Verified
                  </span>
                : <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-100">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
              }
            </div>
          </div>
        </div>

        {/* Quick action */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/agent/listings/add')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add New Property
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left col: recent listings ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
                <button onClick={() => navigate('/agent/listings')}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1">
                  View All <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {recentListings.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-gray-500">No listings yet</p>
                  <button onClick={() => navigate('/agent/listings/add')}
                    className="mt-3 text-amber-600 font-semibold hover:underline text-sm">
                    Add your first property
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                          {listing.cover_photo
                            ? <img src={listing.cover_photo} alt={listing.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-gray-300" />
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate pr-2">{listing.title}</h3>
                            <button className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {listing.city}{listing.region ? `, ${listing.region}` : ''}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-amber-600">
                              {Number(listing.price).toLocaleString()} FCFA
                              {listing.transaction_type === 'rent' ? '/mo' : ''}
                            </span>
                            <StatusBadge status={listing.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(listing.submitted_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews — full width under listings on mobile, stays in left col on desktop */}
            {agent?.id && (
              <div className="lg:hidden">
                <AgentReviews agentId={agent.id} />
              </div>
            )}
          </div>

          {/* ── Right col ── */}
          <div className="space-y-5">

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-bold text-gray-900">Summary</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Active listings', value: activeListings  },
                  { label: 'Pending review',  value: pendingListings },
                  { label: 'Total leads',     value: totalLeads      },
                  { label: 'Total views',     value: totalViews      },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => navigate('/agent/listings')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors">
                  My Listings
                </button>
                <button onClick={() => navigate('/agent/leads')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Leads
                </button>
              </div>
            </div>

            {/* Verification notice */}
            {agent?.verification_status !== 'verified' && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Verification Pending</h4>
                    <p className="text-xs text-gray-500 mb-3">Your ID is being reviewed. Usually within 24 hours.</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-amber-500 rounded-full h-1.5" style={{ width: '40%' }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">In progress</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews — desktop sidebar */}
            {agent?.id && (
              <div className="hidden lg:block">
                <AgentReviews agentId={agent.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-50 text-green-700 border-green-100',
    pending:  'bg-amber-50 text-amber-700 border-amber-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    flagged:  'bg-orange-50 text-orange-700 border-orange-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${map[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d    = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default AgentDashboard;