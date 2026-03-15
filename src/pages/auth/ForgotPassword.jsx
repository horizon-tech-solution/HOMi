// src/pages/public/ForgotPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, Building2 } from 'lucide-react';

const ForgotPassword = () => {
  const navigate        = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email'); return; }
    if (!/\S+@\S+\.\S+/.test(trimmed)) { setError('Please enter a valid email'); return; }

    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/user/auth/check', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (data.exists) {
        // Email found — go straight to reset page with email in state
        navigate('/auth/reset-password', { state: { email: trimmed } });
      } else {
        setError('No account found with this email address.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-gray-600 text-lg">Enter your email to reset your password</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              autoFocus
              className="w-full pl-8 py-4 bg-transparent text-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 focus:border-amber-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!email || loading}
            className="w-full py-5 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking…</>
              : <>Continue <ArrowRight className="w-5 h-5" /></>
            }
          </button>

          <Link to="/auth"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;