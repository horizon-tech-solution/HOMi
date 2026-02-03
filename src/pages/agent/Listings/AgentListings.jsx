import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import { 
  Building2, 
  Eye, 
  Heart, 
  MessageSquare, 
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Grid3x3,
  List,
  X,
  ChevronDown
} from 'lucide-react';

const AgentListings = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, active, pending, sold, rented
  const [selectedType, setSelectedType] = useState('all'); // all, sale, rent
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);

  // Mock data - replace with actual API calls
  const listings = [
    {
      id: 1,
      title: 'Modern 3BR Apartment in Bonamoussadi',
      location: 'Bonamoussadi, Douala',
      price: '85,000,000 FCFA',
      type: 'sale',
      status: 'active',
      views: 245,
      leads: 8,
      favorites: 12,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
      postedDate: '2024-01-15',
      bedrooms: 3,
      bathrooms: 2,
      area: '120 m²'
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool in Bonapriso',
      location: 'Bonapriso, Douala',
      price: '250,000,000 FCFA',
      type: 'sale',
      status: 'active',
      views: 432,
      leads: 15,
      favorites: 28,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600',
      postedDate: '2024-01-10',
      bedrooms: 5,
      bathrooms: 4,
      area: '350 m²'
    },
    {
      id: 3,
      title: '2BR Apartment for Rent',
      location: 'Akwa, Douala',
      price: '150,000 FCFA/month',
      type: 'rent',
      status: 'active',
      views: 123,
      leads: 4,
      favorites: 6,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
      postedDate: '2024-01-20',
      bedrooms: 2,
      bathrooms: 1,
      area: '80 m²'
    },
    {
      id: 4,
      title: 'Commercial Space in Douala',
      location: 'Bali, Douala',
      price: '500,000 FCFA/month',
      type: 'rent',
      status: 'pending',
      views: 89,
      leads: 2,
      favorites: 3,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      postedDate: '2024-01-22',
      bedrooms: 0,
      bathrooms: 2,
      area: '200 m²'
    },
    {
      id: 5,
      title: 'Studio Apartment Near Beach',
      location: 'Deido, Douala',
      price: '45,000,000 FCFA',
      type: 'sale',
      status: 'sold',
      views: 367,
      leads: 11,
      favorites: 19,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
      postedDate: '2023-12-05',
      bedrooms: 1,
      bathrooms: 1,
      area: '45 m²'
    },
    {
      id: 6,
      title: '4BR Family House with Garden',
      location: 'Logbaba, Douala',
      price: '120,000,000 FCFA',
      type: 'sale',
      status: 'active',
      views: 198,
      leads: 7,
      favorites: 14,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600',
      postedDate: '2024-01-18',
      bedrooms: 4,
      bathrooms: 3,
      area: '180 m²'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' }
  ];

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || listing.status === selectedStatus;
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      sold: 'bg-blue-100 text-blue-700',
      rented: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const handleSelectListing = (id) => {
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteListing = (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      // API call to delete
      console.log('Delete listing:', id);
    }
  };

  const handleDuplicateListing = (id) => {
    // API call to duplicate
    console.log('Duplicate listing:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={2} unreadNotifications={5} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              Manage your property listings ({filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'})
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/agent/add-property')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid/List */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or add a new property.</p>
            <button 
              onClick={() => navigate('/agent/add-property')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Property
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Image */}
                <div className="relative">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(listing.status)}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                  
                  {/* Actions Dropdown */}
                  <div className="absolute top-3 right-3">
                    <div className="relative group">
                      <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button 
                          onClick={() => navigate(`/agent/edit-listing/${listing.id}`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Listing
                        </button>
                        <button 
                          onClick={() => handleDuplicateListing(listing.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button 
                          onClick={() => navigate(`/agent/analytics/${listing.id}`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <TrendingUp className="w-4 h-4" />
                          View Analytics
                        </button>
                        <hr className="my-2" />
                        <button 
                          onClick={() => handleDeleteListing(listing.id)}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-amber-600 cursor-pointer">
                    {listing.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-amber-600">{listing.price}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    {listing.bedrooms} BD • {listing.bathrooms} BA • {listing.area}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      {listing.views}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      {listing.leads}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      {listing.favorites}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-amber-600 cursor-pointer text-lg">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(listing.status)}`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                        
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-200 rounded">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button 
                              onClick={() => navigate(`/agent/edit-listing/${listing.id}`)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Listing
                            </button>
                            <button 
                              onClick={() => handleDuplicateListing(listing.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button 
                              onClick={() => navigate(`/agent/analytics/${listing.id}`)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <TrendingUp className="w-4 h-4" />
                              View Analytics
                            </button>
                            <hr className="my-2" />
                            <button 
                              onClick={() => handleDeleteListing(listing.id)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-3">
                      <span className="text-2xl font-bold text-amber-600">{listing.price}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                        {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {listing.bedrooms} BD • {listing.bathrooms} BA • {listing.area}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {listing.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {listing.leads} leads
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {listing.favorites} favorites
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {new Date(listing.postedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentListings;