import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Trash2, Heart, MessageSquare, AlertCircle, TrendingUp, X, Send, Loader2 } from 'lucide-react';
import UserNav from '../../components/UserNav';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications,
} from '../../api/users/notification';
import alertImage from '../../assets/images/alert.svg';

const iconMap = {
  price_drop:  TrendingUp,
  message:     MessageSquare,
  new_listing: Bell,
  favorite:    Heart,
  alert:       AlertCircle,
  system:      Bell,
};

const colorMap = {
  price_drop:  'bg-green-100 text-green-600',
  message:     'bg-blue-100 text-blue-600',
  new_listing: 'bg-amber-100 text-amber-600',
  favorite:    'bg-red-100 text-red-600',
  alert:       'bg-purple-100 text-purple-600',
  system:      'bg-gray-100 text-gray-600',
};

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const [filter, setFilter]                             = useState('all');
  const [showReplyModal, setShowReplyModal]              = useState(false);
  const [showDetailsModal, setShowDetailsModal]          = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [replyMessage, setReplyMessage]                 = useState('');
  const [deletingId, setDeletingId]                     = useState(null);

  useEffect(() => {
    fetchNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    } catch {}
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch {}
  };

  const handleReply = (notification) => {
    setSelectedNotification(notification);
    setShowReplyModal(true);
  };

  const handleViewMore = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    if (!notification.read_at) handleMarkRead(notification.id);
  };

  const sendReply = () => {
    // TODO: wire to messaging API
    setShowReplyModal(false);
    setReplyMessage('');
    setSelectedNotification(null);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.read_at;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav unreadCount={unreadCount} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="px-4 py-2 text-amber-600 font-semibold hover:bg-amber-50 rounded-lg transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" /> Mark all read
                </button>
              )}
              <button onClick={handleClearAll} className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-all">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            <FilterButton active={filter === 'all'}         onClick={() => setFilter('all')}         label="All"          count={notifications.length} />
            <FilterButton active={filter === 'unread'}      onClick={() => setFilter('unread')}      label="Unread"       count={unreadCount} />
            <FilterButton active={filter === 'price_drop'}  onClick={() => setFilter('price_drop')}  label="Price drops"  icon={TrendingUp} />
            <FilterButton active={filter === 'message'}     onClick={() => setFilter('message')}     label="Messages"     icon={MessageSquare} />
            <FilterButton active={filter === 'new_listing'} onClick={() => setFilter('new_listing')} label="New listings" icon={Bell} />
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <img
              src={alertImage}
              alt="No notifications"
              className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No notifications match this filter'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0
                ? "We'll notify you about price drops, new listings, and messages"
                : 'Try selecting a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                onReply={handleReply}
                onViewMore={handleViewMore}
                deleting={deletingId === notification.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedNotification && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowReplyModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Reply</h3>
                <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Their message:</p>
                <p className="text-gray-900">{selectedNotification.message}</p>
              </div>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowReplyModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={sendReply} disabled={!replyMessage.trim()} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Reply
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedNotification && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDetailsModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Notification Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">{selectedNotification.title}</h4>
                <p className="text-gray-600 mb-2">{selectedNotification.message}</p>
                <p className="text-sm text-gray-500">{new Date(selectedNotification.created_at).toLocaleString()}</p>
              </div>
              {selectedNotification.data?.listing_id && (
                <button
                  onClick={() => { setShowDetailsModal(false); window.location.href = `/properties?property=${selectedNotification.data.listing_id}`; }}
                  className="w-full px-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all"
                >
                  View Property
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FilterButton = ({ active, onClick, label, count, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
      active ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
    {count !== undefined && (
      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-amber-700' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

const NotificationCard = ({ notification, onMarkRead, onDelete, onReply, onViewMore, deleting }) => {
  const Icon  = iconMap[notification.type]  || Bell;
  const color = colorMap[notification.type] || 'bg-gray-100 text-gray-600';
  const isRead = !!notification.read_at;

  const data = typeof notification.data === 'string'
    ? JSON.parse(notification.data || '{}')
    : (notification.data || {});

  return (
    <div className={`bg-white rounded-xl p-4 sm:p-5 transition-all hover:shadow-md ${
      isRead ? 'opacity-70' : 'shadow-sm border-l-4 border-amber-600 bg-gradient-to-r from-amber-50 to-white'
    }`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-bold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
              {!isRead && <span className="ml-2 inline-block w-2 h-2 bg-amber-600 rounded-full" />}
            </h3>
            <button
              onClick={() => onDelete(notification.id)}
              disabled={deleting}
              className="p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Trash2 className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
            <div className="flex gap-2">
              {!isRead && (
                <button onClick={() => onMarkRead(notification.id)} className="px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                  Mark as read
                </button>
              )}
              {notification.type === 'message' && (
                <button onClick={() => onReply(notification)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  Reply
                </button>
              )}
              <button onClick={() => onViewMore(notification)} className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                View details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;