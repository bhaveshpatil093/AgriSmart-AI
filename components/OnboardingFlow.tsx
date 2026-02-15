import React, { useState, useEffect } from 'react';
import { User, UserRole, SoilType } from '../types';
import { i18n, Language } from '../utils/i18n';

interface OnboardingFlowProps {
  onComplete: (user: User) => void;
}

const NASHIK_TALUKAS = [
  'Niphad', 'Nashik', 'Dindori', 'Sinnar', 'Chandwad', 'Yeola', 'Nandgaon', 'Satana', 'Kalwan', 'Baglan', 'Malegaon', 'Surgana', 'Peint', 'Igatpuri', 'Trimbakeshwar'
];

const CROP_DATA = [
  {
    id: 'Grape',
    label: 'Grapes',
    icon: 'grape',
    color: 'bg-purple-50 text-purple-600', 
    varieties: ['Thompson', 'Crimson', 'Anushka', 'Sonaka', 'Super Sonaka', 'RK', 'RR35', 'Sudhakar', 'Jumbo Seedless', 'Black Sonaka', 'Sharad Seedless'],
    desc: 'Export quality viticulture.'
  },
  {
    id: 'Onion',
    label: 'Onions',
    icon: 'sprout',
    color: 'bg-amber-50 text-amber-600',
    varieties: ['Puna Fursungi', 'Panchganga', 'Kisan Gulabi', 'Chavhan Beej', 'Red Force', 'Prasad Gulabi'],
    desc: 'High-yield Kharif/Rabi.'
  },
  {
    id: 'Tomato',
    label: 'Tomatoes',
    icon: 'cherry', 
    color: 'bg-rose-50 text-rose-600',
    varieties: ['Sai 22', 'Viran', 'Ajitesh', '6242', '1057', 'Atharv', 'Aryaman', 'Ansal', 'Mahindra 575', 'Veer'],
    desc: 'Disease-resistant hybrids.'
  }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [sizeUnit, setSizeUnit] = useState<'acre' | 'hectare'>('acre');

  const [formData, setFormData] = useState<Partial<User> & { unit: 'acre' | 'hectare' }>({
    name: '',
    language: 'en',
    role: UserRole.FARMER,
    location: { village: '', ward: '' },
    farmDetails: {
      crops: [],
      size: 0,
      irrigation: 'drip',
      soilType: 'Black'
    },
    preferences: { 
      notifications: true,
      notificationChannels: { push: true, sms: true, voice: false },
      alertThresholds: { critical: true, warning: true, advisory: true },
      quietHours: { enabled: false, start: "22:00", end: "06:00" },
      categorySettings: { weather: true, market: true, community: true, advisory: true },
      units: 'metric'
    },
    unit: 'acre'
  });

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([]);
  const [varietySearch, setVarietySearch] = useState<string>('');
  const [showVarietyDropdown, setShowVarietyDropdown] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CROP_DATA.forEach(c => (init[c.id] = false));
    return init;
  });
  const [sectionSearch, setSectionSearch] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    CROP_DATA.forEach(c => (init[c.id] = ''));
    return init;
  });

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [step, loading, locationStatus, formData, selectedCropId, selectedVarieties, showVarietyDropdown]);

  // Close dropdown when clicking outside
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

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const detectLocation = () => {
    setLocationStatus('detecting');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: { village: 'Pimpalgaon Baswant', ward: 'Niphad Taluka' }
        }));
        setLocationStatus('success');
      },
      () => setLocationStatus('error')
    );
  };

  const finalize = () => {
    const finalSize = sizeUnit === 'hectare' ? (formData.farmDetails?.size || 0) * 2.471 : (formData.farmDetails?.size || 0);   

    const finalUser: User = {
      userId: 'u' + Math.random().toString(36).substr(2, 5),
      name: formData.name || 'Agri User',
      phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      language: formData.language as any,
      role: UserRole.FARMER,
      location: formData.location || { village: 'Nashik', ward: 'District' },
      farmDetails: {
        crops: selectedCropId ? [selectedCropId] : [],
        cropVarieties: selectedVarieties,
        size: finalSize,
        irrigation: formData.farmDetails?.irrigation || 'drip',
        soilType: formData.farmDetails?.soilType || 'Black'
      },
      preferences: formData.preferences as User['preferences'],
      createdAt: new Date().toISOString()
    };
    try {
      console.log('[OnboardingFlow] finalize - calling onComplete with user:', finalUser);
      onComplete(finalUser);
    } catch (err) {
      console.error('[OnboardingFlow] error in finalize/onComplete', err);
    }
  };

  const toggleVariety = (variety: string) => {
    setSelectedVarieties(prev => {
      const next = prev.includes(variety) ? prev.filter(v => v !== variety) : [...prev, variety];
      console.log('[OnboardingFlow] toggleVariety ->', variety, 'next selection:', next);
      return next;
    });
  };

  const getFilteredVarieties = () => {
    if (!selectedCropId) return [];
    const crop = CROP_DATA.find(c => c.id === selectedCropId);
    if (!crop) return [];
    if (!varietySearch) return crop.varieties;
    return crop.varieties.filter(v =>
      v.toLowerCase().includes(varietySearch.toLowerCase())
    );
  };

  const getVarietiesByCrop = () => {
    // Group all varieties by crop type for display
    return CROP_DATA.map(crop => ({
      cropId: crop.id,
      cropLabel: crop.label,
      varieties: varietySearch
        ? crop.varieties.filter(v => v.toLowerCase().includes(varietySearch.toLowerCase()))
        : crop.varieties
    })).filter(group => group.varieties.length > 0);
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Welcome
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[15px] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i data-lucide="sprout" className="w-8 h-8"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{i18n.translate('onboarding.welcome')}</h2>     
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Digitizing climate resilience for Nashik farmers.</p>
            </div>

            <div className="space-y-3">
              {[
                { icon: 'zap', title: 'Smart Alerts', desc: 'Frost & pest warnings per ward.' },
                { icon: 'trending-up', title: 'Mandi Pulse', desc: 'Predictive pricing for your harvest.' },
                { icon: 'camera', title: 'AI Diagnostics', desc: 'Instant crop disease identification.' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-[15px] border border-slate-100 transition-colors hover:bg-slate-100/50">
                  <div className="w-10 h-10 bg-white rounded-[15px] flex items-center justify-center shrink-0 shadow-sm text-emerald-600">
                    <i data-lucide={benefit.icon} className="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{benefit.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-emerald-600 text-white rounded-[15px] font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
          </div>
        );

      case 2: // Language
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{i18n.translate('onboarding.languagePreference')}</h2>
              <p className="text-sm text-slate-500 font-medium">{i18n.translate('onboarding.selectLanguage')}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'mr', label: 'मराठी', sub: 'Marathi', flag: '🇮🇳' },
                { id: 'hi', label: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' },
                { id: 'en', label: 'English', sub: 'Global', flag: '🌐' }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setFormData({ ...formData, language: lang.id as any });
                    i18n.setLanguage(lang.id as Language);
                  }}
                  className={`flex items-center justify-between p-5 border rounded-[15px] text-left transition-all group ${formData.language === lang.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">{lang.flag}</span>
                    <div>
                      <div className="font-bold text-slate-900">{lang.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang.sub}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.language === lang.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-transparent'}`}>
                    <i data-lucide="check" className="w-3 h-3"></i>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.language}
                className="w-full py-4 bg-emerald-600 text-white rounded-[15px] font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:bg-slate-200"
              >
                {i18n.translate('common.continue')}
              </button>
              <button onClick={handleBack} className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{i18n.translate('common.back')}</button>
            </div>
          </div>
        );

      case 3: // Location
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Location</h2>
              <p className="text-sm text-slate-500 font-medium">Used for ward-level climate tracking.</p>
            </div>

            <button
              onClick={detectLocation}
              className={`w-full p-6 rounded-[15px] border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${locationStatus === 'detecting' ? 'bg-blue-50 border-blue-200' : locationStatus === 'success' ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
            >
              <div className={`w-12 h-12 rounded-[15px] flex items-center justify-center shadow-sm ${locationStatus === 'detecting' ? 'bg-blue-100 text-blue-600 animate-pulse' : locationStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-white text-blue-600'}`}>
                <i data-lucide={locationStatus === 'success' ? 'check' : 'map-pin'} className="w-6 h-6"></i>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-slate-900 block">
                  {locationStatus === 'detecting' ? 'Detecting...' : locationStatus === 'success' ? 'Location Synced' : 'Auto-Detect Location'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Nashik Regional Nodes</span>
              </div>
            </button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="relative bg-white px-3 text-[10px] font-black uppercase text-slate-300 tracking-widest">Or Manual</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taluka (Block)</label>  
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.location?.ward || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, ward: e.target.value } })}     
                >
                  <option value="">Select Taluka</option>
                  {NASHIK_TALUKAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Village Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ozar"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.location?.village || ''}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, village: e.target.value } })}  
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.location?.village}
                className="w-full py-4 bg-emerald-600 text-white rounded-[15px] font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:bg-slate-200"
              >
                Proceed
              </button>
              <button onClick={handleBack} className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Go Back</button>
            </div>
          </div>
        );

      case 4: // Farm Profile
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{i18n.translate('onboarding.farmProfile')}</h2>  
              <p className="text-sm text-slate-500 font-medium">{i18n.translate('onboarding.selectCrop')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CROP_DATA.map(crop => (
                <button
                  key={crop.id}
                  onClick={() => {
                    setSelectedCropId(crop.id);
                    setSelectedVariety(crop.varieties[0]);
                    setSelectedVarieties([]);
                    setVarietySearch('');
                    setShowVarietyDropdown(false);
                  }}
                  className={`p-4 rounded-[15px] border text-left transition-all relative group ${selectedCropId === crop.id ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`w-10 h-10 ${crop.color} rounded-[15px] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <i data-lucide={crop.icon} className="w-5 h-5"></i>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{crop.label}</div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-tight mt-1">{crop.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4 animate-slide-up bg-slate-50 p-5 rounded-[15px] border border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{i18n.translate('onboarding.selectVarieties')}</label>
                {/* Collapsible crop sections - one per crop */}
                <div className="space-y-3">
                  {CROP_DATA.map(crop => {
                    const isExpanded = !!expanded?.[crop.id];
                    const searchVal = (sectionSearch[crop.id] || '').toLowerCase();
                    const filtered = crop.varieties.filter(v => v.toLowerCase().includes(searchVal));
                    const selectedCount = crop.varieties.filter(v => selectedVarieties.includes(v)).length;
                    return (
                      <div key={crop.id} className={`rounded-[15px] overflow-hidden border-2 transition-all ${isExpanded ? 'border-slate-200 shadow-md' : 'border-slate-100'}`}>
                        <button
                          type="button"
                          onClick={() => setExpanded(prev => ({ ...prev, [crop.id]: !prev[crop.id] }))}
                          className={`w-full flex items-center justify-between px-4 py-3.5 ${crop.color} rounded-[15px] transition-all hover:opacity-90`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-white/50 rounded-[12px] flex items-center justify-center`}>
                              <i data-lucide={crop.icon} className="w-5 h-5"></i>
                            </div>
                            <div>
                              <div className="font-black text-base">{crop.label.toUpperCase()}</div>
                              {selectedCount > 0 && (
                                <div className="text-[10px] font-bold opacity-75">{selectedCount} selected</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedCount > 0 && (
                              <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center text-xs font-black">
                                {selectedCount}
                              </div>
                            )}
                            <i data-lucide={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-5 h-5"></i>
                          </div>
                        </button>

                        <div 
                          className={`transition-all duration-300 ease-in-out overflow-hidden bg-white`}
                          style={{ 
                            maxHeight: isExpanded ? '500px' : '0',
                            opacity: isExpanded ? 1 : 0
                          }}
                        >
                          <div className="p-4 space-y-3">
                            <input
                              type="search"
                              placeholder={`Search ${crop.label} varieties...`}
                              value={sectionSearch[crop.id] || ''}
                              onChange={(e) => setSectionSearch(prev => ({ ...prev, [crop.id]: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />

                            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                              {filtered.map(v => {
                                const isSelected = selectedVarieties.includes(v);
                                return (
                                  <label 
                                    key={v} 
                                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                                      isSelected 
                                        ? 'bg-emerald-50 border-2 border-emerald-200' 
                                        : 'hover:bg-slate-50 border-2 border-transparent'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected 
                                        ? 'bg-emerald-600 border-emerald-600' 
                                        : 'border-slate-300 bg-white'
                                    }`}>
                                      {isSelected && (
                                        <i data-lucide="check" className="w-3 h-3 text-white"></i>
                                      )}
                                    </div>
                                    <span className={`text-sm font-bold flex-1 ${
                                      isSelected ? 'text-emerald-900' : 'text-slate-700'
                                    }`}>{v}</span>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleVariety(v)}
                                      className="sr-only"
                                    />
                                  </label>
                                );
                              })}
                              {filtered.length === 0 && (
                                <div className="text-sm text-slate-400 py-4 text-center font-medium">No varieties found</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedVarieties.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i18n.translate('onboarding.selectedVarieties')}:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedVarieties.map((variety) => (
                        <div
                          key={variety}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center space-x-2"
                        >
                          <span>{variety}</span>
                          <button
                            onClick={() => toggleVariety(variety)}
                            className="hover:text-emerald-900"
                          >
                            <i data-lucide="x" className="w-3 h-3"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area</label>        
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0"
                      className="w-full p-3 bg-white border border-slate-100 rounded-[15px] font-black text-slate-900 pr-12 outline-none"
                      onChange={(e) => setFormData({ ...formData, farmDetails: { ...formData.farmDetails!, size: parseFloat(e.target.value) } })}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Acres</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soil Type</label>   
                  <select
                    className="w-full p-3 bg-white border border-slate-100 rounded-[15px] font-bold text-slate-700 outline-none"
                    onChange={(e) => setFormData({ ...formData, farmDetails: { ...formData.farmDetails!, soilType: e.target.value as SoilType } })}
                  >
                    <option value="Black">Black Cotton</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <button 
                onClick={handleNext}
                disabled={!formData.farmDetails?.size || selectedVarieties.length === 0}
                className="w-full py-4 bg-emerald-600 text-white rounded-[15px] font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:bg-slate-200"
              >
                {i18n.translate('onboarding.complete')}
              </button>
              <button onClick={handleBack} className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{i18n.translate('common.back')}</button>
            </div>
          </div>
        );

      case 5: // Summary
        return (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-[15px] flex items-center justify-center mx-auto mb-4 shadow-xl relative">
              <div className="absolute inset-0 rounded-[15px] bg-emerald-500/20 animate-ping"></div>
              <i data-lucide="award" className="w-8 h-8 relative z-10"></i>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Configuration Complete</h2>
              <p className="text-sm text-slate-500 font-medium">Verify your details before launching.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[15px] border border-slate-100 text-left space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Focus</div>
                  <div className="text-sm font-black text-slate-800">{selectedCropId}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Varieties</div>      
                  <div className="text-sm font-black text-slate-800">{selectedVarieties.length} varieties</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plot Scale</div>
                  <div className="text-sm font-black text-slate-800">{formData.farmDetails?.size} Acres</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Zone</div>
                  <div className="text-sm font-black text-slate-800">{formData.location?.village}, {formData.location?.ward}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Language</div>
                  <div className="text-sm font-black text-slate-800 uppercase">{formData.language} Mode</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-start space-x-3">
                 <i data-lucide="info" className="w-4 h-4 text-blue-500 mt-0.5"></i>
                 <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">Initializing historical climate logs for Nashik region...</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-6">
              <button
                onClick={finalize}
                className="w-full py-4 bg-slate-900 text-white rounded-[15px] font-bold text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all"
              >
                Launch Dashboard
              </button>
              <button onClick={handleBack} className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Edit Details</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[15px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
        {/* Progress bar refined */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
          <div
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-[15px] flex items-center justify-center text-white shadow-sm">     
                  <i data-lucide="sprout" className="w-5 h-5"></i>
              </div>
              <span className="font-black text-lg text-emerald-950 tracking-tighter">AgriSmart AI</span>
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Step 0{step} / 05</div>
          </div>

          {renderStep()}
        </div>
      </div>

      <div className="mt-8 text-center space-y-1 opacity-40">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Generation Agriculture Infrastructure</p>
        <p className="text-[9px] font-bold text-slate-400">© 2024 Climate-Smart AI Initiative</p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;
