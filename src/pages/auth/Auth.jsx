import { useState } from 'react';
import { Mail, Phone, ArrowRight, Loader2, Eye, EyeOff, Building2, Lock } from 'lucide-react';
import Alert from '../../components/Alert';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [step, setStep] = useState('identifier'); // 'identifier', 'password', 'create'
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [name, setName] = useState('');
  
  // Alert state
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 10000);
  };

  const checkUserExists = async () => {
    setLoading(true);
    
    // Simulate API call to check if user exists
    setTimeout(() => {
      // Mock: Check if identifier contains 'existing'
      const exists = identifier.toLowerCase().includes('existing');
      setUserExists(exists);
      
      if (exists) {
        setStep('password'); // Show login
      } else {
        setStep('create'); // Show signup
      }
      setLoading(false);
    }, 1000);
  };

  const handleLogin = async () => {
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      showAlert('Login successful!', 'success');
      setLoading(false);
    }, 1000);
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      showAlert('Passwords do not match!', 'error');
      return;
    }
    
    setLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      showAlert('Account created successfully!', 'success');
      setLoading(false);
    }, 1000);
  };

  const resetForm = () => {
    setStep('identifier');
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setUserExists(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Alert */}
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Building2 className="w-10 h-10 text-amber-600" />
            <span className="text-3xl font-black text-gray-900">
              HOM<span className="text-amber-600">i</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'identifier' && 'Welcome'}
            {step === 'password' && 'Welcome back'}
            {step === 'create' && 'Create your account'}
          </h1>
          <p className="text-gray-600 text-lg">
            {step === 'identifier' && 'Enter your email or phone to continue'}
            {step === 'password' && `Sign in to continue`}
            {step === 'create' && 'Just a few details to get started'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          
          {/* Step 1: Enter Email/Phone */}
          {step === 'identifier' && (
            <>
              {/* Method Toggle */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-4 px-6 rounded-full font-semibold transition-all ${
                    method === 'email'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-5 h-5 inline mr-2" />
                  Email
                </button>
                <button
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-4 px-6 rounded-full font-semibold transition-all ${
                    method === 'phone'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="w-5 h-5 inline mr-2" />
                  Phone
                </button>
              </div>

              {/* Input Field */}
              <div>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'email' ? 'your@email.com' : '+237 6XX XXX XXX'}
                  className="w-full px-0 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                  autoFocus
                />
              </div>

              {/* Continue Button */}
              <button
                onClick={checkUserExists}
                disabled={!identifier || loading}
                className="w-full py-5 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center mt-6">
                We'll check if you have an account or help you create one
              </p>
              
              <div>
                <Link to="/user/pro-account" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                 I am a professional
                </Link>
              </div>
              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => showAlert('Google login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all group"
                  title="Continue with Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Facebook login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all group"
                  title="Continue with Facebook"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Apple login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all group"
                  title="Continue with Apple"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Step 2: Login (Existing User) */}
          {step === 'password' && (
            <>
              {/* Show identifier */}
              <div className="bg-amber-50 rounded-full px-6 py-3 mb-8">
                <p className="text-sm text-amber-800 font-medium text-center">
                  {identifier}
                  <button
                    onClick={resetForm}
                    className="ml-3 text-amber-600 hover:text-amber-700 underline"
                  >
                    Change
                  </button>
                </p>
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-8 pr-12 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={!password || loading}
                className="w-full py-5 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <a href="#" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Social Login Options */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 font-medium">or sign in with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => showAlert('Google login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Facebook login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Facebook"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Apple login coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Apple"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Step 3: Create Account (New User) */}
          {step === 'create' && (
            <>
              {/* Show identifier */}
              <div className="bg-green-50 rounded-full px-6 py-3 mb-8">
                <p className="text-sm text-green-800 font-medium text-center">
                  {identifier}
                  <button
                    onClick={resetForm}
                    className="ml-3 text-green-600 hover:text-green-700 underline"
                  >
                    Change
                  </button>
                </p>
              </div>

              <p className="text-gray-700 mb-6 text-center">
                No account found. Let's create one!
              </p>

              {/* Name Input */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-0 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-8 pr-12 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-8 pr-12 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                />
              </div>

              {/* Create Account Button */}
              <button
                onClick={handleSignup}
                disabled={!name || !password || !confirmPassword || loading}
                className="w-full py-5 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Social Login Options */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 font-medium">or sign up with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => showAlert('Google signup coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Facebook signup coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Facebook"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <button
                  onClick={() => showAlert('Apple signup coming soon!', 'info')}
                  className="flex items-center justify-center py-4 bg-white rounded-full hover:bg-gray-50 transition-all"
                  title="Continue with Apple"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'create' && (
          <p className="text-center text-sm text-gray-500 mt-8 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">
              Privacy Policy
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;