import React, { createContext, useContext, useState } from 'react';
import { Notification, AlertSeverity } from '../types';

interface Toast {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
}

interface NotificationContextType {
  toasts: Toast[];
  addToast: (title: string, message: string, severity: AlertSeverity) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, severity: AlertSeverity) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, severity }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 z-[100] space-y-4">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`p-5 rounded-[24px] shadow-2xl border-2 flex items-start space-x-4 animate-slide-up-fade bg-white ${
              toast.severity === 'critical' ? 'border-red-500' : 
              toast.severity === 'warning' ? 'border-amber-500' : 'border-emerald-500'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.severity === 'critical' ? 'bg-red-50 text-red-600' : 
              toast.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <i data-lucide={toast.severity === 'critical' ? 'zap' : toast.severity === 'warning' ? 'alert-triangle' : 'info'} className="w-5 h-5"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-300 hover:text-slate-500">
              <i data-lucide="x" className="w-4 h-4"></i>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up-fade { animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
