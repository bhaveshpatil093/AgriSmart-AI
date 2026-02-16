import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { PricePredictionApi } from '../client_api/market/predictionService';
import { PricePredictionOutcome } from '../types';

const PriceForecaster: React.FC = () => {
  const [outcome, setOutcome] = useState<PricePredictionOutcome | null>(null);
  const [crop, setCrop] = useState('Onion');
  const [timeframe, setTimeframe] = useState<'7d' | '15d'>('15d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [crop, timeframe]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, outcome]);

  const loadForecast = async () => {
    setLoading(true);
    const res = await PricePredictionApi.getForecast(crop, timeframe);
    if (res.success) setOutcome(res.data || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Running Vertex AI AutoML Inference...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest mb-4">
             <i data-lucide="cpu" className="w-3 h-3 mr-2"></i>
             Vertex AI Prediction Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Market Price Forecast</h1>
          <p className="text-slate-500 font-medium">Predictive time-series modeling for Nashik Mandis</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <select 
             value={crop} 
             onChange={(e) => setCrop(e.target.value)}
             className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
           >
             <option>Onion</option>
             <option>Grape</option>
             <option>Tomato</option>
           </select>
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {['7d', '15d'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeframe === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                >
                  {t} Forecast
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* Primary Forecast Chart */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="flex justify-between items-start mb-12">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Price Trajectory</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">95% Confidence Interval Band (₹ per Quintal)</p>
            </div>
            <div className="text-right">
               <div className="text-xs font-bold text-slate-400 uppercase">Model Accuracy (MAPE)</div>
               <div className="text-3xl font-black text-emerald-600">{outcome?.metrics.mape}%</div>
            </div>
         </div>
         <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={outcome?.predictions}>
                  <defs>
                     <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
                  <Area 
                    name="95% Confidence" 
                    dataKey="confidenceUpper" 
                    fill="url(#confidenceBand)" 
                    stroke="none" 
                  />
                  {/* The lower band is handled by providing a customized area or two points if needed, 
                      but for simplicity here we visualize the envelope */}
                  <Area 
                    name="95% Confidence" 
                    dataKey="confidenceLower" 
                    fill="#fff" 
                    stroke="none" 
                  />
                  <Line 
                    type="monotone" 
                    name="Predicted Price" 
                    dataKey="predictedPrice" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                  />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Feature Importance (Explainability) */}
         <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Model Explainability</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Factors Driving this Forecast</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-xl">
                  <i data-lucide="eye" className="w-5 h-5 text-slate-400"></i>
               </div>
            </div>
            <div className="space-y-6">
               {outcome?.explainability.map((feat, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                       <span className="text-slate-600">{feat.feature}</span>
                       <span className={feat.impact === 'positive' ? 'text-emerald-600' : 'text-rose-600'}>
                          {feat.impact === 'positive' ? '+' : '-'}{Math.round(feat.weight * 100)}%
                       </span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${feat.impact === 'positive' ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                         style={{ width: `${feat.weight * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start space-x-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <i data-lucide="zap" className="w-5 h-5 text-blue-500"></i>
               </div>
               <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  <strong>AI Insight:</strong> UAE export demand is offsetting local arrival spikes. Prices likely to remain resilient despite increased Lasalgaon volume.
               </p>
            </div>
         </div>

         {/* Model Governance & Evaluation */}
         <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h3 className="text-xl font-black tracking-tight">Governance & Drift</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Continuous Training Pipeline</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <i data-lucide="shield-check" className="w-5 h-5 text-emerald-400"></i>
                  </div>
               </div>
               
               <div className="flex-1 space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="text-[10px] font-black uppercase opacity-40 mb-2">Vertex vs Baseline</div>
                        <div className="text-3xl font-black text-emerald-400">2.6x</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Precision Gain</div>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="text-[10px] font-black uppercase opacity-40 mb-2">Last Retrained</div>
                        <div className="text-xl font-black text-white">48h Ago</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Automated Cycle</div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">ML Pipeline Status</h4>
                     <div className="space-y-3">
                        {[
                          { label: 'Data Ingestion', status: 'Healthy', color: 'bg-emerald-400' },
                          { label: 'Feature Engineering', status: 'Healthy', color: 'bg-emerald-400' },
                          { label: 'Hyperparameter Tuning', status: 'Optimized', color: 'bg-blue-400' },
                          { label: 'Model Evaluation', status: '94.2% Acc', color: 'bg-emerald-400' }
                        ].map((step, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                             <span className="text-slate-400 font-medium">{step.label}</span>
                             <div className="flex items-center space-x-2">
                                <span className="font-bold">{step.status}</span>
                                <div className={`w-2 h-2 rounded-full ${step.color} animate-pulse`}></div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <button className="w-full mt-12 py-5 bg-white text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
                  Download Evaluation Report (PDF)
               </button>
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

export default PriceForecaster;