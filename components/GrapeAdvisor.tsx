
import React, { useState, useEffect } from 'react';
import { GrapeApi } from '../client_api/grapes/service';
import { CropsApi } from '../client_api/crops/service';
import { WeatherApi } from '../client_api/weather/service';
import { MarketApi } from '../client_api/market/service';
import { GrapeAdvisory, Crop, WeatherData, MarketPrice } from '../types';

const GrapeAdvisor: React.FC = () => {
  const [advisory, setAdvisory] = useState<GrapeAdvisory | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      refreshAdvisory();
    }
  }, [selectedCrop]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, advisory, selectedCrop, crops]);

  const loadInitialData = async () => {
    setLoading(true);
    const userId = 'u123';
    const cropsRes = await CropsApi.getByUser(userId);
    if (cropsRes.success && cropsRes.data) {
      const grapeCrops = cropsRes.data.filter(c => c.cropType === 'Grape');
      setCrops(grapeCrops);
      if (grapeCrops.length > 0) setSelectedCrop(grapeCrops[0]);
    }
    setLoading(false);
  };

  const refreshAdvisory = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    const [weatherRes, marketRes] = await Promise.all([
      WeatherApi.getForLocation('Nashik'),
      MarketApi.getLatestPrices()
    ]);

    if (weatherRes.success && marketRes.success) {
      const res = await GrapeApi.getAdvisory(selectedCrop, weatherRes.data!, marketRes.data!);
      if (res.success) setAdvisory(res.data || null);
    }
    setLoading(false);
  };

  if (loading && !advisory) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Analyzing vineyard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grape Specialist Advisor</h1>
          <p className="text-slate-500 font-medium">Nashik Vineyard Management System</p>
        </div>
        <div className="flex space-x-2">
           {crops.map(c => (
             <button 
               key={c.cropId}
               onClick={() => setSelectedCrop(c)}
               className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCrop?.cropId === c.cropId ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'}`}
             >
               {c.variety}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stage & Market */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Current Lifecycle</h3>
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                    <i data-lucide="grape" className="w-8 h-8"></i>
                 </div>
                 <div>
                    <div className="text-3xl font-black">{advisory?.currentStage}</div>
                    <div className="text-xs font-bold text-slate-400">Target Brix: 18-20°</div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">Harvest Readiness</span>
                    <span className="text-xs font-black text-emerald-400">65%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <i data-lucide="trending-up" className="w-5 h-5"></i>
                 </div>
                 <h3 className="font-black text-slate-800 tracking-tight">Market Optimization</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {advisory?.marketRecommendation}
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase text-slate-400">Optimal Window</span>
                 <span className="text-xs font-bold text-slate-900">May 15 - May 22</span>
              </div>
           </div>

           <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100">
              <div className="flex items-center space-x-3 text-emerald-800 mb-4">
                 <i data-lucide="sun" className="w-5 h-5"></i>
                 <h4 className="font-black text-sm uppercase tracking-widest">Next Spray window</h4>
              </div>
              <div className="text-2xl font-black text-emerald-900 mb-1">{advisory?.nextSprayingWindow.split(' (')[0]}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{advisory?.nextSprayingWindow.split(' (')[1].replace(')', '')}</div>
           </div>
        </div>

        {/* Center Column: Weekly Tasks */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Weekly Task List</h2>
              <span className="text-[10px] font-bold text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Week 22</span>
           </div>
           <div className="space-y-4">
              {advisory?.weeklyTasks.map(task => (
                <div key={task.id} className={`bg-white p-6 rounded-3xl border transition-all ${task.isCompleted ? 'opacity-50 grayscale border-slate-100' : 'border-slate-200 hover:border-emerald-300 shadow-sm'}`}>
                   <div className="flex items-start space-x-4">
                      <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-emerald-500'}`}>
                         <i data-lucide="check" className="w-4 h-4"></i>
                      </button>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{task.title}</h4>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>{task.priority}</span>
                         </div>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">{task.description}</p>
                         <div className="mt-3 inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-widest">
                            <i data-lucide="tag" className="w-2 h-2 mr-1"></i>
                            {task.category}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Column: Disease Warnings */}
        <div className="space-y-6">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Pathogen Early Warning</h2>
           <div className="space-y-6">
              {advisory?.risks.map((risk, i) => (
                <div key={i} className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                   <div className={`p-6 border-b flex justify-between items-center ${risk.riskLevel === 'High' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div>
                         <h4 className="font-black text-slate-900 tracking-tight">{risk.name}</h4>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${risk.riskLevel === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>{risk.riskLevel} Risk</span>
                      </div>
                      <div className="text-right">
                         <div className={`text-2xl font-black ${risk.riskLevel === 'High' ? 'text-red-600' : 'text-slate-400'}`}>{risk.score}%</div>
                      </div>
                   </div>
                   <div className="p-6 space-y-6">
                      <section>
                         <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Early Symptoms</h5>
                         <ul className="space-y-2">
                            {risk.symptoms.map((s, j) => (
                              <li key={j} className="flex items-center text-[11px] text-slate-600 font-medium">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-3"></div>
                                 {s}
                              </li>
                            ))}
                         </ul>
                      </section>
                      <div className="pt-4 border-t border-slate-50 grid grid-cols-1 gap-3">
                         <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Organic Control</div>
                            <div className="text-[11px] text-emerald-900 font-bold">{risk.organicTreatment}</div>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chemical Control</div>
                            <div className="text-[11px] text-slate-900 font-bold">{risk.chemicalTreatment}</div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
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

export default GrapeAdvisor;
