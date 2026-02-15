import React, { useState, useEffect } from 'react';
import { SupabaseAuth, SignUpData } from '../../api/auth/supabaseAuth';
import { useAuth } from '../../contexts/AuthContext';
import { i18n } from '../../utils/i18n';
// Crop varieties data
const CROP_DATA = [
  { 
    id: 'Grape', 
    label: 'Grapes', 
    varieties: ['Thompson', 'Crimson', 'Anushka', 'Sonaka', 'Super Sonaka', 'RK', 'RR35', 'Sudhakar', 'Jumbo Seedless', 'Black Sonaka', 'Sharad Seedless']
  },
  { 
    id: 'Onion', 
    label: 'Onions', 
    varieties: ['Puna Fursungi', 'Panchganga', 'Kisan Gulabi', 'Chavhan Beej', 'Red Force', 'Prasad Gulabi']
  },
  { 
    id: 'Tomato', 
    label: 'Tomatoes', 
    varieties: ['Sai 22', 'Viran', 'Ajitesh', '6242', '1057', 'Atharv', 'Aryaman', 'Ansal', 'Mahindra 575', 'Veer']
  }
];

interface SignupProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const NASHIK_TALUKAS = [
  'Niphad', 'Nashik', 'Dindori', 'Sinnar', 'Chandwad', 'Yeola', 'Nandgaon', 'Satana', 'Kalwan', 'Baglan', 'Malegaon', 'Surgana', 'Peint', 'Igatpuri', 'Trimbakeshwar'
];

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    location: { village: '', ward: '' },
    cropVarieties: [],
    language: 'en'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Crop variety selection
  const [varietySearch, setVarietySearch] = useState('');
  const [showVarietyDropdown, setShowVarietyDropdown] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [step, showVarietyDropdown]);

  const toggleVariety = (variety: string) => {
    setFormData(prev => ({
      ...prev,
      cropVarieties: prev.cropVarieties.includes(variety)
        ? prev.cropVarieties.filter(v => v !== variety)
        : [...prev.cropVarieties, variety]
    }));
  };

  const getVarietiesByCrop = () => {
    return CROP_DATA.map(crop => ({
      cropId: crop.id,
      cropLabel: crop.label,
      varieties: varietySearch 
        ? crop.varieties.filter(v => v.toLowerCase().includes(varietySearch.toLowerCase()))
        : crop.varieties
    })).filter(group => group.varieties.length > 0);
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Valid phone number is required');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.location.village.trim()) {
      setError('Village name is required');
      return false;
    }
    if (!formData.location.ward.trim()) {
      setError('Taluka/Ward is required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.cropVarieties.length === 0) {
      setError('Please select at least one crop variety');
      return false;
    }
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setError('');
    setLoading(true);

    const result = await SupabaseAuth.signUp(formData);
    
    if (result.success && result.data) {
      // Fetch user profile
      const profileResult = await SupabaseAuth.getUserProfile(result.data.user.id);
      
      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data);
        onSuccess?.();
      } else {
        setError('Account created but failed to load profile');
      }
    } else {
      setError(result.error || 'Sign up failed');
    }
    
    setLoading(false);
  };

  // Google signup removed - only Email and Phone auth supported

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.variety-dropdown-container')) {
        setShowVarietyDropdown(false);
      }
    };
    if (showVarietyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVarietyDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="sprout" className="w-8 h-8"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Create Account</h1>
            <p className="text-emerald-100 text-sm font-medium">Join AgriSmart Nashik Platform</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-8 space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step ? 'bg-emerald-600 w-8' : s < step ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              ></div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
              <i data-lucide="alert-circle" className="w-5 h-5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ramesh Patil"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="farmer@example.com"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
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

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <i data-lucide={showConfirmPassword ? 'eye-off' : 'eye'} className="w-5 h-5"></i>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Taluka (Block) *
                </label>
                <select
                  value={formData.location.ward}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, ward: e.target.value } })}
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Taluka</option>
                  {NASHIK_TALUKAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Village Name *
                </label>
                <input
                  type="text"
                  value={formData.location.village}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, village: e.target.value } })}
                  placeholder="e.g. Pimpalgaon Baswant"
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Crop Varieties */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Select Crop Varieties *
                </label>
                <div className="relative variety-dropdown-container">
                  <input
                    type="text"
                    placeholder="Search and select varieties..."
                    value={varietySearch}
                    onChange={(e) => {
                      setVarietySearch(e.target.value);
                      setShowVarietyDropdown(true);
                    }}
                    onFocus={() => setShowVarietyDropdown(true)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {showVarietyDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {getVarietiesByCrop().map((group) => (
                        <div key={group.cropId} className="border-b border-slate-100 last:border-b-0">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0">
                            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{group.cropLabel}</span>
                          </div>
                          {group.varieties.map((variety) => (
                            <div
                              key={`${group.cropId}-${variety}`}
                              onClick={() => {
                                toggleVariety(variety);
                                setVarietySearch('');
                              }}
                              className={`p-3 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center space-x-3 ${
                                formData.cropVarieties.includes(variety) ? 'bg-emerald-50' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                formData.cropVarieties.includes(variety) 
                                  ? 'bg-emerald-600 border-emerald-600' 
                                  : 'border-slate-300'
                              }`}>
                                {formData.cropVarieties.includes(variety) && (
                                  <i data-lucide="check" className="w-3 h-3 text-white"></i>
                                )}
                              </div>
                              <span className="text-sm font-bold text-slate-700">{variety}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formData.cropVarieties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.cropVarieties.map((variety) => (
                      <div
                        key={variety}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center space-x-2"
                      >
                        <span>{variety}</span>
                        <button
                          type="button"
                          onClick={() => toggleVariety(variety)}
                          className="hover:text-emerald-900"
                        >
                          <i data-lucide="x" className="w-3 h-3"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-sm text-slate-600 font-medium">
                    I agree to the Terms and Conditions and Privacy Policy
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          {step === 1 && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">Or sign up with</span>
              </div>
            </div>
          )}

          {/* Google Sign Up removed per request - keep only Email/Phone flows */}

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-600 font-bold hover:text-emerald-700"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
