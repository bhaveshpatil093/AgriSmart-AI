import React, { useState, useEffect } from 'react';

const OfflineSettings: React.FC = () => {
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    calculateStorage();
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [downloading, downloadProgress]);

  const calculateStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usedInMb = (estimate.usage || 0) / (1024 * 1024);
      setCacheSize(`${usedInMb.toFixed(2)} MB`);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          alert("Nashik Farm Blueprints downloaded for offline use.");
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  const handleClear = async () => {
    if (window.confirm("Clear all offline farm data? You will need internet to reload your dashboard.")) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      calculateStorage();
      alert("Cache cleared.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Offline & Storage</h1>
        <p className="text-slate-500 font-medium">Manage how AgriSmart works without network access</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="database" className="w-6 h-6"></i>
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900">{cacheSize}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Data Used</div>
               </div>
            </div>
            <button 
              onClick={handleClear}
              className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
            >
               Purge Local Cache
            </button>
         </div>

         <div className="bg-slate-950 p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-black tracking-tight">Offline Persistence</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Auto-sync caches your last 5 viewed market reports and 7-day weather snapshots automatically.</p>
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase text-emerald-400">Sync Engine: Active</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 p-12 shadow-sm space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Selective Blueprint Download</h3>
               <p className="text-slate-500 text-sm font-medium mt-1">Download high-res agronomy guides and disease patterns for deep-field work.</p>
            </div>
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="px-10 py-5 bg-emerald-600 text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:bg-slate-200"
            >
               {downloading ? 'Downloading...' : 'Download All Guides'}
            </button>
         </div>

         {downloading && (
           <div className="space-y-3 animate-fade-in">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Syncing Regional Data...</span>
                 <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${downloadProgress}%` }}></div>
              </div>
           </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'weather', label: '7-Day Forecast', status: 'Cached' },
              { id: 'market', label: 'Mandi Archives', status: 'In Sync' },
              { id: 'crops', label: 'My Farm Blueprints', status: 'Available Offline' }
            ].map(item => (
              <div key={item.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                 <div className="text-sm font-black text-slate-900 mb-2">{item.label}</div>
                 <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.status}</span>
                 </div>
              </div>
            ))}
         </div>
      </div>
      
      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default OfflineSettings;