// src/pages/agent/AgentNotifications.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import {
  fetchNotifications, markRead, markAllRead,
  markSelectedRead, deleteNotification, deleteAll, deleteSelected,
} from '../../api/agents/notification';
import {
  Bell, BellOff, Check, Trash2, Filter, ChevronDown, X,
  MessageSquare, Eye, Heart, TrendingUp, Calendar, DollarSign,
  AlertCircle, CheckCircle, Info, Building2, User, Star,
  Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─── Map notification type → icon + color ────────────────────────────────────

const TYPE_META = {
  lead:      { icon: MessageSquare, color: 'bg-blue-500'   },
  message:   { icon: MessageSquare, color: 'bg-green-500'  },
  viewing:   { icon: Calendar,      color: 'bg-purple-500' },
  property:  { icon: Eye,           color: 'bg-amber-500'  },
  favorite:  { icon: Heart,         color: 'bg-red-500'    },
  offer:     { icon: DollarSign,    color: 'bg-green-600'  },
  review:    { icon: Star,          color: 'bg-yellow-500' },
  system:    { icon: AlertCircle,   color: 'bg-orange-500' },
  success:   { icon: CheckCircle,   color: 'bg-green-500'  },
  analytics: { icon: TrendingUp,    color: 'bg-blue-600'   },
  info:      { icon: Info,          color: 'bg-blue-400'   },
};

const getMeta = (type) => TYPE_META[type] || TYPE_META.info;

// Build a navigation link from the notification's data field
const buildLink = (notif) => {
  if (!notif.data) return null;
  const d = notif.data;
  if (d.inquiry_id)  return `/agent/leads?conversation=${d.inquiry_id}`;
  if (d.listing_id)  return `/agent/listings/${d.listing_id}`;
  if (notif.type === 'review' || notif.type === 'analytics') return '/agent/profile';
  return null;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short' });
};

// ─────────────────────────────────────────────────────────────────────────────

const AgentNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications]         = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState('');
  const [selectedFilter, setSelectedFilter]       = useState('all');
  const [showFilterMenu, setShowFilterMenu]       = useState(false);
  const [selectedIds, setSelectedIds]             = useState([]);
  const [actionLoading, setActionLoading]         = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const unreadCount = notifications.filter(n => !n.read).length;

  const thisWeekCount = notifications.filter(n => {
    if (!n.created_at) return false;
    return (Date.now() - new Date(n.created_at)) / 1000 < 604800; // 7 days
  }).length;

  const filterOptions = [
    { value: 'all',      label: 'All Notifications',  count: notifications.length },
    { value: 'unread',   label: 'Unread',              count: unreadCount },
    { value: 'lead',     label: 'Leads',               count: notifications.filter(n => n.type === 'lead').length },
    { value: 'message',  label: 'Messages',            count: notifications.filter(n => n.type === 'message').length },
    { value: 'viewing',  label: 'Viewings',            count: notifications.filter(n => n.type === 'viewing').length },
    { value: 'property', label: 'Property Updates',    count: notifications.filter(n => n.type === 'property').length },
    { value: 'system',   label: 'System',              count: notifications.filter(n => n.type === 'system').length },
  ];

  const filteredNotifications = notifications.filter(n => {
    if (selectedFilter === 'all')    return true;
    if (selectedFilter === 'unread') return !n.read;
    return n.type === selectedFilter;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleNotificationClick = async (notif) => {
    // Optimistically mark as read
    if (!notif.read) {
      setNotifications(prev => prev.map(n =>
        n.id === notif.id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
      markRead(notif.id).catch(() => {}); // fire-and-forget
    }
    const link = buildLink(notif);
    if (link) navigate(link);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0
        ? []
        : filteredNotifications.map(n => n.id)
    );
  };

  const handleMarkSelectedRead = async () => {
    if (!selectedIds.length) return;
    setActionLoading('mark-selected');
    try {
      await markSelectedRead(selectedIds);
      setNotifications(prev => prev.map(n =>
        selectedIds.includes(n.id) ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
      setSelectedIds([]);
    } catch (err) {
      alert(err?.message || 'Failed to mark as read');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('mark-all');
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: n.read_at || new Date().toISOString() })));
    } catch (err) {
      alert(err?.message || 'Failed to mark all as read');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteOne = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notification?')) return;
    // Optimistic remove
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      // Reload on failure
      load();
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} notification(s)?`)) return;
    setActionLoading('delete-selected');
    const toDelete = [...selectedIds];
    setNotifications(prev => prev.filter(n => !toDelete.includes(n.id)));
    setSelectedIds([]);
    try {
      await deleteSelected(toDelete);
    } catch (err) {
      load(); // reload on failure
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    setActionLoading('delete-all');
    setNotifications([]);
    setSelectedIds([]);
    try {
      await deleteAll();
    } catch (err) {
      load();
    } finally {
      setActionLoading('');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadNotifications={unreadCount} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your property activities and leads</p>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total',     value: notifications.length, icon: Bell,      color: 'blue'  },
            { label: 'Unread',    value: unreadCount,          icon: BellOff,   color: 'amber' },
            { label: 'This Week', value: thisWeekCount,        icon: TrendingUp,color: 'green' },
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
            <button onClick={load} className="text-red-600 hover:text-red-700 text-sm font-medium">Retry</button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* Filter + Select */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button onClick={() => setShowFilterMenu(p => !p)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {filterOptions.find(f => f.value === selectedFilter)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    {filterOptions.map(opt => (
                      <button key={opt.value}
                        onClick={() => { setSelectedFilter(opt.value); setShowFilterMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          selectedFilter === opt.value ? 'bg-amber-50 text-amber-600' : ''
                        }`}>
                        <span>{opt.label}</span>
                        <span className="text-gray-400">({opt.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" readOnly
                  checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded pointer-events-none" />
                <span className="font-medium text-sm">Select All</span>
              </button>

              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedIds.length > 0 ? (
                <>
                  <button onClick={handleMarkSelectedRead}
                    disabled={actionLoading === 'mark-selected'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-60">
                    {actionLoading === 'mark-selected'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Check className="w-4 h-4" />}
                    Mark as Read
                  </button>
                  <button onClick={handleDeleteSelected}
                    disabled={actionLoading === 'delete-selected'}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-60">
                    {actionLoading === 'delete-selected'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                      disabled={actionLoading === 'mark-all'}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors text-sm disabled:opacity-60">
                      {actionLoading === 'mark-all'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Check className="w-4 h-4" />}
                      Mark All Read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={handleDeleteAll}
                      disabled={actionLoading === 'delete-all'}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors text-sm disabled:opacity-60">
                      {actionLoading === 'delete-all'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                      Clear All
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Loading notifications…</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {selectedFilter === 'all'
                ? "You're all caught up!"
                : `No ${filterOptions.find(f => f.value === selectedFilter)?.label?.toLowerCase()} notifications.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredNotifications.map(notif => {
              const { icon: Icon, color } = getMeta(notif.type);
              const isSelected = selectedIds.includes(notif.id);

              return (
                <div key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-blue-50' : ''
                  } ${isSelected ? 'bg-amber-50' : ''}`}>
                  <div className="flex gap-4">

                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelect(notif.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        onClick={e => e.stopPropagation()} />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`${color} p-3 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block align-middle" />
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{notif.message}</p>

                      {/* Data extras */}
                      {notif.data?.lead_name && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{notif.data.lead_name}</span>
                        </div>
                      )}
                      {notif.data?.listing_title && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Building2 className="w-3 h-3" />
                          <span>{notif.data.listing_title}</span>
                        </div>
                      )}
                      {notif.type === 'property' && notif.data?.views && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span>{parseInt(notif.data.views).toLocaleString('fr-FR')} views</span>
                        </div>
                      )}
                      {notif.type === 'offer' && notif.data?.amount && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          <span>{notif.data.amount}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button onClick={(e) => handleDeleteOne(notif.id, e)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backdrop to close filter menu */}
      {showFilterMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowFilterMenu(false)} />
      )}
    </div>
  );
};

export default AgentNotifications;