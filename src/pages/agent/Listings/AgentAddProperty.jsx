import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
import Map from '../../../components/Map';
import PropertyDetails from '../../main/pageDetail/PropertDetails';

import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  Sparkles,
  Image as ImageIcon,
  Eye,
  Building2,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Car,
  Wifi,
  Droplet,
  Zap,
  Wind,
  Shield,
  Camera,
  Upload,
  X,
  Navigation,
  Search
} from 'lucide-react';

const AgentAddProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showPreview, setShowPreview] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 }); // Douala default

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    propertyType: '',
    listingType: '', // sale or rent
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    yearBuilt: '',
    
    // Step 2: Location
    address: '',
    city: '',
    region: '',
    neighborhood: '',
    latitude: '',
    longitude: '',
    
    // Step 3: Amenities
    amenities: [],
    
    // Step 4: Photos
    photos: [],
    
    // Additional features
    parking: '',
    furnished: '',
    petFriendly: '',
    availableFrom: ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Basic Info', icon: Home },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Amenities', icon: Sparkles },
    { number: 4, title: 'Photos', icon: ImageIcon },
    { number: 5, title: 'Review', icon: Eye }
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Studio',
    'Duplex',
    'Commercial',
    'Land',
    'Office'
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'pool', label: 'Swimming Pool', icon: Droplet },
    { id: 'gym', label: 'Gym', icon: Building2 },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'security', label: '24/7 Security', icon: Shield },
    { id: 'generator', label: 'Generator', icon: Zap },
    { id: 'cctv', label: 'CCTV', icon: Camera }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleMapClick = (listing) => {
    // When map is clicked, update coordinates
    if (listing && listing.lat && listing.lng) {
      setFormData(prev => ({
        ...prev,
        latitude: listing.lat.toString(),
        longitude: listing.lng.toString()
      }));
    }
  };

  const handleLocationSearch = () => {
    // Search for location and update map center
    if (locationSearchQuery) {
      // This is a simple example - you'd want to use a geocoding API
      const locations = {
        'douala': { lat: 4.0511, lng: 9.7679 },
        'yaounde': { lat: 3.8480, lng: 11.5021 },
        'bonanjo': { lat: 4.0511, lng: 9.7579 },
        'akwa': { lat: 4.0611, lng: 9.7479 },
        'bonapriso': { lat: 4.0411, lng: 9.7779 }
      };

      const searchLower = locationSearchQuery.toLowerCase();
      const found = Object.keys(locations).find(key => searchLower.includes(key));
      
      if (found) {
        setMapCenter(locations[found]);
      }
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }));
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.listingType) newErrors.listingType = 'Listing type is required';
      if (!formData.price) newErrors.price = 'Price is required';
      if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
      if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
      if (!formData.area) newErrors.area = 'Area is required';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.region.trim()) newErrors.region = 'Region is required';
      if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Neighborhood is required';
      if (!formData.latitude || !formData.longitude) newErrors.coordinates = 'Please select location on map';
    }

    if (step === 4) {
      if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      // Submit to API
      console.log('Submitting:', formData);
      // After successful submission
      navigate('/agent/listings');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  // Convert form data to format expected by PropertyDetails
  const getPreviewListing = () => {
    return {
      id: 'preview',
      title: formData.title || 'Property Title',
      price: parseInt(formData.price) || 0,
      location: formData.address ? `${formData.neighborhood}, ${formData.city}` : 'Location',
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseInt(formData.area) || 0,
      type: formData.listingType,
      listingType: formData.listingType === 'sale' ? 'For Sale' : 'For Rent',
      image: formData.photos[0]?.preview || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      images: formData.photos.map(p => p.preview),
      lat: parseFloat(formData.latitude) || 4.0511,
      lng: parseFloat(formData.longitude) || 9.7679,
      description: formData.description,
      propertyType: formData.propertyType,
      yearBuilt: formData.yearBuilt,
      parking: formData.parking
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            <p className="text-gray-600">Tell us about your property</p>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Modern 3BR Apartment in Bonamoussadi"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property in detail..."
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Property Type & Listing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.propertyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
                {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('listingType', 'sale')}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                      formData.listingType === 'sale'
                        ? 'border-amber-600 bg-amber-50 text-amber-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('listingType', 'rent')}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                      formData.listingType === 'rent'
                        ? 'border-amber-600 bg-amber-50 text-amber-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    For Rent
                  </button>
                </div>
                {errors.listingType && <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (FCFA) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder={formData.listingType === 'rent' ? 'Monthly rent' : 'Sale price'}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Bedrooms, Bathrooms, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²) *
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.area ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  placeholder="2023"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  value={formData.parking}
                  onChange={(e) => handleInputChange('parking', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Furnished & Pet Friendly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnished
                </label>
                <select
                  value={formData.furnished}
                  onChange={(e) => handleInputChange('furnished', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="semi">Semi-furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Friendly
                </label>
                <select
                  value={formData.petFriendly}
                  onChange={(e) => handleInputChange('petFriendly', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
            <p className="text-gray-600">Pin the exact location of your property on the map</p>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., Rue 1.234, Bonamoussadi"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* City & Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Douala"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  placeholder="e.g., Littoral"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
              </div>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood *
              </label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="e.g., Bonamoussadi"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.neighborhood ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.neighborhood && <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>}
            </div>

            {/* Location Search */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                Search Location
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  placeholder="Search for a location (e.g., Bonanjo, Akwa)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  My Location
                </button>
              </div>
            </div>

            {/* Interactive Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Location on Map *
              </label>
              <div className="relative">
                <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
                  <Map
                    listings={formData.latitude && formData.longitude ? [{
                      id: 'temp',
                      lat: parseFloat(formData.latitude),
                      lng: parseFloat(formData.longitude),
                      title: formData.title || 'Property Location',
                      price: parseInt(formData.price) || 0,
                      location: formData.neighborhood || 'Location'
                    }] : []}
                    center={mapCenter}
                    zoom={14}
                    onMarkerClick={handleMapClick}
                    showControls={true}
                  />
                </div>
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Click on the map to select location</p>
                  <p className="text-xs text-gray-600">
                    {formData.latitude && formData.longitude 
                      ? `Selected: ${parseFloat(formData.latitude).toFixed(6)}, ${parseFloat(formData.longitude).toFixed(6)}`
                      : 'No location selected yet'
                    }
                  </p>
                </div>
              </div>
              {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
            </div>

            {/* Manual Coordinates (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 4.0511"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 9.7679"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can search for a location, use your current location, or click directly on the map to pin the exact location of your property.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Property Amenities</h2>
            <p className="text-gray-600">Select all amenities that apply</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.id);
                
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? 'text-amber-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isSelected ? 'text-amber-600' : 'text-gray-700'
                    }`}>
                      {amenity.label}
                    </p>
                    {isSelected && (
                      <div className="mt-2">
                        <Check className="w-5 h-5 text-amber-600 mx-auto" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Properties with more amenities tend to attract more interested buyers and renters.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
            <p className="text-gray-600">Add photos to showcase your property (minimum 1 photo required)</p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop (PNG, JPG, JPEG up to 10MB each)
                </p>
              </label>
            </div>

            {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}

            {/* Photo Grid */}
            {formData.photos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Uploaded Photos ({formData.photos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                          Cover Photo
                        </div>
                      )}
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  The first photo will be used as the cover image
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Listing</h2>
            <p className="text-gray-600">Preview how your property will appear to potential buyers/renters</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Preview:</strong> Click the button below to see how your listing will look to users.
              </p>
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview Listing
              </button>
            </div>

            {/* Quick Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Listing Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Title:</span>
                  <p className="text-gray-900 mt-1">{formData.title || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Price:</span>
                  <p className="text-gray-900 mt-1">{formData.price ? `${parseInt(formData.price).toLocaleString()} FCFA` : 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Location:</span>
                  <p className="text-gray-900 mt-1">{formData.neighborhood}, {formData.city}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Property Type:</span>
                  <p className="text-gray-900 mt-1 capitalize">{formData.propertyType || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Bedrooms / Bathrooms:</span>
                  <p className="text-gray-900 mt-1">{formData.bedrooms} BD • {formData.bathrooms} BA</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Area:</span>
                  <p className="text-gray-900 mt-1">{formData.area} m²</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Photos:</span>
                  <p className="text-gray-900 mt-1">{formData.photos.length} uploaded</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Amenities:</span>
                  <p className="text-gray-900 mt-1">{formData.amenities.length} selected</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Ready to publish?</strong> Your listing will be visible to thousands of potential buyers/renters immediately after submission.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav unreadLeads={2} unreadNotifications={5} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/agent/listings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-1">Fill in the details to list your property</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isActive
                        ? 'bg-amber-600 border-amber-600'
                        : 'bg-white border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden sm:block ${
                      isActive ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Check className="w-5 h-5" />
              Submit Listing
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PropertyDetails
          listing={getPreviewListing()}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default AgentAddProperty;