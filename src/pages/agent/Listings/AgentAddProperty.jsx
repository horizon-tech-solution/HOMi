import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentNav from '../../../components/AgentNav';
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
  Search,
  Crosshair,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

const AgentAddProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showPreview, setShowPreview] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    propertyType: '',
    listingType: '',
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

  // Initialize map when on step 2
  useEffect(() => {
    if (currentStep === 2 && !mapInitialized) {
      initializeMap();
    }
  }, [currentStep]);

  // Lock body scroll when map is expanded
  useEffect(() => {
    if (isMapExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMapExpanded]);

  const initializeMap = () => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => createMap();
      document.body.appendChild(script);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialLat = formData.latitude ? parseFloat(formData.latitude) : 4.0511;
    const initialLng = formData.longitude ? parseFloat(formData.longitude) : 9.7679;

    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([initialLat, initialLng], 13);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 20,
    }).addTo(map);

    // Add zoom control
    window.L.control.zoom({
      position: 'topright'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add click handler
    map.on('click', (e) => {
      setMapMarker(e.latlng.lat, e.latlng.lng);
    });

    // If we already have coordinates, show marker
    if (formData.latitude && formData.longitude) {
      setMapMarker(parseFloat(formData.latitude), parseFloat(formData.longitude), false);
    }

    setMapInitialized(true);
  };

  const setMapMarker = (lat, lng, updateForm = true) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom pin icon
    const pinIcon = window.L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-pin-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Add new marker
    const marker = window.L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstanceRef.current);
    markerRef.current = marker;

    // Center map on marker
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());

    // Update form data
    if (updateForm) {
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
      
      // Clear coordinate error if it exists
      if (errors.coordinates) {
        setErrors(prev => ({ ...prev, coordinates: '' }));
      }

      // Reverse geocode to get location name
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setIsLoadingLocation(true);
    setLocationName('Loading location...');

    try {
      // Using Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const neighborhood = address.suburb || address.neighbourhood || address.quarter || '';
        const city = address.city || address.town || address.village || '';
        const region = address.state || address.region || '';
        
        // Build location name
        const parts = [neighborhood, city, region].filter(Boolean);
        const locationString = parts.join(', ') || 'Unknown Location';
        
        setLocationName(locationString);

        // Auto-fill form fields if they're empty
        if (!formData.neighborhood && neighborhood) {
          handleInputChange('neighborhood', neighborhood);
        }
        if (!formData.city && city) {
          handleInputChange('city', city);
        }
        if (!formData.region && region) {
          handleInputChange('region', region);
        }
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
            setMapMarker(latitude, longitude, true);
          }
        },
        (error) => {
          alert('Unable to get your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
    
    // Give the DOM time to update before invalidating map size
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      console.log('Submitting:', formData);
      navigate('/agent/listings');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600 mt-1">Tell us about your property</p>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
              <p className="text-gray-600 mt-1">Select your property location on the map</p>
            </div>

            {/* Use My Location Button */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Use My Current Location
              </button>
            </div>

            {/* Interactive Map */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    Click on Map to Pin Location *
                  </span>
                </label>
                <button
                  type="button"
                  onClick={toggleMapExpansion}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {isMapExpanded ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
                {/* Map Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">How to use:</p>
                      <p>Click anywhere on the map to drop a pin at your property's exact location. The location name will appear automatically.</p>
                    </div>
                  </div>
                </div>

                {/* Map Container */}
                <div className="relative">
                  <div ref={mapRef} className="w-full h-80 md:h-96" />
                  
                  {/* Location Display */}
                  {formData.latitude && formData.longitude && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">Selected Location</div>
                          {isLoadingLocation ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Loading location details...
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 break-words">{locationName}</div>
                          )}
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {errors.coordinates && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.coordinates}
                </p>
              )}
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 gap-4 pt-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Amenities</h2>
              <p className="text-gray-600 mt-1">Select all amenities that apply</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {amenitiesList.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.id);
                
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`p-3 md:p-4 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                      isSelected ? 'text-amber-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-xs md:text-sm font-medium ${
                      isSelected ? 'text-amber-600' : 'text-gray-700'
                    }`}>
                      {amenity.label}
                    </p>
                    {isSelected && (
                      <div className="mt-2">
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mx-auto" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Properties with more amenities tend to attract more interested buyers and renters.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Photos</h2>
              <p className="text-gray-600 mt-1">Add photos to showcase your property (minimum 1 photo required)</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-amber-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop (PNG, JPG, JPEG up to 10MB each)
                </p>
              </label>
            </div>

            {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}

            {formData.photos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Uploaded Photos ({formData.photos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 md:h-40 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Your Listing</h2>
              <p className="text-gray-600 mt-1">Preview how your property will appear to potential buyers/renters</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Preview Your Listing</p>
                  <p className="text-sm text-blue-800">
                    Click the button below to see exactly how your listing will look to users
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePreview}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview Listing
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Listing Summary</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Title:</span>
                  <p className="text-gray-900">{formData.title || 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Price:</span>
                  <p className="text-gray-900">{formData.price ? `${parseInt(formData.price).toLocaleString()} FCFA` : 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Location:</span>
                  <p className="text-gray-900">{formData.neighborhood}, {formData.city}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Property Type:</span>
                  <p className="text-gray-900 capitalize">{formData.propertyType || 'Not set'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Bedrooms / Bathrooms:</span>
                  <p className="text-gray-900">{formData.bedrooms} BD • {formData.bathrooms} BA</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Area:</span>
                  <p className="text-gray-900">{formData.area} m²</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Photos:</span>
                  <p className="text-gray-900">{formData.photos.length} uploaded</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium block mb-1">Amenities:</span>
                  <p className="text-gray-900">{formData.amenities.length} selected</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate('/agent/listings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Back to Listings</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Fill in the details to list your property</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 md:mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max md:min-w-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isActive
                        ? 'bg-amber-600 border-amber-600'
                        : 'bg-white border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium text-center ${
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors"
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

      {/* Fullscreen Map Modal */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900">Select Property Location</h3>
                <p className="text-sm text-gray-600">Click anywhere to drop a pin</p>
              </div>
            </div>
            <button
              onClick={toggleMapExpansion}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </button>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Location Display */}
            {formData.latitude && formData.longitude && (
              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-2xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">Selected Location</div>
                    {isLoadingLocation ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading location details...
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 break-words">{locationName}</div>
                    )}
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentAddProperty;