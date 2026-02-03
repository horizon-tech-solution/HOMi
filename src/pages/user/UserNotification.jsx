import { useState } from 'react';
import { Bell, BellOff, Check, Trash2, Heart, MessageSquare, AlertCircle, TrendingUp, X, Send } from 'lucide-react';
import UserNav from '../../components/UserNav';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'price_drop',
      icon: TrendingUp,
      title: 'Price drop on saved property',
      message: 'Modern 3BR Apartment in Bonanjo dropped by 2,000,000 FCFA',
      time: '5 minutes ago',
      read: false,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200',
      propertyId: 1
    },
    {
      id: 2,
      type: 'message',
      icon: MessageSquare,
      title: 'New message from agent',
      message: 'John Kamga responded to your inquiry about the villa in Bastos',
      time: '1 hour ago',
      read: false,
      agentName: 'John Kamga',
      agentMessage: 'Hi! Yes, the villa is still available. When would you like to schedule a viewing?'
    },
    {
      id: 3,
      type: 'new_listing',
      icon: Bell,
      title: 'New listing matches your search',
      message: '3 new apartments in Douala matching "2-3 bedrooms, Akwa"',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'favorite',
      icon: Heart,
      title: 'Property you liked is back',
      message: 'Studio apartment in Ngoa-Ekelle is available again',
      time: '1 day ago',
      read: true,
      propertyId: 3
    },
    {
      id: 5,
      type: 'alert',
      icon: AlertCircle,
      title: 'Viewing reminder',
      message: 'You have a property viewing scheduled for tomorrow at 2:00 PM',
      time: '2 days ago',
      read: true
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleReply = (notification) => {
    setSelectedNotification(notification);
    setShowReplyModal(true);
  };

  const handleViewMore = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    markAsRead(notification.id);
  };

  const sendReply = () => {
    console.log('Sending reply:', replyMessage);
    setShowReplyModal(false);
    setReplyMessage('');
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNav unreadCount={unreadCount} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Notifications
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-amber-600 font-semibold hover:bg-amber-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-all"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={notifications.length}
            />
            <FilterButton
              active={filter === 'unread'}
              onClick={() => setFilter('unread')}
              label="Unread"
              count={unreadCount}
            />
            <FilterButton
              active={filter === 'price_drop'}
              onClick={() => setFilter('price_drop')}
              label="Price drops"
              icon={TrendingUp}
            />
            <FilterButton
              active={filter === 'message'}
              onClick={() => setFilter('message')}
              label="Messages"
              icon={MessageSquare}
            />
            <FilterButton
              active={filter === 'new_listing'}
              onClick={() => setFilter('new_listing')}
              label="New listings"
              icon={Bell}
            />
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No notifications match this filter'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0
                ? 'We\'ll notify you about price drops, new listings, and messages'
                : 'Try selecting a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
                onReply={handleReply}
                onViewMore={handleViewMore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedNotification && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowReplyModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Reply to {selectedNotification.agentName}
                </h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Their message:</p>
                <p className="text-gray-900">{selectedNotification.agentMessage}</p>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={sendReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedNotification && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowDetailsModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Notification Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {selectedNotification.image && (
                <img
                  src={selectedNotification.image}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}

              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">
                  {selectedNotification.title}
                </h4>
                <p className="text-gray-600 mb-2">
                  {selectedNotification.message}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedNotification.time}
                </p>
              </div>

              {selectedNotification.propertyId && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    window.location.href = `/properties?property=${selectedNotification.propertyId}`;
                  }}
                  className="w-full px-4 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all"
                >
                  View Property
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, count, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2
        ${active
          ? 'bg-amber-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {count !== undefined && (
        <span className={`
          ml-1 px-2 py-0.5 rounded-full text-xs font-bold
          ${active ? 'bg-amber-700' : 'bg-gray-200'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
};

const NotificationCard = ({ notification, onMarkRead, onDelete, onReply, onViewMore }) => {
  const Icon = notification.icon;
  
  const iconColors = {
    price_drop: 'bg-green-100 text-green-600',
    message: 'bg-blue-100 text-blue-600',
    new_listing: 'bg-amber-100 text-amber-600',
    favorite: 'bg-red-100 text-red-600',
    alert: 'bg-purple-100 text-purple-600'
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-4 sm:p-5 transition-all hover:shadow-md
        ${notification.read 
          ? 'opacity-70' 
          : 'shadow-sm border-l-4 border-amber-600 bg-gradient-to-r from-amber-50 to-white'
        }
      `}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${iconColors[notification.type] || 'bg-gray-100 text-gray-600'}
        `}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`
              font-bold
              ${notification.read ? 'text-gray-700' : 'text-gray-900'}
            `}>
              {notification.title}
              {!notification.read && (
                <span className="ml-2 inline-block w-2 h-2 bg-amber-600 rounded-full"></span>
              )}
            </h3>
            <button
              onClick={() => onDelete(notification.id)}
              className="p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {notification.message}
          </p>

          {notification.image && (
            <div className="mb-3">
              <img
                src={notification.image}
                alt=""
                className="w-full sm:w-48 h-24 sm:h-28 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-gray-500">{notification.time}</span>
            <div className="flex gap-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                >
                  Mark as read
                </button>
              )}
              {notification.type === 'message' && (
                <button
                  onClick={() => onReply(notification)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Reply
                </button>
              )}
              <button
                onClick={() => onViewMore(notification)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
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