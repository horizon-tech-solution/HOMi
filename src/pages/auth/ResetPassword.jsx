// src/pages/public/ResetPassword.jsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, Building2, CheckCircle2, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Email passed from ForgotPassword via navigate state
  const email = location.state?.email || '';

  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState('');

  // If someone navigates here directly without going through ForgotPassword
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-gray-900 text-lg font-semibold">Invalid access</p>
          <p className="text-gray-500 text-sm">Please go through the forgot password flow.</p>
          <Link to="/forgot-password"
            className="w-full flex items-center justify-center py-4 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-colors">
            Reset my password
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/user/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, password_confirmation: confirm }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Reset failed. Please try again.'); return; }

      setDone(true);
      setTimeout(() => navigate('/auth', { replace: true }), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength = (() => {
    if (!password) return null;
    if (password.length < 6)  return { level: 1, label: 'Too short',  color: 'bg-red-400'    };
    if (password.length < 8)  return { level: 2, label: 'Weak',       color: 'bg-orange-400' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
                               return { level: 3, label: 'Fair',       color: 'bg-yellow-400' };
    return                            { level: 4, label: 'Strong',     color: 'bg-green-500'  };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Building2 className="w-10 h-10 text-amber-600" />
            <span className="text-3xl font-black text-gray-900">
              HOM<span className="text-amber-600">i</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {done ? 'Password updated!' : 'Set new password'}
          </h1>
          <p className="text-gray-600">
            {done ? 'Redirecting you to login…' : `Resetting password for ${email}`}
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-gray-500 text-sm">Your password has been reset successfully.</p>
            <Link to="/auth"
              className="w-full flex items-center justify-center py-4 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-colors">
              Go to login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* New password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="New password"
                  autoFocus
                  className="w-full pl-8 pr-12 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-0 top-4 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.level ? strength.color : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Lock className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="Confirm new password"
                className="w-full pl-8 pr-12 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
              />
              {confirm && (
                <span className="absolute right-0 top-4">
                  {password === confirm
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <XCircle      className="w-5 h-5 text-red-400"   />
                  }
                </span>
              )}
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button
              onClick={handleReset}
              disabled={!password || !confirm || loading}
              className="w-full py-5 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating…</>
                : 'Update password'
              }
            </button>

            <Link to="/auth"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 font-medium">
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;