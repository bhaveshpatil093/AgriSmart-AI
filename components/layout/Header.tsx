import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AppView } from '../../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  unreadCount: number;
  setView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenNotifications, unreadCount, setView }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-200 px-6 py-3">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div onClick={() => setView(AppView.DASHBOARD)} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <i data-lucide="sprout" className="w-6 h-6"></i>
            </div>
            <div className="hidden lg:block leading-none">
              <span className="text-lg font-bold text-slate-800 tracking-tight block">AgriSmart <span className="text-emerald-600">Nashik</span></span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">District Precision Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm"
            >
              <i data-lucide="download" className="w-3 h-3"></i>
              <span>Install App</span>
            </button>
          )}

          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group cursor-pointer hover:bg-white transition-all" onClick={() => setView(AppView.OFFLINE_SETTINGS)}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
            <i data-lucide="settings-2" className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 border-l border-slate-100 pl-4 md:pl-6">
            <button
              onClick={onOpenNotifications}
              className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-all relative group"
            >
              <i data-lucide="bell" className="w-5 h-5 group-hover:rotate-12 transition-transform"></i>
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setView(AppView.PROFILE)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200 group"
            >
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">{user?.name}</div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Pro Farmer</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;