import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { NotificationApi } from '../client_api/notifications/service';
import { NotificationAnalytics } from '../types';

const NotificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, stats]);

  const loadStats = async () => {
    setLoading(true);
    const res = await NotificationApi.getAnalytics();
    if (res.success) setStats(res.data || null);
    setLoading(false);
  };

  const pieData = stats ? [
    { name: 'Opened', value: stats.opened, color: '#10b981' },
    { name: 'Ignored', value: stats.delivered - stats.opened, color: '#94a3b8' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' }
  ] : [];

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Auditing Delivery Nodes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Delivery Console</h1>
        <p className="text-slate-500 font-medium">Real-time notification metrics & pipeline status</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Sent', val: stats.sent, icon: 'send', color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Delivered', val: stats.delivered, icon: 'check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Open Rate', val: `${Math.round((stats.opened / stats.delivered) * 100)}%`, icon: 'eye', color: 'text-purple-600', bg: 'bg-purple-50' },
           { label: 'Failures', val: stats.failed, icon: 'alert-octagon', color: 'text-rose-600', bg: 'bg-rose-50' }
         ].map((m, i) => (
           <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group">
              <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-6`}>
                 <i data-lucide={m.icon} className="w-6 h-6"></i>
              </div>
              <div className="text-3xl font-black text-slate-900 leading-none">{m.val}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{m.label}</div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pipeline Conversion</h3>
            <div className="h-80 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-4xl font-black text-slate-900">{Math.round((stats.opened/stats.delivered)*100)}%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">CTR Avg</div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {pieData.map((p, i) => (
                 <div key={i} className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                       <span className="text-[10px] font-black uppercase text-slate-400">{p.name}</span>
                    </div>
                    <div className="text-lg font-black text-slate-800">{p.value}</div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black tracking-tight">Channel Efficiency</h3>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">Real-time</div>
               </div>
               
               <div className="space-y-8">
                  {[
                    { label: 'Push Notifications (FCM)', rate: 94, success: 98 },
                    { label: 'SMS Gateway (Twilio)', rate: 82, success: 99 },
                    { label: 'Voice Alert (Automated)', rate: 76, success: 95 }
                  ].map((chan, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-slate-400">{chan.label}</span>
                          <span className="text-emerald-400">{chan.rate}% Engagement</span>
                       </div>
                       <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${chan.rate}%` }}></div>
                       </div>
                       <div className="flex justify-between text-[9px] font-bold opacity-40 uppercase">
                          <span>Throughput Healthy</span>
                          <span>{chan.success}% Success Rate</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-8 border-t border-white/10 flex gap-4">
                  <button className="flex-1 py-4 bg-white text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all">
                     View Delivery Logs
                  </button>
                  <button className="px-8 py-4 bg-white/10 border border-white/10 rounded-[32px] hover:bg-white/20 transition-all">
                     <i data-lucide="download" className="w-5 h-5"></i>
                  </button>
               </div>
            </div>
         </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default NotificationDashboard;