import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Home,
  Users,
  Landmark,
  Briefcase,
  Award,
  Shield,
  Upload,
  FileCheck,
  MapPinned,
  Scale,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  Info
} from 'lucide-react';
import UserNav from '../../components/UserNav';
import Alert from '../../components/Alert';

const BecomeAgent = () => {
  const navigate = useNavigate();
  const STORAGE_KEY = 'becomeAgentFormData';
  const STEP_KEY = 'becomeAgentCurrentStep';

  // Load from localStorage on mount
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem(STEP_KEY);
    return savedStep ? parseInt(savedStep) : 1;
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    return {
      // Step 1: Professional Type
      professionalType: '',
      
      // Step 2: Business Information
      businessName: '',
      taxId: '',
      licenseNumber: '',
      yearsExperience: '',
      officeAddress: '',
      phoneNumber: '',
      region: '',
      city: '',
      
      // Step 3: Documents
      idDocument: null,
      landTitleCertificate: null,
      licenseDocument: null,
      businessRegistration: null,
      
      // Step 4: References (Optional)
      notaryName: '',
      notaryContact: '',
      termsAccepted: false
    };
  });

  const totalSteps = 4;

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STEP_KEY, currentStep.toString());
  }, [currentStep]);

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
        if (!formData.professionalType) {
          showAlert('Please select your professional type', 'error');
          return false;
        }
        return true;
      case 2:
        if (!formData.businessName || !formData.taxId || !formData.officeAddress || !formData.phoneNumber) {
          showAlert('Please fill in all required fields', 'error');
          return false;
        }
        return true;
      case 3:
        if (!formData.idDocument || !formData.landTitleCertificate) {
          showAlert('Please upload required documents', 'error');
          return false;
        }
        return true;
      case 4:
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
    setTimeout(() => {
      // Clear saved form data on successful submission
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      
      showAlert('Application submitted! We\'ll review within 1-3 business days.', 'success');
      setLoading(false);
      setTimeout(() => navigate('/user/dashboard'), 2000);
    }, 2000);
  };

  const professionalTypes = [
    { id: 'landlord', name: 'Landlord', icon: Home, description: 'I own properties and want to rent them out' },
    { id: 'agent', name: 'Real Estate Agent', icon: Users, description: 'I help people buy, sell, or rent properties' },
    { id: 'landSeller', name: 'Land Seller', icon: Landmark, description: 'I sell land or vacant properties' }
  ];

  const cameroonRegions = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'West', 'South', 'Southwest'];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Become a Professional</h1>
          <p className="text-gray-600">Upgrade your account to list properties and connect with buyers</p>
          
          {/* Resume indicator */}
          {localStorage.getItem(STORAGE_KEY) && currentStep > 1 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Resuming from where you left off</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`transition-all ${currentStep >= step ? 'w-12 h-2 bg-amber-600 rounded-full' : 'w-2 h-2 bg-gray-300 rounded-full'}`} />
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-gray-700">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">

          {/* Step 1: Professional Type */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of professional are you?</h2>
                <p className="text-gray-600">This helps us provide the right features for you</p>
              </div>

              <div className="space-y-4">
                {professionalTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateFormData('professionalType', type.id)}
                      className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                        formData.professionalType === type.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${formData.professionalType === type.id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.professionalType === type.id ? 'border-amber-600 bg-amber-600' : 'border-gray-300'
                        }`}>
                          {formData.professionalType === type.id && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">What's next?</p>
                    <p>You'll need to provide business details and upload verification documents. The process takes about 5-10 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
                <p className="text-gray-600">Tell us about your business</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  placeholder="Your business or company name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax ID (NUI) * <span className="text-xs font-normal text-amber-600">Required by Cameroon law</span>
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateFormData('taxId', e.target.value)}
                  placeholder="Your NUI number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Tax Identification Number from Cameroon tax authorities</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => updateFormData('region', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none bg-white"
                  >
                    <option value="">Select</option>
                    {cameroonRegions.map(region => <option key={region} value={region}>{region}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="e.g., Douala"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Office Address *
                </label>
                <textarea
                  value={formData.officeAddress}
                  onChange={(e) => updateFormData('officeAddress', e.target.value)}
                  placeholder="Complete address"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License {formData.professionalType === 'agent' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                    placeholder="License #"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                  <select
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none bg-white"
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

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Why we need this</p>
                    <p>We verify all information with Cameroon authorities to ensure legitimacy and protect buyers. This builds trust in our platform.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
                <p className="text-gray-600">We need these to verify your identity and business</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Verification:</strong> Documents are verified with MINDCAF registry. Ensure your Land Title is valid and free from encumbrances.
                </p>
              </div>

              <FileUploadField id="idDocument" label="Government ID *" description="Passport, Driver's License, or National ID" file={formData.idDocument} onChange={(file) => handleFileUpload('idDocument', file)} />
              <FileUploadField id="landTitleCertificate" label="Land Title Certificate (Titre Foncier) *" description="Official land title from MINDCAF" file={formData.landTitleCertificate} onChange={(file) => handleFileUpload('landTitleCertificate', file)} important />
              
              {formData.professionalType === 'agent' && (
                <FileUploadField id="licenseDocument" label="Professional License *" description="Real estate agent license" file={formData.licenseDocument} onChange={(file) => handleFileUpload('licenseDocument', file)} />
              )}
              
              <FileUploadField id="businessRegistration" label="Business Registration (Optional)" description="Business certificate" file={formData.businessRegistration} onChange={(file) => handleFileUpload('businessRegistration', file)} />
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Almost done! Add optional references to speed up verification</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-3">Notary Reference (Optional but recommended)</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.notaryName}
                    onChange={(e) => updateFormData('notaryName', e.target.value)}
                    placeholder="Notary name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none bg-white"
                  />
                  <input
                    type="tel"
                    value={formData.notaryContact}
                    onChange={(e) => updateFormData('notaryContact', e.target.value)}
                    placeholder="Notary contact number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the Terms of Service and Privacy Policy. I understand my information will be verified with MINDCAF and relevant authorities.
                  </span>
                </label>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What happens next?
                </h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>✓ We review your documents within 1-3 business days</li>
                  <li>✓ We verify your Land Title with MINDCAF registry</li>
                  <li>✓ We check for disputes or encumbrances</li>
                  <li>✓ You'll receive email confirmation once verified</li>
                  <li>✓ Start listing properties immediately after approval</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button onClick={handleBack} className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`py-4 px-6 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 disabled:bg-gray-300 flex items-center justify-center gap-2 ${currentStep === 1 ? 'w-full' : 'flex-1'}`}
            >
              {loading ? 'Submitting...' : currentStep === totalSteps ? 'Submit Application' : 'Continue'}
              {currentStep < totalSteps && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileUploadField = ({ id, label, description, file, onChange, important = false }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {important && <span className="text-red-600">(Critical)</span>}
      </label>
      <div className={`border-2 border-dashed rounded-xl p-5 text-center ${file ? 'border-green-500 bg-green-50' : important ? 'border-amber-400 bg-amber-50' : 'border-gray-300 hover:border-amber-600'}`}>
        <input type="file" id={id} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files[0])} className="hidden" />
        <label htmlFor={id} className="cursor-pointer block">
          {file ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-sm">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default BecomeAgent;