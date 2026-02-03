import { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  Building2, 
  User,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Upload,
  FileText,
  CheckCircle2,
  Home,
  Users,
  Landmark,
  CreditCard,
  MapPinned,
  Building,
  FileCheck,
  Scale,
  Shield
} from 'lucide-react';
import Alert from '../../components/Alert';

const ProAccount = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form data with Cameroon-specific fields
  const [formData, setFormData] = useState({
    // Step 1: Account Setup
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Professional Type
    professionalType: '',
    
    // Step 3: Personal Information
    firstName: '',
    lastName: '',
    phoneNumber: '',
    nationalId: '',
    region: '',
    city: '',
    
    // Step 4: Business Information
    businessName: '',
    taxId: '', // NUI - Tax Identification Number (CRITICAL for Cameroon)
    licenseNumber: '',
    yearsExperience: '',
    officeAddress: '',
    bio: '',
    
    // Step 5: Legal & Property Documents
    idDocument: null,
    licenseDocument: null,
    landTitleCertificate: null, // Titre Foncier (MOST IMPORTANT)
    surveyPlan: null,
    proofNoEncumbrances: null,
    businessRegistration: null,
    
    // Step 6: Professional References
    notaryName: '',
    notaryContact: '',
    lawyerName: '',
    lawyerContact: '',
    
    termsAccepted: false
  });

  const totalSteps = 6;

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      showAlert('File size must be less than 5MB', 'error');
      return;
    }
    updateFormData(field, file);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          showAlert('Please fill in all fields', 'error');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('Passwords do not match', 'error');
          return false;
        }
        if (formData.password.length < 8) {
          showAlert('Password must be at least 8 characters', 'error');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.professionalType) {
          showAlert('Please select your professional type', 'error');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
            !formData.nationalId || !formData.region || !formData.city) {
          showAlert('Please fill in all required fields', 'error');
          return false;
        }
        return true;
        
      case 4:
        if (!formData.businessName || !formData.taxId || !formData.officeAddress || 
            !formData.yearsExperience) {
          showAlert('Please fill in all required fields', 'error');
          return false;
        }
        return true;
        
      case 5:
        if (!formData.idDocument || !formData.landTitleCertificate) {
          showAlert('Please upload required documents (ID and Land Title)', 'error');
          return false;
        }
        if (formData.professionalType === 'agent' && !formData.licenseDocument) {
          showAlert('Real Estate Agents must upload professional license', 'error');
          return false;
        }
        return true;
        
      case 6:
        if (!formData.termsAccepted) {
          showAlert('Please accept terms and conditions', 'error');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      showAlert('Professional account submitted! Our team will verify your documents within 1-3 business days.', 'success');
      setLoading(false);
    }, 2000);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    
    return {
      strength: strength,
      label: labels[strength - 1] || 'Weak',
      color: colors[strength - 1] || 'bg-red-500'
    };
  };

  const professionalTypes = [
    {
      id: 'landlord',
      name: 'Landlord',
      icon: Home,
      description: 'Property owner renting properties'
    },
    {
      id: 'agent',
      name: 'Real Estate Agent',
      icon: Users,
      description: 'Professional helping buy/sell properties'
    },
    {
      id: 'landSeller',
      name: 'Land Seller',
      icon: Landmark,
      description: 'Selling land or vacant properties'
    }
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'West', 'South', 'Southwest'
  ];

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Alert */}
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* Mobile-optimized container */}
      <div className="w-full min-h-screen px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        
        {/* Logo - Mobile optimized */}
        <div className="text-center mb-6 sm:mb-8">
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Professional Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join as a verified professional
          </p>
        </div>

        {/* Mobile-friendly Progress Bar */}
        <div className="mb-6 sm:mb-8">
          {/* Progress dots for mobile */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`
                  transition-all duration-300
                  ${currentStep >= step 
                    ? 'w-8 h-2 bg-amber-600 rounded-full' 
                    : 'w-2 h-2 bg-gray-300 rounded-full'
                  }
                `}
              />
            ))}
          </div>
          
          {/* Step indicator text */}
          <p className="text-center text-xs sm:text-sm font-semibold text-gray-700">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            {currentStep === 1 && 'Create your account'}
            {currentStep === 2 && 'Select professional type'}
            {currentStep === 3 && 'Personal information'}
            {currentStep === 4 && 'Business details'}
            {currentStep === 5 && 'Upload documents'}
            {currentStep === 6 && 'Professional references'}
          </p>
        </div>

        {/* Form Container - Mobile optimized */}
        <div className="bg-white  p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 max-w-2xl mx-auto">
          
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Create your account
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Set up your login credentials
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-gray-600 touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Strength: <span className="font-semibold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Professional Type */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Professional type
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Choose what best describes you
                </p>
              </div>

              <div className="space-y-3">
                {professionalTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateFormData('professionalType', type.id)}
                      className={`
                        w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all text-left touch-manipulation
                        ${formData.professionalType === type.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 bg-white active:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`
                          p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0
                          ${formData.professionalType === type.id
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">
                            {type.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {type.description}
                          </p>
                        </div>
                        <div className={`
                          w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${formData.professionalType === type.id
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-gray-300'
                          }
                        `}>
                          {formData.professionalType === type.id && (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Personal Information */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Personal information
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Tell us about yourself
                </p>
              </div>

              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  National ID Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => updateFormData('nationalId', e.target.value)}
                    placeholder="Enter your National ID number"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* Region and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Region *
                  </label>
                  <div className="relative">
                    <MapPinned className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={formData.region}
                      onChange={(e) => updateFormData('region', e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white appearance-none"
                    >
                      <option value="">Select region</option>
                      {cameroonRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City/Town *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="e.g., Douala"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Business Information */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Business details
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Your professional information
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateFormData('businessName', e.target.value)}
                    placeholder="Your business name"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* Tax ID (NUI) - CRITICAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax ID (NUI) * <span className="text-xs font-normal text-amber-600">Required by Cameroon law</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => updateFormData('taxId', e.target.value)}
                    placeholder="Enter your NUI number"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tax Identification Number (NUI) from Cameroon tax authorities
                </p>
              </div>

              {/* Office Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Office Address *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <textarea
                    value={formData.officeAddress}
                    onChange={(e) => updateFormData('officeAddress', e.target.value)}
                    placeholder="Complete office address with street, quartier, city"
                    rows="3"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 resize-none"
                  />
                </div>
              </div>

              {/* License Number and Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License {formData.professionalType === 'agent' ? '*' : '(Optional)'}
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                      placeholder="License #"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience *
                  </label>
                  <select
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="0-1">{"< 1 year"}</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Brief description of your experience..."
                  rows="3"
                  maxLength="500"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Upload documents
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Required for verification
                </p>
              </div>

              {/* Alert about verification */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Important:</strong> All documents will be verified with MINDCAF registry. 
                  Ensure your Land Title Certificate is valid and free from encumbrances.
                </p>
              </div>

              {/* ID Document */}
              <FileUploadField
                id="idDocument"
                label="Government ID *"
                description="Passport, Driver's License, or National ID"
                file={formData.idDocument}
                onChange={(file) => handleFileUpload('idDocument', file)}
                icon={CreditCard}
              />

              {/* Land Title Certificate - MOST IMPORTANT */}
              <FileUploadField
                id="landTitleCertificate"
                label="Land Title Certificate (Titre Foncier) *"
                description="Official land title from MINDCAF"
                file={formData.landTitleCertificate}
                onChange={(file) => handleFileUpload('landTitleCertificate', file)}
                icon={FileCheck}
                important
              />

              {/* Survey Plan */}
              <FileUploadField
                id="surveyPlan"
                label="Survey Plan (Optional)"
                description="Property boundary survey"
                file={formData.surveyPlan}
                onChange={(file) => handleFileUpload('surveyPlan', file)}
                icon={MapPinned}
              />

              {/* Proof of No Encumbrances */}
              <FileUploadField
                id="proofNoEncumbrances"
                label="Proof of No Encumbrances (Recommended)"
                description="Certificate showing no mortgages/liens"
                file={formData.proofNoEncumbrances}
                onChange={(file) => handleFileUpload('proofNoEncumbrances', file)}
                icon={Scale}
              />

              {/* License (for agents) */}
              {formData.professionalType === 'agent' && (
                <FileUploadField
                  id="licenseDocument"
                  label="Professional License *"
                  description="Real estate agent license"
                  file={formData.licenseDocument}
                  onChange={(file) => handleFileUpload('licenseDocument', file)}
                  icon={Award}
                />
              )}

              {/* Business Registration */}
              <FileUploadField
                id="businessRegistration"
                label="Business Registration (Optional)"
                description="Business certificate or Tax ID document"
                file={formData.businessRegistration}
                onChange={(file) => handleFileUpload('businessRegistration', file)}
                icon={Building2}
              />
            </div>
          )}

          {/* Step 6: Professional References */}
          {currentStep === 6 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Professional references
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Optional but recommended for faster verification
                </p>
              </div>

              {/* Notary Reference */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  Notary Reference (Optional)
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notary Name
                  </label>
                  <input
                    type="text"
                    value={formData.notaryName}
                    onChange={(e) => updateFormData('notaryName', e.target.value)}
                    placeholder="Full name of notary"
                    className="w-full px-3 sm:px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notary Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.notaryContact}
                    onChange={(e) => updateFormData('notaryContact', e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full px-3 sm:px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Lawyer Reference */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  Lawyer Reference (Optional)
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lawyer Name
                  </label>
                  <input
                    type="text"
                    value={formData.lawyerName}
                    onChange={(e) => updateFormData('lawyerName', e.target.value)}
                    placeholder="Full name of lawyer"
                    className="w-full px-3 sm:px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lawyer Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.lawyerContact}
                    onChange={(e) => updateFormData('lawyerContact', e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full px-3 sm:px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-amber-50 rounded-xl p-4 sm:p-5">
                <label className="flex items-start gap-3 cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold">
                      Privacy Policy
                    </a>
                    . I understand my information will be verified with MINDCAF and other relevant authorities before account activation.
                  </span>
                </label>
              </div>

              {/* Final verification info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  What happens next?
                </h4>
                <ul className="text-xs sm:text-sm text-green-800 space-y-1 ml-7">
                  <li>• Our team reviews your documents within 1-3 business days</li>
                  <li>• We verify your Land Title with MINDCAF registry</li>
                  <li>• We check for any property disputes or encumbrances</li>
                  <li>• You'll receive email confirmation once verified</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons - Mobile optimized */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={loading}
              className={`
                py-3 sm:py-4 px-4 sm:px-6 bg-amber-600 text-white rounded-full font-bold 
                hover:bg-amber-700 active:bg-amber-800
                disabled:bg-gray-300 disabled:cursor-not-allowed transition-all 
                flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation
                ${currentStep === 1 ? 'w-full' : 'flex-1'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    {currentStep === totalSteps ? 'Submit for Verification' : 'Continue'}
                  </span>
                  <span className="sm:hidden">
                    {currentStep === totalSteps ? 'Submit' : 'Next'}
                  </span>
                  {currentStep < totalSteps && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs sm:text-sm text-gray-500 px-4">
          Already have an account?{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold touch-manipulation">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

// Reusable File Upload Component for mobile
const FileUploadField = ({ id, label, description, file, onChange, icon: Icon, important = false }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {important && <span className="ml-1 text-xs font-normal text-red-600">(Critical)</span>}
      </label>
      <div className={`
        border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-colors touch-manipulation
        ${file 
          ? 'border-green-500 bg-green-50' 
          : important 
            ? 'border-amber-400 bg-amber-50 hover:border-amber-500' 
            : 'border-gray-300 hover:border-amber-600 active:border-amber-700'
        }
      `}>
        <input
          type="file"
          id={id}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onChange(e.target.files[0])}
          className="hidden"
        />
        <label htmlFor={id} className="cursor-pointer block">
          {file ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm break-all">{file.name}</span>
            </div>
          ) : (
            <>
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Tap to upload</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default ProAccount;