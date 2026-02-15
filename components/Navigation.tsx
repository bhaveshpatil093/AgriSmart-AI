
import React, { useState } from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: AppView.DASHBOARD, label: 'Home', icon: 'home' },
    { id: AppView.CROP_MANAGEMENT, label: 'My Crops', icon: 'sprout' },
    { id: AppView.VOICE_ADVISOR, label: 'Voice', icon: 'mic', isSpecial: true },
    { id: AppView.MARKET_INTELLIGENCE, label: 'Markets', icon: 'bar-chart-3' },
  ];

  const moreNavItems = [
    {
      section: 'Crop Care', items: [
        { id: AppView.GRAPE_ADVISORY, label: 'Grapes', icon: 'grape', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: AppView.ONION_ADVISORY, label: 'Onions', icon: 'layers', color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: AppView.TOMATO_ADVISORY, label: 'Tomatoes', icon: 'cherry', color: 'text-red-600', bg: 'bg-red-50' },
        { id: AppView.NUTRIENT_PLANNER, label: 'Nutrients', icon: 'flask-conical', color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: AppView.IPM_SCHEDULER, label: 'IPM', icon: 'shield-check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: AppView.IRRIGATION, label: 'Water', icon: 'droplet', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: AppView.CROP_SCANNER, label: 'Scanner', icon: 'scan-line', color: 'text-slate-600', bg: 'bg-slate-50' },
      ]
    },
    {
      section: 'Market & Finance', items: [
        { id: AppView.PRICE_ANALYTICS, label: 'Trends', icon: 'line-chart', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: AppView.PRICE_HISTORY, label: 'Price History', icon: 'history', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: AppView.PRICE_FORECAST, label: 'Forecast', icon: 'trending-up', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: AppView.HARVEST_OPTIMIZER, label: 'Harvest', icon: 'scissors', color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: AppView.GOVT_SCHEMES, label: 'Schemes', icon: 'scroll', color: 'text-yellow-600', bg: 'bg-yellow-50' },
      ]
    },
    {
      section: 'Planning & Weather', items: [
        { id: AppView.CROP_CALENDAR, label: 'Calendar', icon: 'calendar', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: AppView.ENHANCED_WEATHER, label: 'Weather', icon: 'cloud', color: 'text-blue-600', bg: 'bg-blue-50' },
      ]
    },
    {
      section: 'Knowledge & Community', items: [
        { id: AppView.EXPERT_HUB, label: 'Specialist', icon: 'graduation-cap', color: 'text-blue-800', bg: 'bg-blue-100' },
        { id: AppView.COMMUNITY, label: 'Commons', icon: 'users', color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: AppView.SUCCESS_STORIES, label: 'Stories', icon: 'book-open', color: 'text-green-600', bg: 'bg-green-50' },
        { id: AppView.CLIMATE_INSIGHTS, label: 'Resilience', icon: 'sun', color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: AppView.IMPACT, label: 'Impact', icon: 'activity', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: AppView.PROFILE, label: 'Profile', icon: 'user', color: 'text-slate-600', bg: 'bg-slate-100' },
      ]
    }
  ];

  const handleNavClick = (view: AppView) => {
    setView(view);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden pb-safe-area">
        <div className="flex justify-around items-end pb-2 pt-2">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center space-y-1 w-16 transition-all ${currentView === item.id ? 'text-emerald-600' : 'text-slate-400'
                }`}
            >
              {item.isSpecial ? (
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-slate-50 relative z-10">
                  <i data-lucide={item.icon} className="w-6 h-6 text-white stroke-[2.5px]"></i>
                </div>
              ) : (
                <div className={`p-1 rounded-xl ${currentView === item.id ? 'bg-emerald-50' : ''}`}>
                  <i data-lucide={item.icon} className={`w-6 h-6 ${currentView === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`}></i>
                </div>
              )}
              <span className={`text-[10px] font-bold ${item.isSpecial ? 'mt-1' : ''}`}>{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center space-y-1 w-16 transition-all ${showMoreMenu ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-xl ${showMoreMenu ? 'bg-emerald-50' : ''}`}>
              <i data-lucide={showMoreMenu ? 'x' : 'grid'} className="w-6 h-6 stroke-2"></i>
            </div>
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* Grid Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 bg-slate-50/95 backdrop-blur-sm animate-fade-in flex flex-col pt-safe-area pb-24 overflow-y-auto md:hidden">
          <div className="p-6">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">All Apps</h2>

            <div className="space-y-8">
              {moreNavItems.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">{section.section}</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className="flex flex-col items-center space-y-2 group"
                      >
                        <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-[18px] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
                          <i data-lucide={item.icon} className="w-7 h-7 stroke-[1.5px]"></i>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 text-center leading-tight max-w-[60px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation (Sidebar-style fallback if needed, but App has Sidebar) */}
      {/* Since Sidebar takes care of desktop, we might hide this whole component on MD or keep it for small screens only.
          The original component hid itself on MD via css but Sidebar.tsx handles desktop nav.
          The user explicitly mentioned "bottom of the page" which implies mobile context.
          We will keep this strictly as the mobile bottom nav mechanism.
      */}

      <style>{`
        .pb-safe-area { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe-area { padding-top: env(safe-area-inset-top); }
        .animate-fade-in { animation: fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default Navigation;