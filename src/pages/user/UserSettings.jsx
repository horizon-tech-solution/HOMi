import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff, 
  MapPin,
  CreditCard,
  Globe,
  Shield,
  Trash2,
  Save,
  Camera,
  AlertCircle
} from 'lucide-react';
import UserNav from '../../components/UserNav';

const UserSettings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Kamga',
    email: 'john.kamga@example.com',
    phone: '+237 675 123 456',
    location: 'Douala, Cameroon',
    bio: 'Looking for a family home in Douala'
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: {
      priceDrops: true,
      newListings: true,
      messages: true,
      savedSearches: true,
      recommendations: false
    },
    push: {
      priceDrops: true,
      newListings: false,
      messages: true,
      savedSearches: false,
      recommendations: false
    }
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const updateProfile = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const toggleNotification = (channel, type) => {
    setNotifications({
      ...notifications,
      [channel]: {
        ...notifications[channel],
        [type]: !notifications[channel][type]
      }
    });
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'account', label: 'Account', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <UserNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                      ${activeSection === section.id
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                      </div>
                      <button className="absolute bottom-0 right-0 w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-700 transition-all">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h3>
                      <p className="text-sm text-gray-600">Member since Jan 2024</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => updateProfile('firstName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => updateProfile('lastName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => updateProfile('email', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                  <p className="text-gray-600 mb-6">Choose how you want to be notified</p>

                  {/* Email Notifications */}
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-amber-600" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <NotificationToggle
                        label="Price drop alerts"
                        description="Get notified when saved properties drop in price"
                        checked={notifications.email.priceDrops}
                        onChange={() => toggleNotification('email', 'priceDrops')}
                      />
                      <NotificationToggle
                        label="New listing matches"
                        description="Properties matching your saved searches"
                        checked={notifications.email.newListings}
                        onChange={() => toggleNotification('email', 'newListings')}
                      />
                      <NotificationToggle
                        label="Messages from agents"
                        description="Responses to your inquiries"
                        checked={notifications.email.messages}
                        onChange={() => toggleNotification('email', 'messages')}
                      />
                      <NotificationToggle
                        label="Saved search updates"
                        description="Weekly summary of new matches"
                        checked={notifications.email.savedSearches}
                        onChange={() => toggleNotification('email', 'savedSearches')}
                      />
                      <NotificationToggle
                        label="Personalized recommendations"
                        description="Properties we think you'll love"
                        checked={notifications.email.recommendations}
                        onChange={() => toggleNotification('email', 'recommendations')}
                      />
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-600" />
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      <NotificationToggle
                        label="Price drop alerts"
                        description="Instant alerts for price drops"
                        checked={notifications.push.priceDrops}
                        onChange={() => toggleNotification('push', 'priceDrops')}
                      />
                      <NotificationToggle
                        label="New listing matches"
                        description="Real-time listing alerts"
                        checked={notifications.push.newListings}
                        onChange={() => toggleNotification('push', 'newListings')}
                      />
                      <NotificationToggle
                        label="Messages from agents"
                        description="Instant message notifications"
                        checked={notifications.push.messages}
                        onChange={() => toggleNotification('push', 'messages')}
                      />
                    </div>
                  </div>

                  <button className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Security Settings</h2>
                  <p className="text-gray-600 mb-6">Keep your account secure</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all">
                    Update Password
                  </button>

                  {/* Two-Factor Authentication */}
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-1">Two-Factor Authentication</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
                  <p className="text-gray-600 mb-6">Control your privacy preferences</p>

                  <div className="space-y-4">
                    <div className="p-4 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">Profile Visibility</h4>
                          <p className="text-sm text-gray-600">Make your profile visible to agents</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">Show Viewing History</h4>
                          <p className="text-sm text-gray-600">Let agents see properties you've viewed</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">Data Sharing</h4>
                          <p className="text-sm text-gray-600">Share anonymous data to improve HOMi</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Section */}
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Account Management</h2>
                  <p className="text-gray-600 mb-6">Manage your account and data</p>

                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <h4 className="font-bold text-amber-900 mb-2">Become a Professional</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        List properties, connect with buyers, and grow your business
                      </p>
                      <button className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all">
                        Upgrade to Agent Account
                      </button>
                    </div>

                    <div className="p-4 border-2 border-gray-200 rounded-xl">
                      <h4 className="font-bold text-gray-900 mb-2">Download Your Data</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Get a copy of all your data including favorites, searches, and messages
                      </p>
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                        Request Data Export
                      </button>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-bold text-red-900 mb-2">Delete Account</h4>
                          <p className="text-sm text-red-700 mb-3">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
      </label>
    </div>
  );
};

export default UserSettings;