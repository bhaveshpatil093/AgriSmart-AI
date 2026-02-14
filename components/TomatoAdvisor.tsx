import React, { useState, useEffect } from 'react';
import { TomatoApi } from '../api/tomatoes/service';
import { CropsApi } from '../api/crops/service';
import { WeatherApi } from '../api/weather/service';
import { MarketApi } from '../api/market/service';
import { TomatoAdvisory, Crop, WeatherData, MarketPrice } from '../types';

const TomatoAdvisor: React.FC = () => {
  const [advisory, setAdvisory] = useState<TomatoAdvisory | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIPM, setShowIPM] = useState(false);

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
  }, [loading, advisory, selectedCrop, crops, showIPM]);

  const loadInitialData = async () => {
    setLoading(true);
    const userId = 'u123';
    const cropsRes = await CropsApi.getByUser(userId);
    if (cropsRes.success && cropsRes.data) {
      const tomatoCrops = cropsRes.data.filter(c => c.cropType === 'Tomato');
      setCrops(tomatoCrops);
      if (tomatoCrops.length > 0) {
        setSelectedCrop(tomatoCrops[0]);
      } else {
        // Fix: Added missing properties 'activities', 'costs', and 'targetYield' to satisfy Crop interface
        const demoTomato: Crop = {
          cropId: 'demo-t1',
          userId,
          cropType: 'Tomato',
          variety: 'Abhinav Hybrid',
          plantingDate: '2024-02-01',
          currentStage: 'Fruit Set',
          farmSize: 1.5,
          irrigationMethod: 'drip',
          healthScore: 85,
          milestones: [],
          soilData: { ph: 6.5 },
          activities: [],
          costs: [],
          targetYield: 25
        };
        setCrops([demoTomato]);
        setSelectedCrop(demoTomato);
      }
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
      const res = await TomatoApi.getAdvisory(selectedCrop, weatherRes.data!, marketRes.data!);
      if (res.success) setAdvisory(res.data || null);
    }
    setLoading(false);
  };

  // Yield estimation logic based on variety and health
  const estimateYield = () => {
    if (!selectedCrop) return { min: 0, max: 0 };
    const baseYieldPerAcre = selectedCrop.variety.includes('Hybrid') ? 25 : 15; // Tons per acre
    const healthFactor = selectedCrop.healthScore / 100;
    return {
      min: Math.round(baseYieldPerAcre * selectedCrop.farmSize * healthFactor * 0.9),
      max: Math.round(baseYieldPerAcre * selectedCrop.farmSize * healthFactor * 1.1)
    };
  };

  if (loading && !advisory) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Analyzing tomato fruit set metrics...</p>
      </div>
    );
  }

  const yieldEst = estimateYield();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tomato Specialist Advisor</h1>
          <p className="text-slate-500 font-medium">Hybrid and Local Cultivation Intelligence</p>
        </div>
        <div className="flex space-x-2">
           {crops.map(c => (
             <button 
               key={c.cropId}
               onClick={() => setSelectedCrop(c)}
               className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCrop?.cropId === c.cropId ? 'bg-rose-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'}`}
             >
               {c.variety}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stage & Yield */}
        <div className="space-y-6">
           <div className="bg-rose-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300/50 mb-6">Fruiting Status</h3>
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400">
                    <i data-lucide="cherry" className="w-8 h-8"></i>
                 </div>
                 <div>
                    <div className="text-3xl font-black">{advisory?.currentStage}</div>
                    <div className="text-xs font-bold text-rose-200/50">Optimum Temp: 18-30°C</div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-rose-200/40">Fruit Maturation</span>
                    <span className="text-xs font-black text-rose-400">58%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '58%' }}></div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <i data-lucide="calculator" className="w-5 h-5"></i>
                   </div>
                   <h3 className="font-black text-slate-800 tracking-tight">Yield Estimation</h3>
                </div>
                <i data-lucide="info" className="w-4 h-4 text-slate-300"></i>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="text-4xl font-black text-slate-900 tracking-tighter">{yieldEst.min} - {yieldEst.max}</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 text-center">Estimated Tons (Total)</div>
                 <p className="text-[10px] text-slate-500 italic mt-4 leading-relaxed">Based on current health score ({selectedCrop?.healthScore}%) and plot size.</p>
              </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <i data-lucide="layers" className="w-5 h-5"></i>
                 </div>
                 <h3 className="font-black text-slate-800 tracking-tight">Harvest Stages</h3>
              </div>
              <div className="space-y-4">
                 {advisory?.harvestStages.map((stage, i) => (
                   <div key={i} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${stage.color} shrink-0 shadow-sm`}></div>
                      <div>
                         <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{stage.stage}</div>
                         <div className="text-[10px] text-slate-500 font-medium">{stage.purpose}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Center Column: Weekly Tasks & IPM */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Operational Tasks</h2>
              <button 
                onClick={() => setShowIPM(!showIPM)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showIPM ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700'}`}
              >
                {showIPM ? 'Hide IPM' : 'View IPM Plan'}
              </button>
           </div>
           
           {showIPM ? (
             <div className="bg-emerald-950 p-8 rounded-[40px] text-white space-y-6 animate-slide-up">
                <div className="flex items-center space-x-3 mb-4">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <i data-lucide="shield-check" className="w-6 h-6 text-emerald-400"></i>
                   </div>
                   <h3 className="font-black tracking-tight">Integrated Pest Mgmt.</h3>
                </div>
                <div className="space-y-4">
                   {[
                     { step: 'Cultural', desc: 'Maintain weed-free borders to prevent whitefly hosting.', icon: 'leaf' },
                     { step: 'Biological', desc: 'Deploy 5 pheromone traps per acre for fruit borer.', icon: 'bug' },
                     { step: 'Chemical', desc: 'Rotate between Abamectin and Spinosad for resistance mgmt.', icon: 'flask-conical' }
                   ].map((ipm, i) => (
                     <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-3 mb-1">
                           <i data-lucide={ipm.icon} className="w-3 h-3 text-emerald-400"></i>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{ipm.step} Control</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{ipm.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="space-y-4">
                {advisory?.weeklyTasks.map(task => (
                  <div key={task.id} className={`bg-white p-6 rounded-3xl border transition-all ${task.isCompleted ? 'opacity-50 grayscale border-slate-100' : 'border-slate-200 hover:border-rose-300 shadow-sm'}`}>
                     <div className="flex items-start space-x-4">
                        <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-200 text-transparent hover:border-rose-600'}`}>
                           <i data-lucide="check" className="w-4 h-4"></i>
                        </button>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-black text-slate-900 tracking-tight">{task.title}</h4>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>{task.priority}</span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed">{task.description}</p>
                           <div className="mt-3 inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-widest">
                              <i data-lucide="box" className="w-2 h-2 mr-1"></i>
                              {task.category}
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Right Column: Diagnostic Monitoring */}
        <div className="space-y-6">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Pathogen Defense</h2>
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
                         <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Symptoms</h5>
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
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Control</div>
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
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TomatoAdvisor;