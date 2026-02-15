export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  // Common
  common: {
    welcome: string;
    dashboard: string;
    profile: string;
    settings: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
  };
  
  // Navigation
  nav: {
    home: string;
    myCrops: string;
    voice: string;
    markets: string;
    impact: string;
    profile: string;
    dashboard: string;
  };
  
  // Impact Metrics
  impact: {
    title: string;
    betterPrice: string;
    reductionMiddlemen: string;
    marketTransparency: string;
    viewDetails: string;
  };
  
  // Onboarding
  onboarding: {
    welcome: string;
    languagePreference: string;
    selectLanguage: string;
    location: string;
    farmProfile: string;
    selectCrop: string;
    cropVarieties: string;
    selectVarieties: string;
    searchVarieties: string;
    selectedVarieties: string;
    complete: string;
  };
  
  // Dashboard
  dashboard: {
    greeting: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    tasks: string;
    marketPulse: string;
    cropInventory: string;
  };
  
  // Footer
  footer: {
    privacyPolicy: string;
    termsOfService: string;
    safetyGuidelines: string;
    regionalLabs: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
      back: 'Go Back',
      next: 'Next',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    nav: {
      home: 'Home',
      myCrops: 'My Crops',
      voice: 'Voice',
      markets: 'Markets',
      impact: 'Impact',
      profile: 'Profile',
      dashboard: 'Dashboard',
    },
    impact: {
      title: 'Market Impact Metrics',
      betterPrice: 'Better Price Realization',
      reductionMiddlemen: 'Reduction in Middlemen Dependency',
      marketTransparency: 'Market Transparency',
      viewDetails: 'View Details',
    },
    onboarding: {
      welcome: 'Welcome to AgriSmart',
      languagePreference: 'Language Preference',
      selectLanguage: 'Select for advice and critical alerts.',
      location: 'Your Location',
      farmProfile: 'Farm Profile',
      selectCrop: 'Select your primary cultivation focus.',
      cropVarieties: 'Crop Varieties',
      selectVarieties: 'Select Crop Varieties',
      searchVarieties: 'Search varieties...',
      selectedVarieties: 'Selected Varieties',
      complete: 'Complete Profile',
    },
    dashboard: {
      greeting: 'Good Morning',
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      tasks: 'Focus Tasks',
      marketPulse: 'Market Pulse',
      cropInventory: 'Crop Inventory',
    },
    footer: {
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      safetyGuidelines: 'Safety Guidelines',
      regionalLabs: 'Regional Labs',
    },
  },
  hi: {
    common: {
      welcome: 'स्वागत है',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      continue: 'जारी रखें',
      back: 'वापस जाएं',
      next: 'अगला',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',
    },
    nav: {
      home: 'होम',
      myCrops: 'मेरी फसलें',
      voice: 'आवाज़',
      markets: 'बाज़ार',
      impact: 'प्रभाव',
      profile: 'प्रोफ़ाइल',
      dashboard: 'डैशबोर्ड',
    },
    impact: {
      title: 'बाज़ार प्रभाव मेट्रिक्स',
      betterPrice: 'बेहतर मूल्य प्राप्ति',
      reductionMiddlemen: 'मध्यस्थ निर्भरता में कमी',
      marketTransparency: 'बाज़ार पारदर्शिता',
      viewDetails: 'विवरण देखें',
    },
    onboarding: {
      welcome: 'AgriSmart में आपका स्वागत है',
      languagePreference: 'भाषा वरीयता',
      selectLanguage: 'सलाह और महत्वपूर्ण अलर्ट के लिए चुनें।',
      location: 'आपका स्थान',
      farmProfile: 'खेत प्रोफ़ाइल',
      selectCrop: 'अपनी प्राथमिक खेती फोकस चुनें।',
      cropVarieties: 'फसल किस्में',
      selectVarieties: 'फसल किस्में चुनें',
      searchVarieties: 'किस्में खोजें...',
      selectedVarieties: 'चयनित किस्में',
      complete: 'प्रोफ़ाइल पूर्ण करें',
    },
    dashboard: {
      greeting: 'सुप्रभात',
      goodMorning: 'सुप्रभात',
      goodAfternoon: 'सुअपराह्न',
      goodEvening: 'सुसंध्या',
      tasks: 'फोकस कार्य',
      marketPulse: 'बाज़ार पल्स',
      cropInventory: 'फसल इन्वेंटरी',
    },
    footer: {
      privacyPolicy: 'गोपनीयता नीति',
      termsOfService: 'सेवा की शर्तें',
      safetyGuidelines: 'सुरक्षा दिशानिर्देश',
      regionalLabs: 'क्षेत्रीय प्रयोगशालाएं',
    },
  },
  mr: {
    common: {
      welcome: 'स्वागत आहे',
      dashboard: 'डॅशबोर्ड',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      continue: 'पुढे जा',
      back: 'मागे जा',
      next: 'पुढील',
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      success: 'यशस्वी',
    },
    nav: {
      home: 'होम',
      myCrops: 'माझ्या पिके',
      voice: 'आवाज',
      markets: 'बाजार',
      impact: 'प्रभाव',
      profile: 'प्रोफाइल',
      dashboard: 'डॅशबोर्ड',
    },
    impact: {
      title: 'बाजार प्रभाव मेट्रिक्स',
      betterPrice: 'चांगली किंमत प्राप्ती',
      reductionMiddlemen: 'मध्यस्थ अवलंबनात घट',
      marketTransparency: 'बाजार पारदर्शकता',
      viewDetails: 'तपशील पहा',
    },
    onboarding: {
      welcome: 'AgriSmart मध्ये आपले स्वागत आहे',
      languagePreference: 'भाषा प्राधान्य',
      selectLanguage: 'सल्ला आणि महत्त्वाच्या सूचनांसाठी निवडा.',
      location: 'तुमचे स्थान',
      farmProfile: 'शेत प्रोफाइल',
      selectCrop: 'तुमचा प्राथमिक लागवड फोकस निवडा.',
      cropVarieties: 'पिक किस्म',
      selectVarieties: 'पिक किस्म निवडा',
      searchVarieties: 'किस्म शोधा...',
      selectedVarieties: 'निवडलेल्या किस्म',
      complete: 'प्रोफाइल पूर्ण करा',
    },
    dashboard: {
      greeting: 'सुप्रभात',
      goodMorning: 'सुप्रभात',
      goodAfternoon: 'दुपारी',
      goodEvening: 'संध्याकाळी',
      tasks: 'फोकस कार्ये',
      marketPulse: 'बाजार पल्स',
      cropInventory: 'पिक इन्व्हेंटरी',
    },
    footer: {
      privacyPolicy: 'गोपनीयता धोरण',
      termsOfService: 'सेवा अटी',
      safetyGuidelines: 'सुरक्षा मार्गदर्शक तत्त्वे',
      regionalLabs: 'प्रादेशिक प्रयोगशाळा',
    },
  },
};

let currentLanguage: Language = 'en';

export const i18n = {
  setLanguage: (lang: Language) => {
    currentLanguage = lang;
    localStorage.setItem('agri_smart_language', lang);
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  },
  
  getLanguage: (): Language => {
    const stored = localStorage.getItem('agri_smart_language') as Language;
    return stored || 'en';
  },
  
  t: (key: keyof Translations): string => {
    const lang = currentLanguage || i18n.getLanguage();
    const keys = key.split('.') as any[];
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  },
  
  // Helper to get nested translations
  translate: (path: string): string => {
    const lang = currentLanguage || i18n.getLanguage();
    const keys = path.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || path;
  },
};

// Initialize language from localStorage
currentLanguage = i18n.getLanguage();
