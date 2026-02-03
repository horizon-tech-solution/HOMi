import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ArrowRight, Home as HomeIcon, TrendingUp, Clock, Star } from 'lucide-react';
import Button from '../../components/Button';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

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

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-0 via-white to-orange-10 pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhCNTMzRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black-900 mb-6 leading-tight tracking-tight">
              Find Your Perfect Home in Cameroon
            </h1>
            <p className="text-xl md:text-2xl text-amber-800 font-medium">
              Browse verified properties from trusted agents across Douala and Yaoundé
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-l border-2 border-amber-100 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2 text-amber-700" />
                  Location
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-gray-900 font-medium bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  <HomeIcon className="w-4 h-4 inline mr-2 text-amber-700" />
                  Property Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-gray-900 font-medium bg-gray-50 hover:bg-white transition-colors"
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
                  className="w-full h-14 text-lg"
                >
                  Search Properties
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buy, Rent, Sell Cards Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Buy a home */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-10 text-center shadow-lg hover:shadow-l transition-all duration-300 border-2 border-amber-100 group">
              <div className="w-56 h-56 mx-auto mb-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  <circle cx="100" cy="100" r="90" fill="#FEF3C7"/>
                  <ellipse cx="100" cy="140" rx="50" ry="20" fill="#FDE68A"/>
                  <path d="M 60 100 Q 60 80 80 80 Q 80 90 90 90 L 90 140 L 60 140 Z" fill="#10B981"/>
                  <circle cx="110" cy="70" r="25" fill="#B45309"/>
                  <circle cx="115" cy="65" r="8" fill="#D97706"/>
                  <path d="M 95 90 Q 95 85 100 85 L 100 140 L 95 140 Z" fill="#059669"/>
                  <rect x="130" y="100" width="30" height="40" fill="#92400E" rx="2"/>
                  <rect x="140" y="110" width="10" height="10" fill="#D97706" rx="1"/>
                  <rect x="140" y="125" width="10" height="15" fill="#F59E0B" rx="1"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Buy a home</h3>
              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                Find the perfect property with transparent pricing and expert guidance every step of the way.
              </p>
              <Link to="/properties?type=sale">
                <Button variant="secondary" className="w-full">Find properties for sale</Button>
              </Link>
            </div>

            {/* Rent a home */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-10 text-center shadow-lg hover:shadow-l transition-all duration-300 border-2 border-orange-100 group">
              <div className="w-56 h-56 mx-auto mb-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  <circle cx="100" cy="100" r="90" fill="#FFF7ED"/>
                  <ellipse cx="100" cy="150" rx="40" ry="15" fill="#15803D"/>
                  <rect x="65" y="70" width="70" height="80" fill="#DC2626" rx="3"/>
                  <rect x="75" y="85" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="93" y="85" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="75" y="103" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="93" y="103" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="75" y="121" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="93" y="121" width="12" height="12" fill="#FFF" rx="1"/>
                  <rect x="111" y="103" width="18" height="47" fill="#F97316" rx="2"/>
                  <polygon points="100,50 65,70 135,70" fill="#7C2D12"/>
                  <rect x="140" y="95" width="20" height="55" fill="#92400E" rx="2"/>
                  <rect x="145" y="105" width="10" height="8" fill="#D97706" rx="1"/>
                  <rect x="145" y="118" width="10" height="8" fill="#D97706" rx="1"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Rent a home</h3>
              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                Browse the largest selection of rental properties and move in with confidence.
              </p>
              <Link to="/properties?type=rent">
                <Button variant="secondary" className="w-full">Find rentals</Button>
              </Link>
            </div>

            {/* Sell a home */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-10 text-center shadow-lg hover:shadow-l transition-all duration-300 border-2 border-green-100 group">
              <div className="w-56 h-56 mx-auto mb-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  <circle cx="100" cy="100" r="90" fill="#F0FDF4"/>
                  <ellipse cx="90" cy="155" rx="35" ry="12" fill="#16A34A"/>
                  <rect x="115" y="80" width="45" height="75" fill="#F59E0B" rx="2"/>
                  <rect x="125" y="95" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="140" y="95" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="125" y="110" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="140" y="110" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="125" y="125" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="140" y="125" width="10" height="10" fill="#FFF" rx="1"/>
                  <rect x="55" y="95" width="50" height="60" fill="#B45309" rx="3"/>
                  <path d="M 80 75 L 55 95 L 105 95 Z" fill="#92400E"/>
                  <rect x="70" y="120" width="20" height="35" fill="#D97706" rx="2"/>
                  <circle cx="85" cy="137" r="2" fill="#FFF"/>
                  <path d="M 80 105 L 65 110 L 65 130 L 72 130 L 72 115 Z" fill="#10B981"/>
                  <circle cx="75" cy="100" r="8" fill="#22C55E"/>
                  <circle cx="68" cy="95" r="5" fill="#4ADE80"/>
                  <circle cx="82" cy="95" r="5" fill="#4ADE80"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Sell a home</h3>
              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                List your property and connect with thousands of potential buyers today.
              </p>
              <Link to="/become-agent">
                <Button variant="secondary" className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div className="mb-4 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Explore homes on PropertyPlatform</h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium">Take a deep dive and browse properties available</p>
            </div>
            <Link to="/properties" className="hidden md:flex items-center text-amber-700 hover:text-amber-800 font-bold text-lg group">
              View all
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading properties..." />
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map(listing => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-600 text-lg mb-6 font-medium">No properties available yet</p>
              <Link to="/properties">
                <Button>Browse All Properties</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/properties">
              <Button icon={ArrowRight} size="lg">Show me more</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 bg-white border-y-2 border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-green-600 mr-2" />
                <div className="text-4xl font-black text-gray-900">12</div>
              </div>
              <p className="text-sm text-gray-600 font-semibold">New listings today</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-amber-700 mr-2" />
                <div className="text-4xl font-black text-gray-900">47</div>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Active viewers now</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-7 h-7 text-yellow-500 mr-2" />
                <div className="text-4xl font-black text-gray-900">156</div>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Homes sold this month</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Building2 className="w-7 h-7 text-amber-700 mr-2" />
                <div className="text-4xl font-black text-gray-900">500+</div>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Total listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-amber-900 relative overflow-hidden">
        <div className="absolute inset-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Find Your Perfect Home Today
            </h2>
            <p className="text-xl text-amber-400 mb-10 leading-relaxed font-medium">
              Join thousands of people who found their dream property in Cameroon. Start your journey now.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/properties">
                <Button variant="primary" icon={Search} size="lg" className="w-full sm:w-auto ">
                  Browse All Properties
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-amber text-amber-800 font-semibold">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;