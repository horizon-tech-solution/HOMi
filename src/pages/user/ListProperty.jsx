import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  Home,
  MapPin,
  FileText,
  Image as ImageIcon,
  DollarSign,
  CheckCircle,
  Upload,
  X,
  AlertCircle,
  Briefcase,
  Building2,
  LandPlot,
  Phone,
  Mail,
  User,
  Shield
} from 'lucide-react';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const ListProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  // Alert state
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Form data state with initial load from localStorage
  const [formData, setFormData] = useState(() => {
    // Try to load saved data from localStorage
    const savedData = localStorage.getItem('propertyListingFormData');
    const savedStep = localStorage.getItem('propertyListingCurrentStep');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Set the saved step if it exists
        if (savedStep) {
          setTimeout(() => setCurrentStep(parseInt(savedStep)), 0);
        }
        return parsedData;
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
    
    // Return default form data if no saved data
    return {
      // Step 1: Property Type & Address
      propertyType: '',
      listingType: '',
      address: '',
      city: '',
      region: '',
      neighborhood: '',
      
      // Step 2: Property Details
      landSize: '',
      landSizeUnit: 'sqm',
      bedrooms: '',
      bathrooms: '',
      parkingSpaces: '',
      yearBuilt: '',
      
      // Step 3: Features & Amenities
      features: [],
      
      // Step 4: Pricing
      price: '',
      priceNegotiable: false,
      
      // Step 5: Description
      title: '',
      description: '',
      
      // Step 6: Photos
      photos: [],
      
      // Step 7: Documents
      documents: [],
      
      // Step 8: Contact Information
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      ownerWhatsApp: '',
      preferredContact: 'phone'
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    // Create a copy of formData without file previews for photos (they can't be serialized)
    const dataToSave = {
      ...formData,
      photos: formData.photos.map(photo => ({
        id: photo.id,
        name: photo.name,
        // We'll skip the file and preview as they can't be saved to localStorage
      })),
      documents: formData.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size
      }))
    };
    
    localStorage.setItem('propertyListingFormData', JSON.stringify(dataToSave));
  }, [formData]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('propertyListingCurrentStep', currentStep.toString());
  }, [currentStep]);

  const propertyTypes = [
    { value: 'house', label: 'House', icon: Home, description: 'Single family home, villa, duplex' },
    { value: 'apartment', label: 'Apartment', icon: Building2, description: 'Flat, studio, penthouse' },
    { value: 'land', label: 'Land', icon: LandPlot, description: 'Plot, acreage, lot' },
    { value: 'commercial', label: 'Commercial', icon: Briefcase, description: 'Office, shop, warehouse' }
  ];

  const listingTypes = [
    { value: 'sale', label: 'For Sale', description: 'Sell your property' },
    { value: 'rent', label: 'For Rent', description: 'Rent out your property' }
  ];

  const availableFeatures = [
    'Swimming Pool', 'Garden', 'Garage', 'Security System', 
    'Furnished', 'Air Conditioning', 'Balcony', 'Terrace',
    'Generator', 'Water Tank', 'Solar Panels', 'Gym',
    'Elevator', 'Playground', 'Guest House', 'Servant Quarters'
  ];

  const regions = [
    'Littoral', 'Centre', 'Adamawa', 'East', 'Far North',
    'North', 'Northwest', 'West', 'South', 'Southwest'
  ];

  const totalSteps = 8;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxPhotos = 15;
    
    if (formData.photos.length + files.length > maxPhotos) {
      showAlert(`Maximum ${maxPhotos} photos allowed`, 'error');
      return;
    }

    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
    
    if (newPhotos.length > 0) {
      showAlert(`${newPhotos.length} photo(s) uploaded successfully!`, 'success');
    }
  };


  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxDocs = 10;
    
    if (formData.documents.length + files.length > maxDocs) {
      showAlert(`Maximum ${maxDocs} documents allowed`, 'error');
      return;
    }

    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) // Size in MB
    }));

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs]
    }));
    
    if (newDocs.length > 0) {
      showAlert(`${newDocs.length} document(s) uploaded successfully!`, 'success');
    }
  };

  const handleRemoveDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.propertyType) newErrors.propertyType = 'Please select a property type';
        if (!formData.listingType) newErrors.listingType = 'Please select a listing type';
        if (!formData.address) newErrors.address = 'Please enter the property address';
        if (!formData.city) newErrors.city = 'Please enter the city';
        if (!formData.region) newErrors.region = 'Please select a region';
        break;
      
      case 2:
        if (formData.propertyType !== 'land') {
          if (!formData.bedrooms) newErrors.bedrooms = 'Please enter number of bedrooms';
          if (!formData.bathrooms) newErrors.bathrooms = 'Please enter number of bathrooms';
        }
        if (!formData.landSize) newErrors.landSize = 'Please enter property size';
        break;
      
      case 4:
        if (!formData.price) newErrors.price = 'Please enter the price';
        // Remove commas before checking if it's a valid number
        const priceValue = formData.price.toString().replace(/,/g, '');
        if (formData.price && isNaN(priceValue)) newErrors.price = 'Please enter a valid price';
        if (formData.price && Number(priceValue) <= 0) newErrors.price = 'Price must be greater than 0';
        break;
      
      case 5:
        if (!formData.title) newErrors.title = 'Please enter a property title';
        if (!formData.description) newErrors.description = 'Please enter a property description';
        if (formData.description && formData.description.length < 50) {
          newErrors.description = 'Description must be at least 50 characters';
        }
        break;
      
      case 6:
        if (formData.photos.length < 1) newErrors.photos = 'Please upload at least 1 photo';
        break;
      
      case 7:
        // Documents are recommended but not required for now
        // if (formData.documents.length < 1) newErrors.documents = 'Please upload at least one property document';
        break;
      
      case 8:
        if (!formData.ownerName) newErrors.ownerName = 'Please enter your name';
        if (!formData.ownerPhone) newErrors.ownerPhone = 'Please enter your phone number';
        if (!formData.ownerEmail) newErrors.ownerEmail = 'Please enter your email';
        if (formData.ownerEmail && !/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
          newErrors.ownerEmail = 'Please enter a valid email';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      // Here you would submit the form data to your backend
      console.log('Form submitted:', formData);
      
      // Clear saved data from localStorage after successful submission
      localStorage.removeItem('propertyListingFormData');
      localStorage.removeItem('propertyListingCurrentStep');
      
      // Show success and navigate
      showAlert('Property listing submitted successfully! Our team will review it within 24 hours.', 'success');
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
    }
  };

  const handleStartFresh = () => {
    if (window.confirm('Are you sure you want to start over? All your progress will be lost.')) {
      localStorage.removeItem('propertyListingFormData');
      localStorage.removeItem('propertyListingCurrentStep');
      showAlert('Form reset successfully', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8 sm:mb-12">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-amber-600">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          What type of property are you listing?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Select the category that best describes your property
        </p>
      </div>

      {/* Property Type Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Property Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {propertyTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => handleInputChange('propertyType', type.value)}
                className={`p-4 sm:p-6 rounded-xl border-2 text-left transition-all hover:border-amber-400 ${
                  formData.propertyType === type.value
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 ${
                  formData.propertyType === type.value ? 'text-amber-600' : 'text-gray-400'
                }`} />
                <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{type.label}</div>
                <div className="text-xs sm:text-sm text-gray-600">{type.description}</div>
              </button>
            );
          })}
        </div>
        {errors.propertyType && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.propertyType}
          </p>
        )}
      </div>

      {/* Listing Type Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Listing Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {listingTypes.map(type => (
            <button
              key={type.value}
              onClick={() => handleInputChange('listingType', type.value)}
              className={`p-4 sm:p-6 rounded-xl border-2 text-left transition-all hover:border-amber-400 ${
                formData.listingType === type.value
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{type.label}</div>
              <div className="text-xs sm:text-sm text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
        {errors.listingType && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.listingType}
          </p>
        )}
      </div>

      {/* Address Fields */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-600" />
          Property Location
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="e.g., 123 Rue de la Réunification"
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                errors.address ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Douala"
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                  errors.city ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                  errors.region ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.region}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Neighborhood (Optional)
            </label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              placeholder="e.g., Bonanjo, Bonapriso"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Property details
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Provide key information about your {formData.propertyType}
        </p>
      </div>

      <div className="space-y-4">
        {/* Land/Property Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Size *
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.landSize}
              onChange={(e) => handleInputChange('landSize', e.target.value)}
              placeholder="Enter size"
              className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                errors.landSize ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            <select
              value={formData.landSizeUnit}
              onChange={(e) => handleInputChange('landSizeUnit', e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base"
            >
              <option value="sqm">sqm</option>
              <option value="sqft">sqft</option>
              <option value="acres">acres</option>
              <option value="hectares">hectares</option>
            </select>
          </div>
          {errors.landSize && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.landSize}
            </p>
          )}
        </div>

        {/* Show these fields only if not land */}
        {formData.propertyType !== 'land' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                    errors.bedrooms ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.bedrooms && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.bedrooms}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                    errors.bathrooms ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.bathrooms && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.bathrooms}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  value={formData.parkingSpaces}
                  onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year Built (Optional)
              </label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Features & amenities
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Select all features that apply to your property
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableFeatures.map(feature => (
          <button
            key={feature}
            onClick={() => handleFeatureToggle(feature)}
            className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all text-sm sm:text-base ${
              formData.features.includes(feature)
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 bg-white hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`font-medium ${
                formData.features.includes(feature) ? 'text-amber-900' : 'text-gray-700'
              }`}>
                {feature}
              </span>
              {formData.features.includes(feature) && (
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Tip for better results</p>
            <p>Properties with detailed features get 3x more inquiries. Select all applicable amenities.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Set your price
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Enter the {formData.listingType === 'rent' ? 'monthly rent' : 'selling price'} for your property
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price (XAF) *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (!isNaN(value)) {
                  handleInputChange('price', Number(value).toLocaleString());
                }
              }}
              placeholder="e.g., 45,000,000"
              className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-lg font-semibold ${
                errors.price ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.price && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.price}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.priceNegotiable}
              onChange={(e) => handleInputChange('priceNegotiable', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Price is negotiable
            </span>
          </label>
        </div>

        {/* Price Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-2">Pricing tips</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Research similar properties in your area</li>
                <li>Be realistic and competitive</li>
                <li>Well-priced properties sell 50% faster</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Describe your property
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Create a compelling description to attract buyers
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Spacious 4-Bedroom Villa with Pool in Bonapriso"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
              errors.title ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.title}
              </p>
            ) : (
              <span className="text-xs text-gray-500">Make it catchy and descriptive</span>
            )}
            <span className="text-xs text-gray-500">{formData.title.length}/100</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your property in detail. Include information about the location, nearby amenities, unique features, and why someone would want to live here..."
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.description}
              </p>
            ) : (
              <span className="text-xs text-gray-500">Minimum 50 characters</span>
            )}
            <span className={`text-xs ${formData.description.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.description.length} characters
            </span>
          </div>
        </div>

        {/* Description Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">What to include in your description:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Property condition and age</li>
                <li>Nearby schools, hospitals, markets</li>
                <li>Transportation access</li>
                <li>Unique selling points</li>
                <li>Neighborhood characteristics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Upload property photos
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Add at least 1 high-quality photo (4+ recommended). Properties with more photos get 3x more views!
        </p>
      </div>

      {/* Re-upload Notice */}
      {formData.photos.length === 0 && localStorage.getItem('propertyListingFormData') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Note about saved progress</p>
              <p>Your form data has been saved, but photos need to be re-uploaded after refreshing the page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-amber-500 transition-colors bg-gray-50 hover:bg-amber-50">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Click to upload photos
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or drag and drop photos here
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 10MB each. Maximum 15 photos.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>
        {errors.photos && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.photos}
          </p>
        )}
      </div>

      {/* Photo Grid */}
      {formData.photos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Uploaded Photos ({formData.photos.length}/15)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt={`Property ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Cover Photo
                  </div>
                )}
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <ImageIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-2">Photo tips for better results:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Take photos in good natural lighting</li>
              <li>Show all rooms and outdoor spaces</li>
              <li>Use landscape orientation</li>
              <li>Clean and declutter before photographing</li>
              <li>First photo should be your best exterior or interior shot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Upload property documents
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Upload property documents for verification (optional but recommended). This helps build trust with buyers.
        </p>
      </div>

      {/* Re-upload Notice */}
      {formData.documents.length === 0 && localStorage.getItem('propertyListingFormData') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Note about saved progress</p>
              <p>Your form data has been saved, but documents need to be re-uploaded after refreshing the page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-amber-500 transition-colors bg-gray-50 hover:bg-amber-50">
            <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Click to upload documents
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or drag and drop documents here
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOC, DOCX, JPG up to 10MB each. Maximum 10 documents.
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            onChange={handleDocumentUpload}
            className="hidden"
          />
        </label>
        {errors.documents && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.documents}
          </p>
        )}
      </div>

      {/* Document List */}
      {formData.documents.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Uploaded Documents ({formData.documents.length}/10)
          </h3>
          <div className="space-y-3">
            {formData.documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="ml-4 text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Tips */}
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Required documents:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Land title or property deed</li>
                <li>Certificate of occupancy (if available)</li>
                <li>Survey plan</li>
                <li>Tax clearance certificate</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-semibold mb-1">Your documents are secure</p>
              <p>All documents are encrypted and only viewed by our verification team and serious buyers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Contact information
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          How should interested buyers contact you?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                errors.ownerName ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ownerName && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.ownerName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
              placeholder="+237 6XX XXX XXX"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                errors.ownerPhone ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ownerPhone && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.ownerPhone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
              placeholder="your.email@example.com"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base ${
                errors.ownerEmail ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ownerEmail && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.ownerEmail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            WhatsApp Number (Optional)
          </label>
          <input
            type="tel"
            value={formData.ownerWhatsApp}
            onChange={(e) => handleInputChange('ownerWhatsApp', e.target.value)}
            placeholder="+237 6XX XXX XXX"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500 transition-colors text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Contact Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['phone', 'email', 'whatsapp'].map(method => (
              <button
                key={method}
                onClick={() => handleInputChange('preferredContact', method)}
                className={`p-3 rounded-lg border-2 text-center transition-all capitalize text-sm sm:text-base ${
                  formData.preferredContact === method
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Your privacy is protected</p>
            <p>Your contact information will only be shared with verified buyers who express serious interest in your property.</p>
          </div>
        </div>
      </div>
    </div>
  );


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      {/* Alert */}
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}
      
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3">
            List Your Property
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Complete all steps to publish your listing
          </p>
          
          {/* Saved Progress Indicator */}
          {localStorage.getItem('propertyListingFormData') && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Progress saved automatically
              </div>
              <button
                onClick={handleStartFresh}
                className="text-sm text-red-600 hover:text-red-700 font-semibold underline"
              >
                Start fresh
              </button>
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8">
          {renderProgressBar()}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-100">
            {currentStep > 1 && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="w-full sm:flex-1 group"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                className="w-full sm:flex-1"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Listing
              </Button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@homi.cm" className="text-amber-600 hover:text-amber-700 font-semibold">
              support@homi.cm
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ListProperty;