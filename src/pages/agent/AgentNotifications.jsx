import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../components/AgentNav';
import { 
  Bell,
  BellOff,
  Check,
  Trash2,
  Filter,
  ChevronDown,
  X,
  MessageSquare,
  Eye,
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Building2,
  User,
  Star
} from 'lucide-react';

const AgentNotifications = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Mock data - replace with actual API calls
  const notifications = [
    {
      id: 1,
      type: 'lead',
      title: 'New Lead Inquiry',
      message: 'Jean Paul Mbarga is interested in "Modern 3BR Apartment in Bonamoussadi"',
      timestamp: '5 minutes ago',
      read: false,
      icon: MessageSquare,
      iconColor: 'bg-blue-500',
      link: '/agent/leads/1',
      data: {
        leadName: 'Jean Paul Mbarga',
        propertyTitle: 'Modern 3BR Apartment in Bonamoussadi'
      }
    },
    {
      id: 2,
      type: 'viewing',
      title: 'Viewing Request',
      message: 'Marie Claire Ndongo requested a viewing for Saturday, 10:00 AM',
      timestamp: '1 hour ago',
      read: false,
      icon: Calendar,
      iconColor: 'bg-purple-500',
      link: '/agent/leads/2',
      data: {
        leadName: 'Marie Claire Ndongo',
        date: 'Saturday, 10:00 AM'
      }
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Patrick Ewondo',
      timestamp: '3 hours ago',
      read: false,
      icon: MessageSquare,
      iconColor: 'bg-green-500',
      link: '/agent/leads/3',
      data: {
        leadName: 'Patrick Ewondo'
      }
    },
    {
      id: 4,
      type: 'property',
      title: 'Property Views Milestone',
      message: 'Your property "Luxury Villa with Pool" reached 500 views!',
      timestamp: '5 hours ago',
      read: true,
      icon: Eye,
      iconColor: 'bg-amber-500',
      link: '/agent/listings/102',
      data: {
        propertyTitle: 'Luxury Villa with Pool',
        views: 500
      }
    },
    {
      id: 5,
      type: 'favorite',
      title: 'Property Favorited',
      message: '3 users added "4BR Family House" to their favorites',
      timestamp: '1 day ago',
      read: true,
      icon: Heart,
      iconColor: 'bg-red-500',
      link: '/agent/listings/104',
      data: {
        propertyTitle: '4BR Family House',
        count: 3
      }
    },
    {
      id: 6,
      type: 'offer',
      title: 'New Offer Received',
      message: 'Sophie Kamga made an offer of 115,000,000 FCFA',
      timestamp: '2 days ago',
      read: true,
      icon: DollarSign,
      iconColor: 'bg-green-600',
      link: '/agent/leads/4',
      data: {
        leadName: 'Sophie Kamga',
        amount: '115,000,000 FCFA'
      }
    },
    {
      id: 7,
      type: 'review',
      title: 'New Review',
      message: 'David Nkoulou left a 5-star review',
      timestamp: '3 days ago',
      read: true,
      icon: Star,
      iconColor: 'bg-yellow-500',
      link: '/agent/profile',
      data: {
        leadName: 'David Nkoulou',
        rating: 5
      }
    },
    {
      id: 8,
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your professional certifications',
      timestamp: '1 week ago',
      read: true,
      icon: AlertCircle,
      iconColor: 'bg-orange-500',
      link: '/agent/profile',
      data: {}
    },
    {
      id: 9,
      type: 'success',
      title: 'Property Sold',
      message: 'Congratulations! "Modern 3BR Apartment" has been marked as sold',
      timestamp: '1 week ago',
      read: true,
      icon: CheckCircle,
      iconColor: 'bg-green-500',
      link: '/agent/listings/101',
      data: {
        propertyTitle: 'Modern 3BR Apartment'
      }
    },
    {
      id: 10,
      type: 'analytics',
      title: 'Weekly Report Available',
      message: 'Your weekly performance report is ready to view',
      timestamp: '1 week ago',
      read: true,
      icon: TrendingUp,
      iconColor: 'bg-blue-600',
      link: '/agent/analytics',
      data: {}
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { value: 'lead', label: 'Leads', count: notifications.filter(n => n.type === 'lead').length },
    { value: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { value: 'viewing', label: 'Viewings', count: notifications.filter(n => n.type === 'viewing').length },
    { value: 'property', label: 'Property Updates', count: notifications.filter(n => n.type === 'property').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      // API call to mark as read
      console.log('Mark as read:', notification.id);
    }
    
    // Navigate to the link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = () => {
    if (selectedNotifications.length > 0) {
      // API call to mark selected as read
      console.log('Mark as read:', selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleMarkAllAsRead = () => {
    // API call to mark all as read
    console.log('Mark all as read');
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedNotifications.length} notification(s)?`)) {
      // API call to delete
      console.log('Delete:', selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Delete all notifications? This action cannot be undone.')) {
      // API call to delete all
      console.log('Delete all notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={2} unreadNotifications={unreadCount} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your property activities and leads
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <BellOff className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.filter(n => {
                    const days = ['5 minutes ago', '1 hour ago', '3 hours ago', '5 hours ago', '1 day ago', '2 days ago', '3 days ago'];
                    return days.includes(n.timestamp);
                  }).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left side - Filter and Select */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">
                    {filterOptions.find(f => f.value === selectedFilter)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    {filterOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedFilter === option.value ? 'bg-amber-50 text-amber-600' : ''
                        }`}
                      >
                        <span>{option.label}</span>
                        <span className="text-sm text-gray-500">({option.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Select All */}
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="font-medium">Select All</span>
              </button>

              {selectedNotifications.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedNotifications.length > 0 ? (
                <>
                  <button
                    onClick={handleMarkAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Read
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Mark All Read
                    </button>
                  )}
                  <button
                    onClick={handleDeleteAll}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {selectedFilter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${filterOptions.find(f => f.value === selectedFilter)?.label.toLowerCase()} notifications.`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              const isSelected = selectedNotifications.includes(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${isSelected ? 'bg-amber-50' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`${notification.iconColor} p-3 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {notification.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                      
                      {/* Additional metadata based on type */}
                      {notification.type === 'lead' && notification.data.leadName && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{notification.data.leadName}</span>
                        </div>
                      )}
                      
                      {notification.type === 'property' && notification.data.views && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span>{notification.data.views} views</span>
                        </div>
                      )}
                      
                      {notification.type === 'offer' && notification.data.amount && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          <span>{notification.data.amount}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this notification?')) {
                          console.log('Delete notification:', notification.id);
                        }
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Click outside to close filter menu */}
      {showFilterMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowFilterMenu(false)}
        />
      )}
    </div>
  );
};

export default AgentNotifications;