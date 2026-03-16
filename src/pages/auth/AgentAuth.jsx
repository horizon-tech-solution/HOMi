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
  CreditCard,
  CheckCircle2,
  Home,
  Users,
  Landmark,
  Camera,
} from 'lucide-react';
import Alert from '../../components/Alert';
import { useAgentAuth } from '../../context/AgentAuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ProAccount = () => {
  const { login, updateAgent } = useAgentAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Account Setup
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Professional Type
    professionalType: '',

    // Step 3: Personal & Business Info
    firstName: '',
    lastName: '',
    phoneNumber: '',
    agencyName: '',

    // Step 4: Identity Documents
    nationalId: '',
    idDocument: null,
    selfieDocument: null,

    // Step 5: Terms
    termsAccepted: false,
  });

  const totalSteps = 5;

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
        if (!(/\S+@\S+\.\S+/).test(formData.email)) {
          showAlert('Please enter a valid email address', 'error');
          return false;
        }
        if (formData.password.length < 8) {
          showAlert('Password must be at least 8 characters', 'error');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('Passwords do not match', 'error');
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
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
          showAlert('Please fill in all required fields', 'error');
          return false;
        }
        return true;

      case 4:
        if (!formData.nationalId) {
          showAlert('Please enter your National ID number', 'error');
          return false;
        }
        if (!formData.idDocument) {
          showAlert('Please upload your government ID document', 'error');
          return false;
        }
        return true;

      case 5:
        if (!formData.termsAccepted) {
          showAlert('Please accept the terms and conditions', 'error');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Register account
      const regRes = await fetch(`${BASE_URL}/agent/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        `${formData.firstName} ${formData.lastName}`.trim(),
          email:       formData.email.trim(),
          phone:       '+237' + formData.phoneNumber.trim(),
          password:    formData.password,
          national_id: formData.nationalId.trim(),
          agency_name: formData.agencyName.trim() || null,
          agent_type:  formData.professionalType,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || 'Registration failed');

      const token = regData.token;
      localStorage.setItem('user_token', JSON.stringify(regData));

      // 2. Upload ID document
      if (formData.idDocument) {
        const fd = new FormData();
        fd.append('document', formData.idDocument);
        fd.append('type', 'national_id');
        fd.append('national_id_number', formData.nationalId.trim());
        await fetch(`${BASE_URL}/agent/auth/upload-id`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      // 3. Upload selfie if provided
      if (formData.selfieDocument) {
        const fd = new FormData();
        fd.append('document', formData.selfieDocument);
        fd.append('type', 'selfie');
        await fetch(`${BASE_URL}/agent/auth/upload-id`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      setSubmitted(true);
      showAlert("Account created! We'll verify your ID within 24 hours.", 'success');
    } catch (err) {
      showAlert(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep === totalSteps) {
      handleFinalSubmit();
      return;
    }
    setCurrentStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      strength,
      label: labels[strength - 1] || 'Weak',
      color: colors[strength - 1] || 'bg-red-500',
    };
  };

  const professionalTypes = [
    { id: 'agent',      name: 'Real Estate Agent', icon: Users,    description: 'Professional helping buy/sell/rent properties' },
    { id: 'landlord',   name: 'Landlord',           icon: Home,     description: 'Property owner listing for rent or sale'       },
    { id: 'landSeller', name: 'Land Seller',        icon: Landmark, description: 'Selling plots or undeveloped land'             },
  ];

  const stepLabels = [
    'Create your account',
    'Select professional type',
    'Personal information',
    'Identity documents',
    'Review & submit',
  ];

  const passwordStrength = getPasswordStrength();

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            We're reviewing your ID document. You'll receive an email once your account is verified — usually within 24 hours.
          </p>
          <a
            href="/auth"
            className="inline-block mt-6 px-8 py-3 bg-amber-600 text-white rounded-full font-bold text-sm hover:bg-amber-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full min-h-screen px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Professional Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join as a verified professional
          </p>
        </div>

        {/* Step progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((step) => (
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
          <p className="text-center text-xs sm:text-sm font-semibold text-gray-700">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            {stepLabels[currentStep - 1]}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 max-w-2xl mx-auto">

          {/* ── Step 1: Account Setup ── */}
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

          {/* ── Step 2: Professional Type ── */}
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

          {/* ── Step 3: Personal & Business Info ── */}
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div className="flex items-center w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus-within:border-amber-600 transition-colors">
                    <span className="text-base text-gray-400 font-medium pr-1 select-none whitespace-nowrap">+237</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="6XX XXX XXX"
                      className="flex-1 bg-transparent text-base text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agency / Business Name
                  <span className="ml-1 text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.agencyName}
                    onChange={(e) => updateFormData('agencyName', e.target.value)}
                    placeholder="e.g. Mbarga Immobilier"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Identity Documents ── */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Identity documents
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Required to verify your account
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Why we need this:</strong> Your ID is used solely to confirm your identity.
                  It is encrypted and never shared with third parties.
                </p>
              </div>

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
                    placeholder="CNI / Passport number"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:border-amber-600 focus:outline-none transition-colors text-gray-900"
                  />
                </div>
              </div>

              <FileUploadField
                id="idDocument"
                label="Government ID *"
                description="Passport, Driver's License, or National ID (CNI)"
                file={formData.idDocument}
                onChange={(file) => handleFileUpload('idDocument', file)}
                icon={CreditCard}
              />

              <FileUploadField
                id="selfieDocument"
                label="Selfie holding your ID"
                description="Photo of you holding your ID — speeds up verification"
                file={formData.selfieDocument}
                onChange={(file) => handleFileUpload('selfieDocument', file)}
                icon={Camera}
              />
            </div>
          )}

          {/* ── Step 5: Review & Terms ── */}
          {currentStep === 5 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Review & submit
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Check your details before submitting
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
                {[
                  ['Email',        formData.email],
                  ['Name',         `${formData.firstName} ${formData.lastName}`.trim()],
                  ['Phone',        formData.phoneNumber],
                  ['Type',         professionalTypes.find(t => t.id === formData.professionalType)?.name || '—'],
                  ['Agency',       formData.agencyName || '—'],
                  ['National ID',  formData.nationalId],
                  ['ID Document',  formData.idDocument?.name || '—'],
                  ['Selfie',       formData.selfieDocument?.name || 'Not provided'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500 flex-shrink-0">{label}</span>
                    <span className="font-semibold text-gray-900 text-right truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* What happens next */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  What happens next?
                </h4>
                <ul className="text-xs sm:text-sm text-green-800 space-y-1 ml-7">
                  <li>• Your National ID is reviewed within 24 hours</li>
                  <li>• Once verified, your account goes live and you can list properties</li>
                  <li>• You can optionally complete a full professional profile later for a verified badge</li>
                </ul>
              </div>

              {/* Terms */}
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
                    . I confirm the information I've provided is accurate and my documents are genuine.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation disabled:opacity-50"
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
                    {currentStep === totalSteps ? 'Create My Account' : 'Continue'}
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

        <p className="text-center text-xs sm:text-sm text-gray-500 px-4">
          Already have an account?{' '}
          <a href="/auth" className="text-amber-600 hover:text-amber-700 font-semibold touch-manipulation">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

// ── Reusable File Upload Component (identical to original) ───────────────────
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