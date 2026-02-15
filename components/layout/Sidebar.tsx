import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';
import { i18n, Language } from '../../utils/i18n';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isCollapsed, toggleCollapsed }) => {
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLang(e.detail);
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [currentLang]);

  const navigation = [
    {
      section: 'Overview', items: [
        { id: AppView.DASHBOARD, label: i18n.translate('nav.dashboard'), icon: 'layout-dashboard' },
      ]
    },
    {
      section: 'Communication', items: [
        { id: AppView.VOICE_ADVISOR, label: i18n.translate('nav.voice'), icon: 'mic-2' },
        { id: AppView.COMMUNITY, label: 'Commons', icon: 'users' },
        { id: AppView.EXPERT_HUB, label: 'Specialist', icon: 'graduation-cap' },
      ]
    },
    {
      section: 'Intelligence', items: [
        { id: AppView.MARKET_INTELLIGENCE, label: i18n.translate('nav.markets'), icon: 'bar-chart-3' },
        { id: AppView.PRICE_ANALYTICS, label: 'Trends', icon: 'line-chart' },
        { id: AppView.PRICE_HISTORY, label: 'Price History', icon: 'history' },
        { id: AppView.SUCCESS_STORIES, label: 'Stories', icon: 'award' },
        { id: AppView.GOVT_SCHEMES, label: 'Schemes', icon: 'scroll' },
      ]
    },
    {
      section: 'Farm Management', items: [
        { id: AppView.CROP_MANAGEMENT, label: i18n.translate('nav.myCrops'), icon: 'leaf' },
        { id: AppView.IPM_SCHEDULER, label: 'IPM', icon: 'shield-check' },
        { id: AppView.IRRIGATION, label: 'Water', icon: 'droplet' },
        { id: AppView.NUTRIENT_PLANNER, label: 'Nutrients', icon: 'flask-conical' },
      ]
    },
    {
      section: 'Analysis Tools', items: [
        { id: AppView.CROP_SCANNER, label: 'Scanner', icon: 'camera' },
        { id: AppView.CLIMATE_INSIGHTS, label: 'Resilience', icon: 'trending-up' },
        { id: AppView.ENHANCED_WEATHER, label: 'Weather', icon: 'cloud' },
        { id: AppView.IMPACT, label: i18n.translate('nav.impact'), icon: 'alert-octagon' },
      ]
    },
    {
      section: 'Planning', items: [
        { id: AppView.CROP_CALENDAR, label: 'Crop Calendar', icon: 'calendar' },
      ]
    },
    {
      section: 'Technical Control', items: [
        { id: AppView.NOTIFICATION_SETTINGS, label: 'Alert Profile', icon: 'bell' },
        { id: AppView.NOTIFICATION_DASHBOARD, label: 'Delivery Node', icon: 'activity' },
        { id: AppView.SYSTEM_JOBS, label: 'Cloud Console', icon: 'terminal' },
        { id: AppView.ADMIN_ANALYTICS, label: 'Business Intelligence', icon: 'pie-chart' },
        { id: AppView.QA_DASHBOARD, label: 'QA & Testing', icon: 'clipboard-check' },
      ]
    }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out sticky top-[61px] h-[calc(100vh-61px)] ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex-1 overflow-y-auto no-scrollbar py-8 px-4 space-y-8">
        {navigation.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {group.section}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center rounded-lg transition-all group ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2 space-x-3'
                    } ${currentView === item.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  <i
                    data-lucide={item.icon}
                    className={`w-5 h-5 shrink-0 transition-transform ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}
                  ></i>
                  {!isCollapsed && (
                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
                  )}
                  {currentView === item.id && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            {idx < navigation.length - 1 && !isCollapsed && <div className="mx-3 pt-2 border-b border-slate-100"></div>}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center p-2 bg-slate-50 text-slate-500 hover:text-emerald-600 rounded-lg transition-all group"
        >
          <i data-lucide={isCollapsed ? "chevron-right" : "chevron-left"} className="w-5 h-5 group-hover:scale-110 transition-transform"></i>
          {!isCollapsed && <span className="ml-2 text-xs font-bold uppercase tracking-wider">Minimize</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;