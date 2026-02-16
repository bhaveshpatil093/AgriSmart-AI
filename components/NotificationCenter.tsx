import React, { useEffect, useState } from 'react';
import { NotificationApi } from '../client_api/notifications/service';
import { Notification } from '../types';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [notifications, loading]);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await NotificationApi.getHistory(userId);
    if (res.success) setNotifications(res.data || []);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await NotificationApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await NotificationApi.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (!isOpen) return null;

  const severityStyles = {
    critical: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    advisory: 'bg-emerald-50 border-emerald-200 text-emerald-900'
  };

  const severityIcons = {
    critical: 'zap',
    warning: 'alert-triangle',
    advisory: 'info'
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <header className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Updates & Farm Alerts</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-[15px] transition-colors"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <i data-lucide="x" className="w-6 h-6"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Syncing farm alerts...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`relative p-4 rounded-[15px] border transition-all cursor-pointer group ${severityStyles[n.severity]} ${!n.isRead ? 'shadow-sm ring-1 ring-emerald-500/10' : 'opacity-70 grayscale-[0.5]'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 p-2 rounded-[15px] bg-white shadow-sm flex items-center justify-center shrink-0`}>
                    <i data-lucide={severityIcons[n.severity]} className="w-5 h-5"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black tracking-tight truncate pr-4">{n.title}</h4>
                      <span className="text-[10px] font-bold opacity-40 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80 mb-2">{n.message}</p>
                    <div className="flex items-center space-x-3">
                       <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[15px] bg-white/50 border border-white/50">{n.channel}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[15px] bg-white/50 border border-white/50">{n.type}</span>
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 px-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <i data-lucide="bell-off" className="w-8 h-8"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Clear Skies</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">No new alerts or advisories for your farm currently.</p>
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-50 bg-slate-50/30">
          <button 
            className="w-full py-4 bg-emerald-600 text-white rounded-[15px] font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            Manage Preferences
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;