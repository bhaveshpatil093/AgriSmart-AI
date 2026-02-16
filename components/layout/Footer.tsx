import React, { useState, useEffect } from 'react';
import { i18n, Language } from '../../utils/i18n';

const Footer: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLang(e.detail);
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    i18n.setLanguage(newLang);
    setCurrentLang(newLang);
    // Reload icons after language change
    setTimeout(() => {
      // @ts-ignore
      if (window.lucide) window.lucide.createIcons();
    }, 100);
  };

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [currentLang]);

  return (
    <footer className="mt-20 border-t border-slate-100 bg-white py-12 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600/10 text-emerald-600 rounded-lg flex items-center justify-center font-black">
            <i data-lucide="sprout" className="w-4 h-4"></i>
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tighter">AgriSmart Nashik Platform</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-emerald-600 transition-colors">{i18n.translate('footer.privacyPolicy')}</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">{i18n.translate('footer.termsOfService')}</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">{i18n.translate('footer.safetyGuidelines')}</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">{i18n.translate('footer.regionalLabs')}</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400">
            <i data-lucide="globe" className="w-3 h-3 text-emerald-500"></i>
            <select 
              value={currentLang}
              onChange={handleLanguageChange}
              className="bg-transparent border-none focus:outline-none cursor-pointer hover:text-emerald-600"
            >
              <option value="mr">मराठी</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          <p className="text-[10px] font-bold text-slate-400">© 2024 AgriSmart Nashik</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
