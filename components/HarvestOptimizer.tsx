import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { HarvestApi } from '../client_api/harvest/service';
import { CropsApi } from '../client_api/crops/service';
import { WeatherApi } from '../client_api/weather/service';
import { HarvestAdvisory, Crop, HarvestScenario } from '../types';

const HarvestOptimizer: React.FC = () => {
  const [advisory, setAdvisory] = useState<HarvestAdvisory | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedCrop) loadAdvisory();
  }, [selectedCrop]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, advisory, selectedCrop]);

  const loadInitial = async () => {
    setLoading(true);
    const res = await CropsApi.getByUser('u123');
    if (res.success && res.data && res.data.length > 0) {
      setCrops(res.data);
      setSelectedCrop(res.data[0]);
    }
    setLoading(false);
  };

  const loadAdvisory = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    const weather = await WeatherApi.getForLocation('Nashik');
    if (weather.success) {
      const res = await HarvestApi.getAdvisory(selectedCrop, weather.data!);
      if (res.success) setAdvisory(res.data || null);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-500 text-white';
      case 'pending': return 'bg-amber-500 text-white';
      case 'warning': return 'bg-rose-500 text-white';
      default: return 'bg-slate-200';
    }
  };

  if (loading && !advisory) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Running Harvest Yield Simulations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest mb-4">
             <i data-lucide="clock" className="w-3 h-3 mr-2"></i>
             Market-Aware Timing Engine
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Harvest Timing Optimizer</h1>
          <p className="text-slate-500 font-medium">Balancing biological maturity with market peak demand</p>
        </div>
        <div className="flex space-x-2">
           {crops.map(c => (
             <button 
               key={c.cropId}
               onClick={() => setSelectedCrop(c)}
               className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCrop?.cropId === c.cropId ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
               {c.variety}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Readiness Index */}
        <div className="bg-slate-950 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Readiness Score</h3>
                    <div className="text-6xl font-black mt-2 tracking-tighter">{advisory?.harvestIndex}%</div>
                 </div>
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <i data-lucide="gauge" className="w-8 h-8 text-emerald-400"></i>
                 </div>
              </div>

              <div className="space-y-6">
                 {advisory?.maturityMetrics.map((m, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                         <span className="text-slate-400">{m.name}</span>
                         <span className={m.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}>
                            {m.value}{m.unit} / {m.target}{m.unit}
                         </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                         <div 
                           className={`h-full rounded-full ${m.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                           style={{ width: `${(parseFloat(m.value.toString()) / parseFloat(m.target.toString())) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-8 border-t border-white/5">
                 <div className="flex items-center space-x-3 text-emerald-400 mb-4">
                    <i data-lucide="info" className="w-4 h-4"></i>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Model Consensus</h4>
                 </div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium italic">"{advisory?.marketContext}"</p>
              </div>
           </div>
        </div>

        {/* Trade-off Scenarios */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Scenarios</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Projected Net Realization (After Losses & Storage)</p>
                 </div>
                 <div className="flex bg-slate-50 p-1 rounded-2xl">
                    {['Table', 'Chart'].map(v => (
                      <button key={v} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase ${v === 'Chart' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>{v}</button>
                    ))}
                 </div>
              </div>

              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={advisory?.scenarios}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                       <Bar name="Net Return" dataKey="netReturn" radius={[12, 12, 0, 0]} barSize={40}>
                          {advisory?.scenarios.map((entry, index) => (
                            <Cell key={index} fill={index === 1 ? '#10b981' : '#cbd5e1'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                 {advisory?.scenarios.map((s, i) => (
                   <div key={i} className={`p-6 rounded-[32px] border transition-all ${i === 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                      <div className={`text-xl font-black ${i === 1 ? 'text-emerald-700' : 'text-slate-900'}`}>₹{Math.round(s.netReturn).toLocaleString()}</div>
                      <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
                         <span>Price: ₹{s.estimatedPrice}</span>
                         <span>Loss: {s.shrinkageLoss}%</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Weather Suitability */}
         <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Weather Suitability</h3>
               <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${advisory?.weatherSuitability === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {advisory?.weatherSuitability} Window
               </div>
            </div>
            <div className="flex items-start space-x-6">
               <div className={`w-16 h-16 rounded-[32px] flex items-center justify-center shrink-0 ${advisory?.weatherSuitability === 'Excellent' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  <i data-lucide={advisory?.weatherSuitability === 'Excellent' ? 'sun' : 'cloud-rain'} className="w-8 h-8"></i>
               </div>
               <div>
                  <p className="text-lg font-medium text-slate-600 leading-relaxed italic">"{advisory?.weatherReason}"</p>
                  <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                     {[1,2,3,4,5].map(d => (
                        <div key={d} className="flex-col min-w-[70px] bg-slate-50 p-3 rounded-2xl text-center">
                           <div className="text-[9px] font-black text-slate-400 uppercase">May {14+d}</div>
                           <i data-lucide="sun" className="w-4 h-4 text-amber-400 mx-auto my-1"></i>
                           <div className="text-xs font-black text-slate-700">32°C</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Labor & Logistics Checklist */}
         <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Logistics Readiness</h3>
               <div className="text-xs font-bold text-slate-400">{advisory?.laborChecklist.filter(c => c.completed).length}/{advisory?.laborChecklist.length} Ready</div>
            </div>
            <div className="space-y-4">
               {advisory?.laborChecklist.map((item, i) => (
                 <div key={i} className="flex items-center space-x-4 group cursor-pointer">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent group-hover:border-emerald-300'}`}>
                       <i data-lucide="check" className="w-4 h-4"></i>
                    </div>
                    <span className={`text-sm font-bold transition-all ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-emerald-600'}`}>{item.item}</span>
                 </div>
               ))}
            </div>
            <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
               Notify Logistic Partners
            </button>
         </div>
      </div>

      <div className="bg-emerald-600 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h3 className="text-4xl font-black tracking-tighter leading-none">Execute Optimal <br /> Harvest Strategy</h3>
               <p className="text-emerald-100 text-lg leading-relaxed font-medium">Model suggests delay until May 18 for peak brix and a +15% price realization. Harvesting today may result in lower export quality grade.</p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-emerald-700 px-10 py-5 rounded-[32px] font-black text-lg hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                     Book Storage Space
                  </button>
                  <button className="bg-emerald-800 text-white border border-emerald-500/30 px-10 py-5 rounded-[32px] font-black text-lg hover:bg-emerald-900 transition-all shadow-xl active:scale-95">
                     Download Plan
                  </button>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <div className="text-[10px] font-black uppercase opacity-40 mb-2">ROI Boost</div>
                  <div className="text-4xl font-black text-emerald-400">+₹1.2L</div>
                  <div className="text-[9px] text-emerald-200 font-bold uppercase mt-2">Projected vs Now</div>
               </div>
               <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <div className="text-[10px] font-black uppercase opacity-40 mb-2">Shelf Life</div>
                  <div className="text-4xl font-black text-white">+3 Days</div>
                  <div className="text-[9px] text-emerald-200 font-bold uppercase mt-2">Extended Window</div>
               </div>
            </div>
         </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default HarvestOptimizer;