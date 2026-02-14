
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IrrigationApi } from '../api/irrigation/service';
import { CropsApi } from '../api/crops/service';
import { WeatherApi } from '../api/weather/service';
import { IrrigationRecommendation, WaterUsageRecord, Crop, WeatherData } from '../types';

const IrrigationManager: React.FC = () => {
  const [recommendations, setRecommendations] = useState<IrrigationRecommendation[]>([]);
  const [usageHistory, setUsageHistory] = useState<WaterUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [loading, recommendations, usageHistory]);

  const loadData = async () => {
    setLoading(true);
    const userId = 'demo-user-123';
    const [cropsRes, weatherRes, usageRes] = await Promise.all([
      CropsApi.getByUser(userId),
      WeatherApi.getForLocation('Nashik'),
      IrrigationApi.getUsageHistory(userId)
    ]);

    if (cropsRes.success && weatherRes.success) {
      const recs = await IrrigationApi.getRecommendations(cropsRes.data!, weatherRes.data!);
      setRecommendations(recs.data || []);
    }
    
    if (usageRes.success) setUsageHistory(usageRes.data || []);
    setLoading(false);
  };

  const handleApply = async (id: string) => {
    setApplyingId(id);
    const res = await IrrigationApi.applyIrrigation(id);
    if (res.success) {
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, isApplied: true } : r));
    }
    setApplyingId(null);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'IRRIGATE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'SKIP': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'DELAY': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const usageChartData = [...usageHistory].reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
    liters: Math.round(d.amountLiters)
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-medium">Calculating water requirements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Irrigation Intelligence</h1>
          <p className="text-slate-500 font-medium">Optimizing water usage with precision weather data</p>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-xs uppercase tracking-widest">
           <i data-lucide="droplet" className="w-4 h-4"></i>
           <span>Drip Network: Optimized</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Daily Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm group hover:border-blue-300 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-start space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${getActionColor(rec.action)}`}>
                       <i data-lucide={rec.action === 'IRRIGATE' ? 'play-circle' : rec.action === 'SKIP' ? 'slash' : 'clock'} className="w-7 h-7"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{rec.cropName}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getActionColor(rec.action)}`}>
                           {rec.action}
                         </span>
                         <span className="text-xs text-slate-400 font-bold flex items-center">
                           <i data-lucide="moisture" className="w-3 h-3 mr-1"></i> {rec.moistureLevel.toFixed(0)}% Moisture
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 w-full md:w-auto">
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-black text-slate-900">{rec.durationMinutes > 0 ? `${rec.durationMinutes} mins` : '--'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Run Time</div>
                    </div>
                    {rec.action === 'IRRIGATE' && !rec.isApplied ? (
                      <button 
                        onClick={() => handleApply(rec.id)}
                        disabled={applyingId === rec.id}
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                      >
                        {applyingId === rec.id ? <i data-lucide="refresh-cw" className="w-4 h-4 animate-spin"></i> : 'Apply Now'}
                      </button>
                    ) : rec.isApplied ? (
                      <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                        <i data-lucide="check-circle" className="w-5 h-5"></i>
                        <span>Applied</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium italic">Logic: Automatically Managed</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                   <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
                     <i data-lucide="info" className="w-4 h-4 inline mr-2 text-blue-500"></i>
                     {rec.reason}
                   </p>
                   <div className="flex space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-black text-slate-800">{rec.evapotranspiration}mm</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">ETc (Loss)</div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-blue-200">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex px-3 py-1 bg-white/20 text-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">Efficiency Insight</div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">Your Water Footprint <br /> has decreased by 18%</h3>
                  <p className="text-blue-100 leading-relaxed font-medium">By strictly following the AI-predicted rainfall delays, you saved approximately 12,400 liters of water this cycle.</p>
                  <button className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all">View Full Report</button>
                </div>
                <div className="bg-white/10 p-6 rounded-[32px] backdrop-blur-sm border border-white/20">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase">Sensor Mesh Status</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <div className="text-2xl font-black">12</div>
                        <div className="text-[9px] font-bold uppercase opacity-60">Active Nodes</div>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl">
                        <div className="text-2xl font-black">98%</div>
                        <div className="text-[9px] font-bold uppercase opacity-60">Connectivity</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Usage Tracking</h2>
          
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h3 className="text-lg font-black text-slate-900 mb-6">7-Day Water Consumption</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="L" />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="liters" radius={[6, 6, 0, 0]} barSize={24}>
                       {usageChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === usageChartData.length - 1 ? '#2563eb' : '#94a3b8'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-sm font-black text-slate-900">1,450 L</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Avg Daily</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-sm font-black text-blue-600">85%</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Target Met</div>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
             <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
             <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all group">
                   <div className="flex items-center space-x-3">
                      <i data-lucide="settings" className="w-5 h-5 text-slate-400 group-hover:text-blue-600"></i>
                      <span className="text-sm font-bold text-slate-700">Pump Calibration</span>
                   </div>
                   <i data-lucide="chevron-right" className="w-4 h-4 text-slate-300"></i>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all group">
                   <div className="flex items-center space-x-3">
                      <i data-lucide="plus-circle" className="w-5 h-5 text-slate-400 group-hover:text-blue-600"></i>
                      <span className="text-sm font-bold text-slate-700">Manual Log Entry</span>
                   </div>
                   <i data-lucide="chevron-right" className="w-4 h-4 text-slate-300"></i>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all group">
                   <div className="flex items-center space-x-3">
                      <i data-lucide="alert-octagon" className="w-5 h-5 text-red-400"></i>
                      <span className="text-sm font-bold text-slate-700">Emergency Shutoff</span>
                   </div>
                   <i data-lucide="chevron-right" className="w-4 h-4 text-slate-300"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default IrrigationManager;
