import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Menu, 
  X, 
  Search,
  Heart,
  User,
  Bell,
  LogOut,
  Settings,
  LayoutDashboard,
  Plus,
  MapPin,
  ChevronRight,
  Home
} from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from localStorage (replace with your auth logic)
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAgent = user?.role === 'agent';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <>
      {/* Header - Fixed with proper z-index */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-md' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Optimized for mobile */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="relative">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                HOM<span className='text-amber-600'>i</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/properties" 
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-medium"
              >
                Browse
              </Link>
              <Link 
                to="/sell" 
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-medium"
              >
                Sell 
              </Link>
              <Link 
                to="/find-agent" 
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-medium"
              >
                Find Agent 
              </Link>
              <Link 
                to="/help" 
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-medium"
              >
                Help
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {user ? (
                <>
                  {/* Search Button - Compact on mobile */}
                  <button 
                    onClick={() => navigate('/properties')}
                    className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    aria-label="Search properties"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Favorites - Mobile optimized */}
                  <Link
                    to="/user/favorites"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    aria-label="Favorites"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                  
                  {/* Profile Dropdown - Desktop only */}
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </button>

                    {/* Desktop Dropdown */}
                    {isProfileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            {isAgent && (
                              <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                Verified Agent
                              </span>
                            )}
                          </div>

                          <div className="py-2">
                            <Link
                              to="/user/home"
                              className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span className="text-sm">Dashboard</span>
                            </Link>

                            {isAgent && (
                              <Link
                                to="/agent/create-listing"
                                className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Create Listing</span>
                              </Link>
                            )}

                            {!isAgent && (
                              <Link
                                to="/user/become-agent"
                                className="flex items-center space-x-3 px-4 py-2.5 text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Become an Agent</span>
                              </Link>
                            )}
                          </div>

                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/user/auth"
                    className="hidden sm:inline-block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/user/auth"
                    className="sm:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    aria-label="Login"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all ml-1"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16"></div>

      {/* Mobile Menu - Full Screen Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop with animation */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel - Full height, slide from right */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-bold text-gray-900">
                  HOM<span className='text-amber-600'>i</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* User Info (if logged in) */}
                {user ? (
                  <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAgent && (
                      <span className="inline-block px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs rounded-full font-medium shadow-sm">
                        ✓ Verified Agent
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 space-y-3">
                    <Link
                      to="/user/auth"
                      className="block w-full text-center px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-semibold shadow-sm"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <Link
                    to="/properties"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-center"
                  >
                    <Search className="w-6 h-6 text-amber-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Search</span>
                  </Link>
                  <Link
                    to="/properties?view=map"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-center"
                  >
                    <MapPin className="w-6 h-6 text-amber-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Map View</span>
                  </Link>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                    Main Menu
                  </div>
                  
                  <Link
                    to="/properties"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="font-medium">Browse Properties</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/sell"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="font-medium">Sell Property</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/find-agent"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      <span className="font-medium">Find an Agent</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {user && (
                    <>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">
                        My Account
                      </div>
                      
                      <Link
                        to="/user/home"
                        className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <LayoutDashboard className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                          <span className="font-medium">Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>

                      <Link
                        to="/user/favorites"
                        className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                          <span className="font-medium">My Favorites</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>

                      {isAgent && (
                        <Link
                          to="/agent/create-listing"
                          className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group border border-amber-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Plus className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold">Create Listing</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-amber-600" />
                        </Link>
                      )}

                      {!isAgent && (
                        <Link
                          to="/user/become-agent"
                          className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group border border-amber-200 mt-4"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold">Become an Agent</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-amber-600" />
                        </Link>
                      )}
                    </>
                  )}

                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">
                    More
                  </div>

                  <Link
                    to="/help"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <span className="font-medium">Help & Support</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/pricing"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <span className="font-medium">Pricing</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to="/how-it-works"
                    className="flex items-center justify-between px-4 py-3.5 text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <span className="font-medium">How It Works</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </nav>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            {user && (
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;