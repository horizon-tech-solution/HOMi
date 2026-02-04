import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ArrowRight, Home as HomeIcon, TrendingUp, Clock, Star, ChevronLeft, ChevronRight, CheckCircle, Shield, Users } from 'lucide-react';
import Button from '../../components/Button';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

// Import your illustrations
import buyHomeIcon from '../../assets/images/buy-home.svg';
import rentHomeIcon from '../../assets/images/rent-home.svg';
import sellHomeIcon from '../../assets/images/sell-home.svg';

// NEW ILLUSTRATIONS TO ADD
import heroAccentIcon from '../../assets/images/hero-accent.svg'; // Decorative house/buildings accent
import emptyStateIcon from '../../assets/images/empty-state.svg'; // When no properties found
import searchIllustration from '../../assets/images/search-illustration.svg'; // Step 1: Search
import connectIllustration from '../../assets/images/connect-illustration.svg'; // Step 2: Connect
import moveInIllustration from '../../assets/images/move-in-illustration.svg'; // Step 3: Move in
import trustBadgeIcon from '../../assets/images/trust-badge.svg'; // Trust/security icon
import verifiedIcon from '../../assets/images/verified-icon.svg'; // Verification icon
import supportIcon from '../../assets/images/support-icon.svg'; // 24/7 support icon

const CITIES = [
  { id: 'douala', name: 'Douala' },
  { id: 'yaounde', name: 'Yaoundé' }
];

const MOCK_FEATURED_LISTINGS = [
  {
    id: 1,
    title: 'Modern 3BR Apartment in Bonanjo',
    price: 75000,
    location: 'Bonanjo, Douala',
    address: 'Bonanjo, Douala',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    type: 'For Rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'],
    isFavorited: false
  },
  {
    id: 2,
    title: 'Luxury Villa with Swimming Pool',
    price: 250000,
    location: 'Bastos, Yaoundé',
    address: 'Bastos, Yaoundé',
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    type: 'For Sale',
    listingType: 'For Sale',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop'],
    isFavorited: false
  },
  {
    id: 3,
    title: 'Cozy Studio Apartment',
    price: 35000,
    location: 'Akwa, Douala',
    address: 'Akwa, Douala',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    type: 'For Rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
    isFavorited: false
  },
  {
    id: 4,
    title: 'Spacious 4BR Family House',
    price: 180000,
    location: 'Bepanda, Douala',
    address: 'Bepanda, Douala',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    type: 'For Sale',
    listingType: 'For Sale',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'],
    isFavorited: false
  },
  {
    id: 5,
    title: 'Commercial Space in City Center',
    price: 120000,
    location: 'Centre Ville, Douala',
    address: 'Centre Ville, Douala',
    bedrooms: 0,
    bathrooms: 2,
    area: 150,
    type: 'For Rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'],
    isFavorited: false
  },
  {
    id: 6,
    title: 'Elegant 2BR Apartment with Garden',
    price: 65000,
    location: 'Nlongkak, Yaoundé',
    address: 'Nlongkak, Yaoundé',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    type: 'For Rent',
    listingType: 'For Rent',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop'],
    isFavorited: false
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      setTimeout(() => {
        setFeaturedListings(MOCK_FEATURED_LISTINGS);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchType) params.append('type', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  // Horizontal scroll functions
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollButtons();
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [featuredListings]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-20 sm:pt-24 pb-24 sm:pb-32 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhCNTMzRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60"></div>
        
        {/* NEW: Decorative accent illustration - top right */}
        <div className="absolute top-10 right-0 w-64 h-64 md:w-96 md:h-96 opacity-10 pointer-events-none hidden lg:block">
          <img 
            src={heroAccentIcon} 
            alt="" 
            className="w-full h-full object-contain animate-float"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-14">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
              Find Your Perfect Home in Cameroon
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-amber-800 font-medium px-4">
              Browse verified properties from trusted agents across Douala and Yaoundé
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-amber-100 p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                  <MapPin className="w-4 h-4 inline mr-2 text-amber-700" />
                  Location
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-gray-900 font-medium bg-gray-50 hover:bg-white transition-colors text-sm sm:text-base"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                  <HomeIcon className="w-4 h-4 inline mr-2 text-amber-700" />
                  Property Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-gray-900 font-medium bg-gray-50 hover:bg-white transition-colors text-sm sm:text-base"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  icon={Search}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg"
                >
                  Search Properties
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buy, Rent, Sell Cards Section */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            
            {/* Buy a home */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-100 group">
              <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto mb-6 sm:mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={buyHomeIcon} 
                  alt="Buy a home" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">Buy a home</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed font-medium">
                Find the perfect property with transparent pricing and expert guidance every step of the way.
              </p>
              <Link to="/properties?type=sale">
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  Find properties for sale
                </Button>
              </Link>
            </div>

            {/* Rent a home */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 group">
              <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto mb-6 sm:mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={rentHomeIcon} 
                  alt="Rent a home" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">Rent a home</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed font-medium">
                Browse the largest selection of rental properties and move in with confidence.
              </p>
              <Link to="/properties?type=rent">
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  Find rentals
                </Button>
              </Link>
            </div>

            {/* Sell a home */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100 group">
              <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto mb-6 sm:mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={sellHomeIcon} 
                  alt="Sell a home" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">Sell a home</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed font-medium">
                List your property and connect with thousands of potential buyers today.
              </p>
              <Link to="/become-agent">
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: How It Works Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              How HOMi Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Find your dream home in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
            {/* Step 1: Search */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={searchIllustration} 
                    alt="Search properties" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Search & Filter</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                Browse hundreds of verified listings with advanced filters to find exactly what you need
              </p>
            </div>

            {/* Step 2: Connect */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={connectIllustration} 
                    alt="Connect with agents" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Connect with Agents</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                Chat directly with verified property owners and trusted real estate agents
              </p>
            </div>

            {/* Step 3: Move In */}
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={moveInIllustration} 
                    alt="Move into your home" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Move In</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                Complete the process securely and move into your perfect home with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties - HORIZONTAL SCROLL */}
      <section className="py-16 sm:py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 sm:mb-3">
                Explore homes on HOMi
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
                Swipe to browse available properties
              </p>
            </div>
            <Link to="/properties" className="hidden md:flex items-center text-amber-700 hover:text-amber-800 font-bold text-lg group">
              View all
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading properties..." />
          ) : featuredListings.length > 0 ? (
            <div className="relative">
              {/* Scroll Buttons - Desktop */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center text-gray-700 hover:bg-amber-600 hover:text-white transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center text-gray-700 hover:bg-amber-600 hover:text-white transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Horizontal Scroll Container */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 snap-x snap-mandatory"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {featuredListings.map(listing => (
                  <div key={listing.id} className="flex-shrink-0 w-[280px] sm:w-[340px] md:w-[380px] snap-start">
                    <PropertyCard listing={listing} />
                  </div>
                ))}
              </div>

              {/* Scroll indicator dots - Mobile */}
              <div className="flex md:hidden justify-center gap-2 mt-6">
                <div className="h-1.5 w-8 bg-amber-600 rounded-full"></div>
                <div className="h-1.5 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-1.5 w-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            
          ) : (
            /* NEW: Enhanced empty state with illustration */
            <div className="text-center py-16 sm:py-20">
              <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
                <img 
                  src={emptyStateIcon} 
                  alt="No properties found" 
                  className="w-full h-full object-contain opacity-80"
                />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">No properties available yet</h3>
              <p className="text-gray-600 text-base sm:text-lg mb-8 font-medium max-w-md mx-auto">
                Check back soon for new listings or adjust your search filters
              </p>
              <Link to="/properties">
                <Button size="lg">Browse All Properties</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link to="/properties">
              <Button icon={ArrowRight} size="lg" className="text-sm sm:text-base">
                Show me more
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: Why Choose HOMi Section */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Why Choose HOMi?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Your trusted partner in finding the perfect home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
            {/* Trust Badge */}
            <div className="text-center group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={trustBadgeIcon} 
                  alt="Trusted platform" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">100% Verified</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                Every property and agent is thoroughly verified for your safety and peace of mind
              </p>
            </div>

            {/* Verified Icon */}
            <div className="text-center group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={verifiedIcon} 
                  alt="Transparent pricing" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Transparent Pricing</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                No hidden fees. What you see is what you get with clear, upfront pricing
              </p>
            </div>

            {/* Support Icon */}
            <div className="text-center group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={supportIcon} 
                  alt="24/7 support" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium px-4">
                Our dedicated team is always here to help you find your perfect home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 sm:py-20 bg-gray-50 border-y-2 border-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 mr-2" />
                <div className="text-3xl sm:text-4xl font-black text-gray-900">12</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">New listings today</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-amber-700 mr-2" />
                <div className="text-3xl sm:text-4xl font-black text-gray-900">47</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Active viewers now</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 mr-2" />
                <div className="text-3xl sm:text-4xl font-black text-gray-900">156</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Homes sold this month</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-amber-700 mr-2" />
                <div className="text-3xl sm:text-4xl font-black text-gray-900">500+</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Total listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              Find Your Perfect Home Today
            </h2>
            <p className="text-lg sm:text-xl text-amber-100 mb-8 sm:mb-10 leading-relaxed font-medium px-4">
              Join thousands of people who found their dream property in Cameroon. Start your journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
              <Link to="/properties" className="w-full sm:w-auto">
                <Button variant="secondary" icon={Search} size="lg" className="w-full bg-white text-amber-700 hover:bg-amber-50 text-sm sm:text-base">
                  Browse All Properties
                </Button>
              </Link>
              <Link to="/user/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-amber-700 hover:bg-amber-50 text-sm sm:text-base">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-start {
          scroll-snap-align: start;
        }
        
        /* Float animation for hero accent */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;