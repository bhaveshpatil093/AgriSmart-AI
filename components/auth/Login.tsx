import React, { useState, useEffect } from 'react';
import { SupabaseAuth } from '../../client_api/auth/supabaseAuth';
import { useAuth } from '../../contexts/AuthContext';
import { i18n } from '../../utils/i18n';
import { AppView } from '../../types';

interface LoginProps {
  onSwitchToSignup: () => void;
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onSuccess }) => {
  const { setUser } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [authMethod, otpSent]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await SupabaseAuth.signInWithPassword(email, password);
    
    if (result.success && result.data) {
      // Fetch user profile
      const profileResult = await SupabaseAuth.getUserProfile(result.data.user.id);
      
      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data);
        if (rememberMe) {
          localStorage.setItem('agri_smart_remember', 'true');
        }
        onSuccess?.();
      } else {
        setError('Failed to load user profile');
      }
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handlePhoneOTP = async () => {
    setError('');
    setLoading(true);

    const result = await SupabaseAuth.sendOTP(phone);
    
    if (result.success) {
      setOtpSent(true);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
    
    setLoading(false);
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await SupabaseAuth.verifyOTP(phone, otp);
    
    if (result.success && result.data) {
      const profileResult = await SupabaseAuth.getUserProfile(result.data.user.id);
      
      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data);
        onSuccess?.();
      } else {
        setError('Failed to load user profile');
      }
    } else {
      setError(result.error || 'Invalid OTP');
    }
    
    setLoading(false);
  };

  // Google login removed - keep email/password and phone OTP flows only

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    const result = await SupabaseAuth.resetPassword(email);
    
    if (result.success) {
      setError('');
      alert('Password reset email sent! Check your inbox.');
    } else {
      setError(result.error || 'Failed to send reset email');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i data-lucide="sprout" className="w-8 h-8"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-emerald-100 text-sm font-medium">Sign in to continue to AgriSmart</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Auth Method Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMethod === 'email' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setAuthMethod('phone');
                setOtpSent(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMethod === 'phone' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
              <i data-lucide="alert-circle" className="w-5 h-5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password Form */}
          {authMethod === 'email' && !otpSent && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <i data-lucide={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5"></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Phone OTP Form */}
          {authMethod === 'phone' && !otpSent && (
            <form onSubmit={(e) => { e.preventDefault(); handlePhoneOTP(); }} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {otpSent && (
            <form onSubmit={handleOTPVerify} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-center tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  OTP sent to {phone}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          {!otpSent && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>
          )}

          {/* Google Sign In removed - only Email/Phone flows supported */}

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-emerald-600 font-bold hover:text-emerald-700"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
