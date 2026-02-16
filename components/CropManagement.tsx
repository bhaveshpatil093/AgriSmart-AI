import React, { useState, useEffect } from 'react';
import { CropsApi } from '../client_api/crops/service';
import { Crop, Activity, CostRecord } from '../types';
import { calculateCropStage } from '../utils/agronomy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const CropManagement: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'detail' | 'analytics'>('grid');

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, crops, showAddWizard, selectedCrop, activeView]);

  const loadCrops = async () => {
    setLoading(true);
    const res = await CropsApi.getByUser('u123');
    if (res.success) setCrops(res.data || []);
    setLoading(false);
  };

  const openDetail = (crop: Crop) => {
    setSelectedCrop(crop);
    setActiveView('detail');
  };

  if (loading && crops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Synchronizing farm registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Plot Operations</h1>
          <p className="text-slate-500 font-medium">Manage your {crops.length} active Nashik agricultural blocks</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-[15px] border border-slate-200">
             <button 
               onClick={() => setActiveView('grid')}
               className={`px-4 py-2 rounded-[15px] text-xs font-bold transition-all ${activeView === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
             >
               Overview
             </button>
             <button 
               onClick={() => setActiveView('analytics')}
               className={`px-4 py-2 rounded-[15px] text-xs font-bold transition-all ${activeView === 'analytics' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
             >
               Efficiency
             </button>
          </div>
          <button 
            onClick={() => setShowAddWizard(true)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-[15px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
          >
            New Registration
          </button>
        </div>
      </header>

      {activeView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {crops.map((crop) => {
             const stageInfo = calculateCropStage(crop.cropType, crop.plantingDate);
             return (
               <div 
                 key={crop.cropId} 
                 onClick={() => openDetail(crop)}
                 className="group cursor-pointer bg-white rounded-[15px] border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all relative overflow-hidden"
               >
                  <div className="h-48 w-full overflow-hidden">
                    <img src={crop.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={crop.cropType} />
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{crop.variety}</h3>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1">{crop.cropType}</p>
                       </div>
                       <div className="w-10 h-10 bg-slate-50 rounded-[15px] flex items-center justify-center text-slate-400 border border-slate-100">
                          <i data-lucide={crop.cropType === 'Grape' ? 'grape' : crop.cropType === 'Tomato' ? 'cherry' : 'sprout'} className="w-5 h-5"></i>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Growth Progress</span>
                          <span>{stageInfo.progress}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stageInfo.progress}%` }}></div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 bg-slate-50 rounded-[15px]">
                          <div className="text-[8px] font-black uppercase text-slate-400 mb-1">DAP</div>
                          <div className="text-sm font-black text-slate-900">{stageInfo.dap} Days</div>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-[15px]">
                          <div className="text-[8px] font-black uppercase text-slate-400 mb-1">Scale</div>
                          <div className="text-sm font-black text-slate-900">{crop.farmSize} Acres</div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                       <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${crop.healthScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{crop.healthScore}% Healthy</span>
                       </div>
                       <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Blueprint</button>
                    </div>
                  </div>
               </div>
             );
           })}
        </div>
      )}

      {activeView === 'detail' && selectedCrop && (
        <CropDetailView 
          crop={selectedCrop} 
          onClose={() => setActiveView('grid')} 
          onUpdate={loadCrops}
        />
      )}

      {activeView === 'analytics' && (
        <CropAnalyticsDashboard crops={crops} />
      )}

      {showAddWizard && (
        <AddCropWizard onClose={() => setShowAddWizard(false)} onComplete={loadCrops} />
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

interface DetailProps { crop: Crop; onClose: () => void; onUpdate: () => void; }
const CropDetailView: React.FC<DetailProps> = ({ crop, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'analytics' | 'photos'>('overview');
  const [isLogging, setIsLogging] = useState(false);
  const stageInfo = calculateCropStage(crop.cropType, crop.plantingDate);

  const handleQuickLog = async (type: string) => {
    await CropsApi.addActivity(crop.cropId, {
      type: type as any,
      date: new Date().toISOString().split('T')[0],
      notes: `Quick log via mobile interface.`
    });
    alert(`${type} log updated.`);
    onUpdate();
  };

  return (
    <div className="space-y-8 animate-slide-up">
       <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-[15px] text-slate-400 hover:text-emerald-600 transition-all">
             <i data-lucide="arrow-left" className="w-5 h-5"></i>
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{crop.variety} Blueprint</h2>
       </div>

       {/* Hero Block */}
       <div className="bg-white rounded-[15px] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[500px]">
          <div className="lg:w-1/2 h-64 lg:h-auto">
             <img src={crop.images?.[0]} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 p-12 space-y-10 overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{crop.currentStage}</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">DAP {stageInfo.dap} • Cycle Phase</p>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black text-emerald-600">{crop.healthScore}%</div>
                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Health Score</div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Growth Timeline</h4>
                <div className="flex justify-between relative">
                   <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100"></div>
                   {crop.milestones.slice(0, 5).map((m, i) => (
                     <div key={i} className="flex flex-col items-center space-y-3 relative z-10">
                        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors ${m.status === 'completed' ? 'bg-emerald-500' : m.status === 'active' ? 'bg-blue-500' : 'bg-slate-200'}`}>
                           {m.status === 'completed' && <i data-lucide="check" className="w-3 h-3 text-white"></i>}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tight ${m.status === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>{m.stage}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Irrigate', icon: 'droplet' },
                  { label: 'Fertilize', icon: 'flask-conical' },
                  { label: 'Pest', icon: 'search' },
                  { label: 'Harvest', icon: 'scissors' }
                ].map(action => (
                  <button 
                    key={action.label}
                    onClick={() => handleQuickLog(action.label)}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-[15px] hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                  >
                     <i data-lucide={action.icon} className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 mb-2"></i>
                     <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-emerald-700">{action.label}</span>
                  </button>
                ))}
             </div>
          </div>
       </div>

       {/* Tabs Interface */}
       <div className="space-y-8">
          <div className="flex border-b border-slate-200 space-x-10">
             {['overview', 'activities', 'analytics', 'photos'].map((t) => (
               <button
                 key={t}
                 onClick={() => setActiveTab(t as any)}
                 className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  {t}
                  {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full"></div>}
               </button>
             ))}
          </div>

          <div className="animate-fade-in">
             {activeTab === 'overview' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm space-y-6">
                     <h3 className="font-black text-slate-900 tracking-tight">Stage Characteristics</h3>
                     <p className="text-sm text-slate-600 leading-relaxed font-medium">"{stageInfo.description}"</p>
                     <div className="p-6 bg-blue-50 border border-blue-100 rounded-[15px]">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-2">Upcoming Milestone</h4>
                        <div className="text-lg font-black text-blue-900">{stageInfo.nextStage}</div>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="font-black text-slate-900 tracking-tight">Soil Telemetry</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <div className="text-[10px] font-black text-slate-400 uppercase">pH Balance</div>
                           <div className="text-2xl font-black text-slate-900">{crop.soilData?.ph || '7.2'}</div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] font-black text-slate-400 uppercase">Nitrogen Rank</div>
                           <div className="text-2xl font-black text-emerald-600">Optimum</div>
                        </div>
                     </div>
                     <button className="w-full py-4 bg-slate-950 text-white rounded-[15px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Download Full Soil Card</button>
                  </div>
               </div>
             )}

             {activeTab === 'activities' && (
               <div className="space-y-6">
                  {crop.activities.length > 0 ? (
                    crop.activities.map(a => (
                      <div key={a.id} className="bg-white p-6 rounded-[15px] border border-slate-200 flex items-center justify-between">
                         <div className="flex items-center space-x-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-[15px] flex items-center justify-center text-slate-400">
                               <i data-lucide="check-circle" className="w-6 h-6"></i>
                            </div>
                            <div>
                               <div className="text-sm font-black text-slate-900">{a.type}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">{a.date}</div>
                            </div>
                         </div>
                         <p className="text-xs text-slate-500 font-medium max-w-sm italic">"{a.notes}"</p>
                         <button className="p-3 hover:bg-slate-50 rounded-[15px] text-slate-300 transition-colors">
                            <i data-lucide="more-horizontal" className="w-5 h-5"></i>
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[15px]">
                       <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">No activity logs found</p>
                    </div>
                  )}
               </div>
             )}

             {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm">
                      <h3 className="font-black text-slate-900 mb-8">Cost Breakdown</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={crop.costs}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                               <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-slate-900 p-10 rounded-[15px] text-white">
                      <h3 className="font-black mb-8">Yield Potential</h3>
                      <div className="space-y-8">
                         <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                               <span>Projected vs Target</span>
                               <span>88%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-400" style={{ width: '88%' }}></div>
                            </div>
                         </div>
                         <div className="p-6 bg-white/5 rounded-[15px] border border-white/10">
                            <div className="text-[10px] font-black uppercase opacity-40">Est. Market Value</div>
                            <div className="text-3xl font-black text-emerald-400">₹{(crop.targetYield * 2400).toLocaleString()}</div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'photos' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {crop.images?.map((img, i) => (
                     <div key={i} className="aspect-square rounded-[15px] overflow-hidden border-2 border-slate-100 hover:border-emerald-300 transition-all cursor-zoom-in">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                     </div>
                   ))}
                   <button className="aspect-square rounded-[15px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:text-emerald-600 hover:bg-slate-50 transition-all">
                      <i data-lucide="plus" className="w-10 h-10 mb-2"></i>
                      <span className="text-[10px] font-black uppercase">Add Photo</span>
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const CropAnalyticsDashboard: React.FC<{ crops: Crop[] }> = ({ crops }) => {
  const yieldData = crops.map(c => ({
    name: c.variety,
    actual: c.farmSize * 10, // Mock current status
    target: c.targetYield
  }));

  return (
    <div className="space-y-8 animate-slide-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm">
             <h3 className="text-xl font-black text-slate-950 mb-1">Comparative Yield</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">Actual Progress vs Seasonal Goal (Tons)</p>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={yieldData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                      <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[15px] text-white space-y-8 shadow-2xl">
             <h3 className="text-xl font-black mb-10">Aggregated Economics</h3>
             <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                   <div>
                      <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Investment</div>
                      <div className="text-3xl font-black text-white">₹{crops.reduce((s, c) => s + c.costs.reduce((t, r) => t + r.amount, 0), 0).toLocaleString()}</div>
                   </div>
                   <div className="w-12 h-12 bg-white/5 rounded-[15px] flex items-center justify-center text-rose-400">
                      <i data-lucide="trending-down" className="w-6 h-6"></i>
                   </div>
                </div>
                <div className="flex justify-between items-center pb-6">
                   <div>
                      <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Projected Gross Return</div>
                      <div className="text-3xl font-black text-emerald-400">₹2.4M</div>
                   </div>
                   <div className="w-12 h-12 bg-white/5 rounded-[15px] flex items-center justify-center text-emerald-400">
                      <i data-lucide="trending-up" className="w-6 h-6"></i>
                   </div>
                </div>
                <button className="w-full py-5 bg-white text-slate-950 rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all">Download Season Audit (PDF)</button>
             </div>
          </div>
       </div>
    </div>
  );
};

interface WizardProps { onClose: () => void; onComplete: () => void; }
const AddCropWizard: React.FC<WizardProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: 'Grape',
    variety: 'Thompson Seedless',
    plantingDate: new Date().toISOString().split('T')[0],
    farmSize: 1,
    plotLocation: '',
    irrigationMethod: 'drip' as const
  });

  const handleSubmit = async () => {
    setLoading(true);
    const res = await CropsApi.create({ ...formData, userId: 'u123' });
    if (res.success) {
      onComplete();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
       <div className="relative bg-white w-full max-w-2xl rounded-[15px] p-12 shadow-2xl animate-scale-up overflow-y-auto max-h-[90vh]">
          <header className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Register New Plot</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Step {step} of 3</p>
             </div>
             <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-[15px] transition-all">
                <i data-lucide="x" className="w-6 h-6"></i>
             </button>
          </header>

          <div className="space-y-8">
             {step === 1 && (
               <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {['Grape', 'Onion', 'Tomato'].map(type => (
                       <button
                         key={type}
                         onClick={() => setFormData({...formData, cropType: type})}
                         className={`p-6 rounded-[15px] border-2 transition-all flex flex-col items-center justify-center space-y-4 ${formData.cropType === type ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                       >
                          <i data-lucide={type === 'Grape' ? 'grape' : type === 'Tomato' ? 'cherry' : 'sprout'} className={`w-8 h-8 ${formData.cropType === type ? 'text-emerald-600' : 'text-slate-300'}`}></i>
                          <span className={`text-xs font-black uppercase tracking-widest ${formData.cropType === type ? 'text-emerald-700' : 'text-slate-400'}`}>{type}</span>
                       </button>
                     ))}
                  </div>
                  <div className="space-y-2 pt-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Variety</label>
                     <select 
                       value={formData.variety}
                       onChange={(e) => setFormData({...formData, variety: e.target.value})}
                       className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                     >
                        <option>Thompson Seedless</option>
                        <option>Sharad Seedless</option>
                        <option>Bhima Super</option>
                        <option>Abhinav Hybrid</option>
                     </select>
                  </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Planting Date</label>
                        <input type="date" value={formData.plantingDate} onChange={(e) => setFormData({...formData, plantingDate: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-black text-slate-900" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Area (Acres)</label>
                        <input type="number" step="0.1" value={formData.farmSize} onChange={(e) => setFormData({...formData, farmSize: parseFloat(e.target.value)})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-black text-slate-900" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Plot Nickname / Location</label>
                     <input type="text" placeholder="e.g. East Vineyard Block B" value={formData.plotLocation} onChange={(e) => setFormData({...formData, plotLocation: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold" />
                  </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-8 animate-fade-in text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <i data-lucide="check-circle" className="w-10 h-10"></i>
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 tracking-tight">Ready to Initialize?</h4>
                     <p className="text-sm text-slate-500 mt-2 font-medium">This will set up your growth milestones and diagnostic history for {formData.variety}.</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[15px] border border-slate-100 text-left space-y-4">
                     <div className="flex justify-between text-xs font-bold border-b border-slate-200 pb-3">
                        <span className="text-slate-400">Species</span>
                        <span className="text-slate-900 uppercase tracking-widest">{formData.cropType}</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold border-b border-slate-200 pb-3">
                        <span className="text-slate-400">Planting</span>
                        <span className="text-slate-900">{formData.plantingDate}</span>
                     </div>
                  </div>
               </div>
             )}

             <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="flex-1 py-5 bg-slate-950 text-white rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center"
                  >
                    {loading ? <i data-lucide="refresh-cw" className="w-5 h-5 animate-spin"></i> : 'Complete Entry'}
                  </button>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default CropManagement;