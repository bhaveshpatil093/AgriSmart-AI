import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FertilizerApi } from '../api/fertilizer/service';
import { CropsApi } from '../api/crops/service';
import { NutrientAdvisory, Crop } from '../types';

const NutrientPlanner: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [advisory, setAdvisory] = useState<NutrientAdvisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deficiency' | 'schedule' | 'economics'>('deficiency');

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      loadAdvisory();
    }
  }, [selectedCrop]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, advisory, selectedCrop, activeTab]);

  const loadCrops = async () => {
    setLoading(true);
    const res = await CropsApi.getByUser('u123');
    if (res.success && res.data) {
      setCrops(res.data);
      if (res.data.length > 0) setSelectedCrop(res.data[0]);
    }
    setLoading(false);
  };

  const loadAdvisory = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    const res = await FertilizerApi.getAdvisory(selectedCrop);
    if (res.success) setAdvisory(res.data || null);
    setLoading(false);
  };

  const radarData = advisory?.nutrientNeeds.map(n => ({
    subject: n.label,
    A: n.currentLevel,
    fullMark: 100
  })) || [];

  if (loading && !advisory) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Parsing soil chemistry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrient Intelligence</h1>
          <p className="text-slate-500 font-medium">Precision soil health and fertilization models</p>
        </div>
        <div className="flex space-x-2">
           {crops.map(c => (
             <button 
               key={c.cropId}
               onClick={() => setSelectedCrop(c)}
               className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCrop?.cropId === c.cropId ? 'bg-amber-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'}`}
             >
               {c.variety}
             </button>
           ))}
        </div>
      </header>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('deficiency')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'deficiency' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}
        >
          Soil Deficiencies
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}
        >
          App. Schedule
        </button>
        <button 
          onClick={() => setActiveTab('economics')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'economics' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}
        >
          Cost & ROI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           {activeTab === 'deficiency' && (
             <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-10 animate-slide-up">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Soil Nutrient Radar</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Current vs. Target Levels</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Soil pH</div>
                      <div className="text-xl font-black text-slate-900">{advisory?.soilPh}</div>
                   </div>
                </div>

                <div className="h-[400px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                         <PolarGrid stroke="#f1f5f9" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                         <Radar name="Current" dataKey="A" stroke="#d97706" fill="#fbbf24" fillOpacity={0.6} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {advisory?.nutrientNeeds.map((n, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${n.deficiency === 'Severe' ? 'bg-red-100 text-red-600' : n.deficiency === 'Marginal' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {n.nutrient}
                           </div>
                           <span className="text-sm font-bold text-slate-700">{n.label}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${n.deficiency === 'Severe' ? 'text-red-600' : n.deficiency === 'Marginal' ? 'text-amber-600' : 'text-emerald-600'}`}>
                           {n.deficiency}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'schedule' && (
             <div className="space-y-6 animate-slide-up">
                <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Active Fertigation Plan</h3>
                   <div className="space-y-8">
                      {advisory?.schedule.map((task, i) => (
                        <div key={task.id} className="flex items-start space-x-6 relative">
                           {i < advisory.schedule.length - 1 && <div className="absolute top-10 left-6 bottom-0 w-px bg-white/10"></div>}
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 ${task.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                              <span className="text-xs font-black">{task.dap}</span>
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="text-lg font-black tracking-tight">{task.productName}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{new Date(task.date).toLocaleDateString()} • {task.method}</p>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-lg font-black">{task.dosage} {task.unit}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Rate</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-6">
                   <h3 className="font-black text-slate-900 tracking-tight">Application Method Guide</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { title: 'Broadcasting', icon: 'layers', desc: 'Basal dose application before sowing.' },
                        { title: 'Fertigation', icon: 'droplet', desc: 'Water-soluble nutrients via drip.' },
                        { title: 'Foliar Spray', icon: 'wind', desc: 'Direct leaf absorption for micronutrients.' }
                      ].map((m, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-amber-50 hover:border-amber-200 transition-all">
                           <i data-lucide={m.icon} className="w-6 h-6 text-slate-400 group-hover:text-amber-600 mb-4 transition-colors"></i>
                           <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{m.title}</div>
                           <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{m.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'economics' && (
             <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm text-center">
                      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                         <i data-lucide="indian-rupee" className="w-8 h-8"></i>
                      </div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Input Cost</div>
                      <div className="text-4xl font-black text-slate-900">₹{advisory?.costAnalysis.estimatedTotalCost.toLocaleString()}</div>
                      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">Including basal dose, top dressing, and micronutrient sprays for {selectedCrop?.farmSize} acres.</p>
                   </div>
                   <div className="bg-emerald-950 p-10 rounded-[40px] text-white text-center shadow-xl">
                      <div className="w-16 h-16 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                         <i data-lucide="trending-up" className="w-8 h-8"></i>
                      </div>
                      <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Expected ROI</div>
                      <div className="text-4xl font-black text-white">{advisory?.costAnalysis.expectedRoi}x</div>
                      <p className="text-[10px] text-emerald-100/40 mt-4 leading-relaxed">Estimated profit margin increase through optimized nutrient uptake and reduced waste.</p>
                   </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
                   <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Fertilizer Market Comparison</h3>
                   <div className="space-y-4">
                      {[
                        { brand: 'IFFCO Urea', price: 242, trend: '-2%', efficiency: '92%', tag: 'Recommended' },
                        { brand: 'SmartFert DAP', price: 1350, trend: '+5%', efficiency: '88%', tag: 'Price Spike' },
                        { brand: 'Nano Nitrogen', price: 240, trend: 'Stable', efficiency: '98%', tag: 'High ROI' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                           <div className="flex items-center space-x-6">
                              <div className="text-sm font-black text-slate-800">{item.brand}</div>
                              {item.tag && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-black uppercase rounded tracking-widest">{item.tag}</span>}
                           </div>
                           <div className="flex items-center space-x-10">
                              <div className="text-right">
                                 <div className="text-sm font-black text-slate-900">₹{item.price}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Per Bag/Unit</div>
                              </div>
                              <div className="text-right hidden md:block">
                                 <div className="text-sm font-black text-emerald-600">{item.efficiency}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Efficiency</div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                    <i data-lucide="leaf" className="w-5 h-5"></i>
                 </div>
                 <h3 className="font-black text-amber-900 tracking-tight">Organic Alternatives</h3>
              </div>
              <div className="space-y-4">
                 {advisory?.organicAlternatives.map((alt, i) => (
                   <div key={i} className="flex items-start space-x-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                      <p className="text-xs font-medium text-amber-800 leading-relaxed">{alt}</p>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all">
                 Switch to Organic Mode
              </button>
           </div>

           <div className="bg-white border border-slate-200 p-8 rounded-[40px] space-y-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Soil Sample Metadata</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Lab Name', value: 'Nashik Agri Lab' },
                   { label: 'Sample ID', value: '#SK-9022' },
                   { label: 'Test Date', value: '2024-03-12' },
                   { label: 'Organic Matter', value: '1.2%' }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                      <span className="text-xs font-black text-slate-700">{item.value}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                 Upload New Soil Card
              </button>
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

export default NutrientPlanner;