import React, { useState, useEffect } from 'react';
import { IPMApi } from '../api/ipm/service';
import { CropsApi } from '../api/crops/service';
import { IPMSummary, Crop, IPMTask, SprayLogEntry, IPMCategory } from '../types';

const IPMScheduler: React.FC = () => {
   const [summary, setSummary] = useState<IPMSummary | null>(null);
   const [crops, setCrops] = useState<Crop[]>([]);
   const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<'board' | 'registry' | 'safety'>('board');

   useEffect(() => {
      loadInitialData();
   }, []);

   useEffect(() => {
      if (selectedCrop) {
         loadSummary();
      }
   }, [selectedCrop]);

   useEffect(() => {
      const win = window as any;
      if (win.lucide) win.lucide.createIcons();
   }, [loading, summary, activeTab]);

   const loadInitialData = async () => {
      setLoading(true);
      const res = await CropsApi.getByUser('u123');
      if (res.success && res.data && res.data.length > 0) {
         setCrops(res.data);
         setSelectedCrop(res.data[0]);
      }
      setLoading(false);
   };

   const loadSummary = async () => {
      if (!selectedCrop) return;
      setLoading(true);
      const res = await IPMApi.getSummary(selectedCrop);
      if (res.success) setSummary(res.data || null);
      setLoading(false);
   };

   const getCategoryColor = (cat: IPMCategory) => {
      switch (cat) {
         case 'Biological': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
         case 'Cultural': return 'bg-amber-100 text-amber-700 border-amber-200';
         case 'Mechanical': return 'bg-blue-100 text-blue-700 border-blue-200';
         case 'Chemical': return 'bg-rose-100 text-rose-700 border-rose-200';
         default: return 'bg-slate-100 text-slate-700';
      }
   };

   if (loading && !summary) {
      return (
         <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-slate-500 font-medium">Assembling IPM strategy...</p>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 animate-fade-in">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">IPM Intelligence</h1>
               <p className="text-slate-500 font-medium">Integrated Pest Management & Traceability</p>
            </div>
            <div className="flex items-center space-x-3">
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

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center space-x-6">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="shield-check" className="w-8 h-8"></i>
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900">{summary?.complianceScore}%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Score</div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center space-x-6">
               <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="flask-conical" className="w-8 h-8"></i>
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900">{summary?.chemicalDependency}%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chemical Reliance</div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center space-x-6">
               <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="alert-circle" className="w-8 h-8"></i>
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900">{summary?.tasks.filter(t => t.status === 'pending').length}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Interventions</div>
               </div>
            </div>
         </div>

         <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
            <button
               onClick={() => setActiveTab('board')}
               className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'board' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
            >
               Activity Board
            </button>
            <button
               onClick={() => setActiveTab('registry')}
               className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'registry' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
            >
               Spray Registry
            </button>
            <button
               onClick={() => setActiveTab('safety')}
               className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'safety' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
            >
               Safety & PHI
            </button>
         </div>

         {activeTab === 'board' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
               <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Planned Interventions</h2>
                  <div className="space-y-4">
                     {summary?.tasks.map((task) => (
                        <div key={task.id} className={`bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group hover:border-emerald-300 transition-all ${task.status === 'completed' ? 'opacity-50 grayscale' : ''}`}>
                           <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-6">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${getCategoryColor(task.category)}`}>
                                    <i data-lucide={task.category === 'Biological' ? 'bug' : task.category === 'Mechanical' ? 'cog' : 'leaf'} className="w-6 h-6"></i>
                                 </div>
                                 <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{task.title}</h3>
                                    <div className="flex items-center space-x-3 mt-1">
                                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getCategoryColor(task.category)}`}>
                                          {task.category}
                                       </span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target: {task.pestTarget}</span>
                                    </div>
                                 </div>
                              </div>
                              <button className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-emerald-600'}`}>
                                 <i data-lucide="check" className="w-5 h-5"></i>
                              </button>
                           </div>
                           <p className="mt-6 text-sm text-slate-500 font-medium leading-relaxed">{task.description}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6">
                     <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Knowledge Spotlight</h3>
                     <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className="flex items-center space-x-3 mb-2">
                              <i data-lucide="shield" className="w-4 h-4 text-emerald-400"></i>
                              <span className="text-xs font-bold">Biological Resistance</span>
                           </div>
                           <p className="text-[11px] text-slate-400 leading-relaxed">Rotate chemical IRAC groups every 2 applications to prevent Nashik-native Thrips from developing resistance.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className="flex items-center space-x-3 mb-2">
                              <i data-lucide="info" className="w-4 h-4 text-amber-400"></i>
                              <span className="text-xs font-bold">Weather Thresholds</span>
                           </div>
                           <p className="text-[11px] text-slate-400 leading-relaxed">Avoid spraying if wind speed &gt; 15km/h to prevent spray drift into neighboring plots.</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] space-y-6">
                     <div className="flex items-center space-x-3">
                        <i data-lucide="users" className="w-5 h-5 text-emerald-600"></i>
                        <h3 className="font-black text-emerald-900 tracking-tight">Labor Assignment</h3>
                     </div>
                     <div className="space-y-3">
                        {['Sanjay Patil', 'Vinod Deshmukh'].map((name, i) => (
                           <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-200">
                              <span className="text-xs font-bold text-slate-700">{name}</span>
                              <span className="text-[9px] font-black text-emerald-600 uppercase">Certified</span>
                           </div>
                        ))}
                     </div>
                     <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">
                        Assign Task
                     </button>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'registry' && (
            <div className="space-y-8 animate-slide-up">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Historical Spray Records</h2>
                  <button className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95">
                     Log New Application
                  </button>
               </div>
               <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Operator</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Active</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage / Target</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PHI / REI</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Effectiveness</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {summary?.logs.map((log) => (
                           <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="text-sm font-black text-slate-900">{log.date}</div>
                                 <div className="text-[10px] text-slate-400 font-bold">{log.operatorName}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-sm font-black text-rose-600">{log.productName}</div>
                                 <div className="text-[10px] text-slate-400 font-bold">{log.activeIngredient}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-sm font-black text-slate-900">{log.dosage}</div>
                                 <div className="text-[10px] text-slate-400 font-bold">{log.targetPest}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center space-x-4">
                                    <div className="text-center px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                                       <div className="text-xs font-black text-amber-700">{log.phiDays}d</div>
                                       <div className="text-[8px] font-bold text-amber-600 uppercase">PHI</div>
                                    </div>
                                    <div className="text-center px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                                       <div className="text-xs font-black text-blue-700">{log.reiHours}h</div>
                                       <div className="text-[8px] font-bold text-blue-600 uppercase">REI</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                                    {log.effectiveness}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'safety' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               <div className="bg-slate-950 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                           <i data-lucide="shield-alert" className="w-8 h-8 text-rose-400"></i>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Active PHI Quarantine</h2>
                     </div>
                     <p className="text-slate-400 leading-relaxed font-medium text-lg">We detected 1 active Pre-Harvest Interval (PHI) restriction for Plot East-B. Harvesting before May 17 may result in residue non-compliance for export standards.</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                           <div className="text-[10px] font-black uppercase opacity-40 mb-2">Days Remaining</div>
                           <div className="text-4xl font-black text-rose-400">04</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                           <div className="text-[10px] font-black uppercase opacity-40 mb-2">Safe Date</div>
                           <div className="text-2xl font-black text-emerald-400">May 17</div>
                        </div>
                     </div>
                     <button className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Generate Residue Report
                     </button>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-950 tracking-tight flex items-center">
                        <i data-lucide="hard-hat" className="w-6 h-6 mr-4 text-slate-400"></i>
                        Mandatory PPE Checklist
                     </h3>
                     <div className="space-y-4">
                        {[
                           { item: 'Chemical Resistant Gloves (Nitrile)', icon: 'hand' },
                           { item: 'Full Face Shield / Goggles', icon: 'eye' },
                           { item: 'Respirator with P95 Filter', icon: 'wind' },
                           { item: 'Waterproof Coveralls', icon: 'shirt' }
                        ].map((ppe, i) => (
                           <div key={i} className="flex items-center space-x-6 p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-slate-100 transition-all">
                              <div className="w-5 h-5 rounded border-2 border-slate-200 group-hover:border-emerald-500 bg-white"></div>
                              <span className="text-sm font-bold text-slate-700">{ppe.item}</span>
                           </div>
                        ))}
                     </div>
                     <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed italic">
                           *PPE recommendations based on Abamectin SDS (Safety Data Sheet). Ensure triple rinsing of containers after use.
                        </p>
                     </div>
                  </div>

                  <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex items-start space-x-6">
                     <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                        <i data-lucide="flame" className="w-6 h-6"></i>
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Chemical Storage Note</h4>
                        <p className="text-xs text-amber-800/70 mt-1 leading-relaxed font-medium">Keep pesticides in original containers, locked in a ventilated room away from seeds and cattle feed.</p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      </div>
   );
};

export default IPMScheduler;