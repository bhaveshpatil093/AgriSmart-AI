import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { UserApi } from '../api/user/service';

const NotificationPreferences: React.FC = () => {
  const { user, setUser } = useAuth();
  const [localPrefs, setLocalPrefs] = useState<User['preferences'] | null>(user?.preferences || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [localPrefs, saving]);

  if (!localPrefs) return null;

  const handleUpdate = async (updated: Partial<User['preferences']>) => {
    const newPrefs = { ...localPrefs, ...updated };
    setLocalPrefs(newPrefs);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const updatedUser = { ...user, preferences: localPrefs! };
    const res = await UserApi.updateProfile(updatedUser);
    if (res.success) {
      setUser(updatedUser);
      alert("Notification profile updated successfully.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Alert Profile</h1>
          <p className="text-slate-500 font-medium">Customize how and when AgriSmart reaches you</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center space-x-3 disabled:bg-slate-200"
        >
          {saving ? <i data-lucide="refresh-cw" className="w-4 h-4 animate-spin"></i> : <i data-lucide="save" className="w-4 h-4"></i>}
          <span>Apply Changes</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Settings */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Master Toggle */}
           <div className={`p-8 rounded-[40px] border-2 transition-all flex items-center justify-between ${localPrefs.notifications ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-50' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex items-center space-x-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${localPrefs.notifications ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <i data-lucide="bell" className="w-8 h-8"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Surveillance</h3>
                    <p className="text-xs text-slate-500 font-medium">Enable AI-driven farm alerts and market updates</p>
                 </div>
              </div>
              <button 
                onClick={() => handleUpdate({ notifications: !localPrefs.notifications })}
                className={`w-14 h-7 rounded-full transition-all relative ${localPrefs.notifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localPrefs.notifications ? 'left-8' : 'left-1'}`}></div>
              </button>
           </div>

           {localPrefs.notifications && (
             <div className="space-y-8 animate-slide-up">
                
                {/* Channel Routing */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Delivery Channels</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'push', label: 'Push', icon: 'smartphone', desc: 'App Banner' },
                        { id: 'sms', label: 'SMS', icon: 'message-square', desc: 'Carrier SMS' },
                        { id: 'voice', label: 'Voice', icon: 'phone', desc: 'Call Fallback' }
                      ].map(chan => (
                        <button
                          key={chan.id}
                          onClick={() => {
                            const channels = { ...localPrefs.notificationChannels, [chan.id]: !(localPrefs.notificationChannels as any)[chan.id] };
                            handleUpdate({ notificationChannels: channels as any });
                          }}
                          className={`p-6 rounded-[32px] border-2 text-left transition-all ${ (localPrefs.notificationChannels as any)[chan.id] ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100 opacity-60' }`}
                        >
                           <i data-lucide={chan.icon} className={`w-6 h-6 mb-4 ${ (localPrefs.notificationChannels as any)[chan.id] ? 'text-emerald-600' : 'text-slate-400' }`}></i>
                           <div className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{chan.label}</div>
                           <div className="text-[10px] text-slate-400 font-bold mt-1">{chan.desc}</div>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Quiet Hours */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Smart Timing (Quiet Hours)</h3>
                      <button 
                        onClick={() => handleUpdate({ quietHours: { ...localPrefs.quietHours, enabled: !localPrefs.quietHours.enabled } })}
                        className={`w-10 h-5 rounded-full relative transition-all ${localPrefs.quietHours.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                         <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${localPrefs.quietHours.enabled ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                   </div>
                   
                   {localPrefs.quietHours.enabled && (
                     <div className="flex items-center space-x-12 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="space-y-2 flex-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Start Time (DND)</label>
                           <input 
                             type="time" 
                             value={localPrefs.quietHours.start}
                             onChange={(e) => handleUpdate({ quietHours: { ...localPrefs.quietHours, start: e.target.value } })}
                             className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                           />
                        </div>
                        <div className="w-10 h-px bg-slate-200 shrink-0"></div>
                        <div className="space-y-2 flex-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Wake Up (End)</label>
                           <input 
                             type="time" 
                             value={localPrefs.quietHours.end}
                             onChange={(e) => handleUpdate({ quietHours: { ...localPrefs.quietHours, end: e.target.value } })}
                             className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                           />
                        </div>
                     </div>
                   )}
                   <p className="text-[10px] text-slate-400 font-bold italic text-center">Note: Critical weather warnings (Hail/Frost) will always bypass quiet hours.</p>
                </div>

                {/* Category Toggles */}
                <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Surveillance Categories</h3>
                   <div className="space-y-4">
                      {[
                        { id: 'weather', label: 'Climate & Hazards', desc: 'Hail, Frost, Rain projections', icon: 'cloud-lightning' },
                        { id: 'market', label: 'Market Fluctuations', desc: 'Price peaks, Mandi arrivals', icon: 'trending-up' },
                        { id: 'community', label: 'Commons Discussions', desc: 'New replies to your posts', icon: 'users' },
                        { id: 'advisory', label: 'AI Daily Plan', desc: 'Your personalized task list', icon: 'sparkles' }
                      ].map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] group hover:bg-white border border-transparent hover:border-emerald-200 transition-all">
                           <div className="flex items-center space-x-6">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                                 <i data-lucide={cat.icon} className="w-5 h-5"></i>
                              </div>
                              <div>
                                 <div className="text-sm font-black text-slate-900">{cat.label}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">{cat.desc}</div>
                              </div>
                           </div>
                           <button 
                             onClick={() => {
                               const cats = { ...localPrefs.categorySettings, [cat.id]: !(localPrefs.categorySettings as any)[cat.id] };
                               handleUpdate({ categorySettings: cats as any });
                             }}
                             className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${ (localPrefs.categorySettings as any)[cat.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent' }`}
                           >
                              <i data-lucide="check" className="w-5 h-5"></i>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-950 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8">System Health</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase text-slate-500">Push Status</span>
                       <span className="text-sm font-bold text-emerald-400">Connected</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400" style={{ width: '100%' }}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase text-slate-500">Carrier Fallback (SMS)</span>
                       <span className="text-sm font-bold text-emerald-400">98% Ready</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400" style={{ width: '98%' }}></div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">"AgriSmart uses a multi-layered delivery approach. If data is unavailable, we fallback to SMS for critical alerts."</p>
              </div>
           </div>

           <div className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                 <i data-lucide="shield-check" className="w-6 h-6"></i>
              </div>
              <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Data Policy</h4>
              <p className="text-xs text-blue-800/70 leading-relaxed font-medium">AgriSmart never shares your phone number with 3rd party marketers. All SMS and Voice alerts are strictly agricultural.</p>
           </div>
        </div>
      </div>
      
      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default NotificationPreferences;