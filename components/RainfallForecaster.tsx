
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PredictionApi } from '../client_api/prediction/service';
import { PredictionOutcome } from '../types';

const RainfallForecaster: React.FC = () => {
  const [outcome, setOutcome] = useState<PredictionOutcome | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '48h' | '7d'>('24h');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'evaluation'>('forecast');

  useEffect(() => {
    fetchForecast();
  }, [timeframe]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [outcome, loading, activeTab]);

  const fetchForecast = async () => {
    setLoading(true);
    const res = await PredictionApi.getRainfallForecast('Nashik, MH', timeframe);
    if (res.success) setOutcome(res.data || null);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i data-lucide="cloud-rain" className="w-6 h-6"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vertex AI Prediction</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Localized Rainfall Engine v2.4</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('forecast')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'forecast' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Smart Forecast
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'evaluation' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Model Performance
          </button>
        </div>
      </header>

      {activeTab === 'forecast' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Card */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-slate-900">Precipitation Intensity</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Comparison: ML Model vs IMD Baseline</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  {['24h', '48h', '7d'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t as any)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${timeframe === t ? 'bg-white text-blue-600 shadow-sm shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={outcome?.predictions || []}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="mm" />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                    <Area type="monotone" name="AgriSmart Prediction" dataKey="predictedRainfall" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" />
                    <Line type="monotone" name="IMD Baseline" dataKey="baselineRainfall" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainable AI Card */}
            <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
               <div className="relative z-10 flex items-start space-x-6">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <i data-lucide="bot" className="w-6 h-6"></i>
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Model Explanation</h4>
                    <p className="text-lg font-medium leading-relaxed italic">"{outcome?.explanation}"</p>
                    <div className="mt-4 inline-flex items-center text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">
                      Confidence Level: {outcome?.predictions[0] ? Math.round(outcome.predictions[0].probability * 100) : '--'}%
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Model Metadata */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Model Artifacts</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Model ID', value: outcome?.evaluation.modelId, icon: 'database' },
                   { label: 'Hyperparams', value: 'Auto-Tuned (Bayesian)', icon: 'settings-2' },
                   { label: 'Retraining Cycle', value: '72h Recurring', icon: 'refresh-ccw' },
                   { label: 'Last Deployed', value: outcome?.evaluation.lastRetrained ? new Date(outcome.evaluation.lastRetrained).toLocaleDateString() : '--', icon: 'calendar' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center space-x-4">
                     <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                        <i data-lucide={item.icon} className="w-4 h-4"></i>
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</div>
                        <div className="text-xs font-black text-slate-700">{item.value}</div>
                     </div>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                Access Vertex Dashboard
              </button>
            </div>

            {/* A/B Test Results Summary */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Live A/B Testing</h3>
                <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase">Champion</div>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Model V2.4 (Active)</span>
                       <span className="text-xl font-black text-emerald-400">94.2%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Legacy V2.3 (Control)</span>
                       <span className="text-xl font-black text-slate-500">88.7%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-600 rounded-full" style={{ width: '88.7%' }}></div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 leading-relaxed pt-2">V2.4 shows a 5.5% improvement in F1-score for unseasonable monsoon event detection.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Detailed metrics dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: 'RMSE (Error)', value: outcome?.evaluation.rmse, icon: 'target', sub: 'Root Mean Square Error', color: 'text-red-600', bg: 'bg-red-50' },
               { label: 'MAE (Deviance)', value: outcome?.evaluation.mae, icon: 'compass', sub: 'Mean Absolute Error', color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Accuracy', value: `${outcome?.evaluation.accuracyScore ? outcome.evaluation.accuracyScore * 100 : '--'}%`, icon: 'shield-check', sub: 'Overall Reliability', color: 'text-emerald-600', bg: 'bg-emerald-50' }
             ].map((m, i) => (
               <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                  <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-8`}>
                    <i data-lucide={m.icon} className="w-7 h-7"></i>
                  </div>
                  <div className="text-4xl font-black text-slate-900 tracking-tighter">{m.value}</div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">{m.label}</div>
                  <p className="text-[10px] text-slate-300 font-medium mt-1">{m.sub}</p>
               </div>
             ))}
          </div>

          <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm">
             <div className="max-w-3xl space-y-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Continuous Retraining Pipeline</h3>
                <p className="text-slate-500 font-medium leading-relaxed">The model is automatically retrained every 72 hours on the Vertex AI platform using the latest Ground Truth labels from ground-based weather stations across Maharashtra. This pipeline prevents feature drift and maintains accuracy during climatic shifts.</p>
                <div className="flex flex-wrap gap-4">
                   {['Data Collection', 'Preprocessing', 'AutoML Training', 'Evaluation', 'Canary Deployment'].map((step, i) => (
                     <div key={i} className="flex items-center space-x-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">{i+1}</div>
                        <span className="text-xs font-bold text-slate-600">{step}</span>
                        {i < 4 && <i data-lucide="arrow-right" className="w-3 h-3 text-slate-300"></i>}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

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

export default RainfallForecaster;
