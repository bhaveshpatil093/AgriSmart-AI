import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { AnalyticsApi } from '../client_api/analytics/service';
import { BusinessMetrics, FeatureUsage, ImpactMetrics, PerformanceStats } from '../types';

const AdminAnalyticsPortal: React.FC = () => {
  const [business, setBusiness] = useState<BusinessMetrics | null>(null);
  const [features, setFeatures] = useState<FeatureUsage[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, business, features, impact, performance]);

  const loadData = async () => {
    setLoading(true);
    const [bizRes, featRes, impRes, perfRes] = await Promise.all([
      AnalyticsApi.getBusinessMetrics(),
      AnalyticsApi.getFeatureUsage(),
      AnalyticsApi.getImpactMetrics(),
      AnalyticsApi.getPerformanceStats()
    ]);

    if (bizRes.success) setBusiness(bizRes.data || null);
    if (featRes.success) setFeatures(featRes.data || []);
    if (impRes.success) setImpact(impRes.data || null);
    if (perfRes.success) setPerformance(perfRes.data || null);
    setLoading(false);
  };

  const GROWTH_DATA = [
    { name: 'Mon', active: 1100 }, { name: 'Tue', active: 1250 }, { name: 'Wed', active: 1150 },
    { name: 'Thu', active: 1300 }, { name: 'Fri', active: 1420 }, { name: 'Sat', active: 1100 }, { name: 'Sun', active: 1050 }
  ];

  const IMPACT_PIE = impact ? [
    { name: 'Yield Gain', value: impact.yieldIncreasePercent, color: '#10b981' },
    { name: 'Income Growth', value: impact.incomeGrowthPercent, color: '#3b82f6' },
    { name: 'Efficiency', value: impact.advisoryCompliance, color: '#f59e0b' }
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Querying Data Warehouse...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
             <i data-lucide="database" className="w-3 h-3 mr-2"></i>
             BigQuery Data Warehouse: Connected
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Business Intelligence</h1>
          <p className="text-slate-500 font-medium">Global activity tracking and ecosystem impact monitoring</p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-white border border-slate-200 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
              <i data-lucide="download" className="w-4 h-4"></i>
              Generate Report
           </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Userbase', val: business?.totalUsers.toLocaleString(), icon: 'users', color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
           { label: 'DAU / MAU', val: `${Math.round((business!.dau / business!.mau) * 100)}%`, icon: 'activity', color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+5.4%' },
           { label: 'Avg Session', val: `${business?.avgSessionMinutes}m`, icon: 'clock', color: 'text-purple-600', bg: 'bg-purple-50', change: '+2m' },
           { label: 'System Error', val: `${performance?.errorRate}%`, icon: 'alert-octagon', color: 'text-rose-600', bg: 'bg-rose-50', change: '-1%' }
         ].map((kpi, i) => (
           <div key={i} className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-6`}>
                 <i data-lucide={kpi.icon} className="w-6 h-6"></i>
              </div>
              <div className="flex justify-between items-end">
                 <div>
                    <div className="text-3xl font-black text-slate-900 leading-none">{kpi.val}</div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{kpi.label}</div>
                 </div>
                 <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${kpi.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {kpi.change}
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* User Growth Chart */}
         <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-10">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Active User Trajectory</h3>
               <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
               </select>
            </div>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GROWTH_DATA}>
                     <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                     <Area type="monotone" name="Daily Actives" dataKey="active" stroke="#10b981" strokeWidth={4} fill="url(#growthGrad)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Feature Adoption */}
         <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>
            <h3 className="text-xl font-black tracking-tight mb-10">Feature Adoption</h3>
            <div className="space-y-8">
               {features.map((f, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                       <span className="text-slate-400">{f.feature}</span>
                       <span className="text-emerald-400">+{f.growth}% Growth</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400" style={{ width: `${(f.count / 5000) * 100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl">
               <div className="text-[10px] font-black uppercase opacity-40 mb-2">Power Users</div>
               <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(p => (
                    <div key={p} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center font-black text-[10px]">U{p}</div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Agricultural Impact */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-12">Aggregate Agri-Impact</h3>
            <div className="grid grid-cols-2 gap-12">
               <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={IMPACT_PIE}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={100}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {IMPACT_PIE.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <div className="text-3xl font-black text-slate-900">{impact?.advisoryCompliance}%</div>
                     <div className="text-[8px] font-black text-slate-400 uppercase">Compliance</div>
                  </div>
               </div>
               <div className="space-y-6 flex flex-col justify-center">
                  {[
                    { label: 'Est. Yield Delta', val: `+${impact?.yieldIncreasePercent}%`, icon: 'trending-up', color: 'text-emerald-600' },
                    { label: 'Water Conserved', val: `${(impact!.waterSavedLiters / 1000000).toFixed(1)}ML`, icon: 'droplet', color: 'text-blue-600' },
                    { label: 'Avg Income Delta', val: `+${impact?.incomeGrowthPercent}%`, icon: 'indian-rupee', color: 'text-amber-600' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center space-x-4">
                       <div className={`w-10 h-10 rounded-xl bg-slate-50 ${m.color} flex items-center justify-center`}>
                          <i data-lucide={m.icon} className="w-5 h-5"></i>
                       </div>
                       <div>
                          <div className="text-lg font-black text-slate-900">{m.val}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* API Latency Stack */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-10">
            <div className="flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">API Latency Percentiles</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Response Performance</p>
               </div>
               <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-black uppercase text-emerald-600">SLA: Target Met</span>
               </div>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'p50', val: performance?.p50, color: '#10b981' },
                    { name: 'p95', val: performance?.p95, color: '#3b82f6' },
                    { name: 'p99', val: performance?.p99, color: '#f59e0b' }
                  ]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="ms" />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                     <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={60}>
                        { [1,2,3].map((entry, index) => (
                           <Cell key={index} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic text-center">Inference overhead primarily driven by Gemini 1.5 multi-modal token processing.</p>
         </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AdminAnalyticsPortal;