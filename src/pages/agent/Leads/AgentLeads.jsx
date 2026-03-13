// src/pages/agent/Leads/AgentLeads.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import LeadConversation from './LeadConversation';
import { fetchLeads } from '../../../api/agents/leads';
import {
  Search, X, MessageSquare, Phone, Mail, Clock,
  Star, TrendingUp, CheckCircle, XCircle, Archive,
  Flag, ChevronDown, Building2, MoreVertical, Loader2,
  AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short' });
};

// A lead is "new" (unread) when the agent has never replied
const isNew = (lead) => parseInt(lead.message_count || 0) === 0;

// ─────────────────────────────────────────────────────────────────────────────

const AgentLeads = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [leads, setLeads]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedStatus, setSelectedStatus]   = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');

  const conversationLeadId = searchParams.get('conversation');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLeads(); }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const newCount    = leads.filter(isNew).length;
  const activeCount = leads.filter(l => !isNew(l)).length;
  const unreadCount = newCount; // for AgentNav badge

  // Unique properties for filter
  const propertyOptions = [
    { value: 'all', label: 'All Properties' },
    ...Array.from(new Map(leads.map(l => [String(l.listing_id), l.listing_title])).entries())
      .map(([value, label]) => ({ value, label })),
  ];

  // Status options — derived from real data
  const statusOptions = [
    { value: 'all',    label: 'All Leads', count: leads.length },
    { value: 'new',    label: 'New',       count: newCount },
    { value: 'active', label: 'Replied',   count: activeCount },
  ];

  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (lead.user_name     || '').toLowerCase().includes(q) ||
      (lead.user_email    || '').toLowerCase().includes(q) ||
      (lead.listing_title || '').toLowerCase().includes(q);

    const leadStatus  = isNew(lead) ? 'new' : 'active';
    const matchStatus = selectedStatus === 'all' || leadStatus === selectedStatus;
    const matchProp   = selectedProperty === 'all' || String(lead.listing_id) === selectedProperty;

    return matchSearch && matchStatus && matchProp;
  });

  const selectedLead = conversationLeadId
    ? leads.find(l => String(l.id) === conversationLeadId)
    : null;

  const handleLeadClick  = (lead) => setSearchParams({ conversation: String(lead.id) });
  const handleCloseConvo = ()     => setSearchParams({});

  // Optimistically mark a lead as replied after sending a message
  const handleReplySent = (leadId) => {
    setLeads(prev => prev.map(l =>
      String(l.id) === String(leadId)
        ? { ...l, message_count: Math.max(1, parseInt(l.message_count || 0) + 1) }
        : l
    ));
  };

  // ── Status badge (same style as your original) ────────────────────────────

  const getStatusBadge = (lead) => {
    if (isNew(lead)) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' };
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Replied' };
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={unreadCount} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your property inquiries
              {!loading && ` (${filteredLeads.length} ${filteredLeads.length === 1 ? 'lead' : 'leads'})`}
            </p>
          </div>
          <button onClick={loadLeads} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'New Leads',            value: newCount,    icon: MessageSquare, color: 'blue'   },
            { label: 'Active Conversations', value: activeCount, icon: TrendingUp,    color: 'purple' },
            { label: 'Total Leads',          value: leads.length,icon: CheckCircle,   color: 'green'  },
            { label: 'Properties',           value: propertyOptions.length - 1, icon: Building2, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : value}</p>
                </div>
                <div className={`bg-${color}-100 p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={loadLeads} className="text-red-600 hover:text-red-700 text-sm font-medium">Retry</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by name, email, or property..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer min-w-[200px]">
                {statusOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label} ({o.count})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            <div className="relative">
              <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer min-w-[200px]">
                {propertyOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Loading leads…</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">
              {leads.length === 0
                ? 'No inquiries yet — they\'ll appear here when users contact you about your listings.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredLeads.map(lead => {
              const badge      = getStatusBadge(lead);
              const unread     = isNew(lead);
              const msgCount   = parseInt(lead.message_count || 0);
              const timeStr    = timeAgo(lead.last_message_at || lead.created_at);
              const preview    = lead.last_message_preview || lead.initial_message || '';
              const avatarUrl  = lead.user_avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.user_name || 'U')}&background=random`;

              return (
                <div key={lead.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${unread ? 'bg-blue-50' : ''}`}
                  onClick={() => handleLeadClick(lead)}>
                  <div className="flex gap-4">
                    <img src={avatarUrl} alt={lead.user_name}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{lead.user_name || 'Unknown'}</h3>
                            {unread && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                            {msgCount > 0 && (
                              <span className="text-xs text-gray-400">
                                {msgCount} message{msgCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            {lead.user_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />{lead.user_email}
                              </span>
                            )}
                            {lead.user_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />{lead.user_phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />{timeStr}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>

                          {/* Actions dropdown */}
                          <div className="relative group">
                            <button className="p-2 hover:bg-gray-200 rounded"
                              onClick={e => e.stopPropagation()}>
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4" /> Mark as Won
                              </button>
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <XCircle className="w-4 h-4" /> Mark as Lost
                              </button>
                              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm">
                                <Flag className="w-4 h-4" /> Set Priority
                              </button>
                              <hr className="my-2" />
                              <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                                <Archive className="w-4 h-4" /> Archive
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property */}
                      <div className="flex items-center gap-3 mb-3 bg-gray-50 p-3 rounded-lg">
                        {lead.listing_photo ? (
                          <img src={lead.listing_photo} alt={lead.listing_title}
                            className="w-16 h-16 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-amber-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.listing_title}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {lead.listing_city || `Listing #${lead.listing_id}`}
                          </p>
                        </div>
                      </div>

                      {/* Message preview */}
                      {preview && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">"{preview}"</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Received {timeAgo(lead.created_at)}</span>
                        </div>
                        <button
                          className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1"
                          onClick={e => { e.stopPropagation(); handleLeadClick(lead); }}>
                          View Conversation
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation slide-in */}
      {selectedLead && (
        <LeadConversation
          lead={selectedLead}
          isOpen={!!conversationLeadId}
          onClose={handleCloseConvo}
          onReplySent={handleReplySent}
        />
      )}
    </div>
  );
};

export default AgentLeads;