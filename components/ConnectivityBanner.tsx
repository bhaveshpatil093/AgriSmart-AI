import React, { useState, useEffect } from 'react';

const ConnectivityBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => setShow(false), 3000); // Hide after 3s if restored
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) setShow(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-[28px] border shadow-2xl flex items-center space-x-4 transition-all duration-500 animate-slide-up ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-950 border-amber-800 text-amber-50'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isOnline ? 'bg-emerald-200' : 'bg-amber-900/50'}`}>
        <i data-lucide={isOnline ? "wifi" : "wifi-off"} className="w-5 h-5"></i>
      </div>
      <div>
        <div className="text-sm font-black uppercase tracking-widest">{isOnline ? 'Back Online' : 'You are Offline'}</div>
        <p className="text-[10px] font-bold opacity-70 leading-tight">
          {isOnline ? 'Synchronizing farm data...' : 'Working in Lite Mode. Some AI features disabled.'}
        </p>
      </div>
      {isOnline ? (
         <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse ml-2"></div>
      ) : (
         <button onClick={() => setShow(false)} className="p-2 hover:bg-white/10 rounded-lg">
           <i data-lucide="x" className="w-4 h-4"></i>
         </button>
      )}
      <style>{`
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slide-up { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConnectivityBanner;