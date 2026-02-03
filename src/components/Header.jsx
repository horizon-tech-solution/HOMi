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
  MapPin
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <>
      {/* Header - Floating on scroll */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-3' 
            : 'bg-white py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Building2 className="w-8 h-8 text-primary-600 transition-transform group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full animate-ping"></div>
              </div>
              <span className="hidden sm:block text-xl font-bolder text-gray-900">
                HOM<span className='text-amber-600'>i</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/properties" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                Browse
              </Link>
              <Link 
                to="/sell" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                Sell 
              </Link>
              <Link 
                to="/find-agent" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                Find An Agent 
              </Link>
              <Link 
                to="/help" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                Get Help
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              
              {user ? (
                <>
                  {/* Search Button - Hidden on mobile */}
                  <button 
                    onClick={() => navigate('/properties')}
                    className="hidden md:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <Search className="w-5 h-5" />
                    <span className="text-sm">Search</span>
                  </button>

                  {/* Favorites */}
                  <Link
                    to="/user/favorites"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </button>

                    {/* Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          {isAgent && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                              Verified Agent
                            </span>
                          )}
                        </div>

                        <div className="py-2">
                          <Link
                            to="/user/home"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="text-sm">Dashboard</span>
                          </Link>

                          {isAgent && (
                            <Link
                              to="/agent/create-listing"
                              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">Create Listing</span>
                            </Link>
                          )}

                          

                          {!isAgent && (
                            <Link
                              to="/user/become-agent"
                              className="flex items-center space-x-3 px-4 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
                            >
                              <Building2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Become an Agent</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-200 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/user/auth"
                    className="hidden md:inline-block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
                  >
                    Login
                  </Link>
                  
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16"></div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel - Slides from right */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {/* User Info (if logged in) */}
              {user ? (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  {isAgent && (
                    <span className="inline-block mt-3 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      Verified Agent
                    </span>
                  )}
                </div>
              ) : (
                <div className="mb-6 space-y-3">
                  <Link
                    to="/user/auth"
                    className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Login
                  </Link>
                 
                </div>
              )}

              {/* Mobile Search */}
              <Link
                to="/properties"
                className="flex items-center space-x-3 w-full px-4 py-3 mb-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
              >
                <Search className="w-5 h-5" />
                <span>Search Properties</span>
              </Link>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  to="/properties"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Browse Properties</span>
                </Link>

                <Link
                  to="/properties"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Map View</span>
                </Link>

                {user && (
                  <>
                    <Link
                      to="/user/home"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/user/favorites"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <Heart className="w-5 h-5" />
                      <span>My Favorites</span>
                    </Link>

                    {isAgent && (
                      <Link
                        to="/agent/create-listing"
                        className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-all font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create Listing</span>
                      </Link>
                    )}
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link
                    to="/pricing"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <span>Pricing</span>
                  </Link>

                  <Link
                    to="/how-it-works"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <span>How It Works</span>
                  </Link>

                  {!isAgent && user && (
                    <Link
                      to="/user/become-agent"
                      className="flex items-center space-x-3 px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium"
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Become an Agent</span>
                    </Link>
                  )}
                </div>

                {user && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;