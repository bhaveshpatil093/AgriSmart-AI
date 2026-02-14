
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { getClimateImpactProjection } from '../services/geminiService';
import { HistoricalApi } from '../api/historical/service';
import { ClimateAnalysis } from '../types';
import { formatHistoricalTrends, calculateSMA } from '../utils/analytics';

const ClimateInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'historical' | 'projection'>('historical');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [crop, setCrop] = useState('Thompson Seedless Grapes');
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState<any>(null);
  const [history, setHistory] = useState<ClimateAnalysis | null>(null);

  useEffect(() => {
    loadHistoricalData();
  }, [location]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [projection, loading, history, activeTab]);

  const loadHistoricalData = async () => {
    setLoading(true);
    const res = await HistoricalApi.getAnalysis(location);
    if (res.success) setHistory(res.data || null);
    setLoading(false);
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const result = await getClimateImpactProjection(location, crop);
      setProjection(result);
    } catch (err) {
      console.error(err);
      alert("Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const trendData = useMemo(() => {
    if (!history) return [];
    const formatted = formatHistoricalTrends(history.yearlyTrends);
    const temps = formatted.map(d => d.temp);
    const rain = formatted.map(d => d.rain);
    
    // Calculate 3-year Moving Averages
    const smaTemp = calculateSMA(temps, 3);
    const smaRain = calculateSMA(rain, 3);
    
    return formatted.map((d, i) => ({
      ...d,
      smaTemp: smaTemp[i],
      smaRain: smaRain[i]
    }));
  }, [history]);

  // Task 9: Monthly Distribution (Aggregated across decade)
  const distributionData = useMemo(() => {
    if (!history) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      const avg = history.yearlyTrends.reduce((sum, y) => sum + y.monthlyRainfall[i], 0) / history.yearlyTrends.length;
      return { month: m, avgRain: Math.round(avg) };
    });
  }, [history]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Regional Climate Insights</h1>
          <p className="text-slate-500 font-medium">Nashik District: Decadal Trends & AI Projections</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('historical')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'historical' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
          >
            Baseline Trends
          </button>
          <button 
            onClick={() => setActiveTab('projection')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'projection' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
          >
            Resilience Forecast
          </button>
        </div>
      </header>

      {activeTab === 'historical' ? (
        <div className="space-y-8">
          {/* indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Temp Shift', value: `+${history?.indicators.tempShift.toFixed(2)}°C`, icon: 'thermometer', sub: 'Decadal Warming', color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Rainfall Drift', value: `${history?.indicators.rainfallChange.toFixed(1)}%`, icon: 'cloud-rain', sub: 'Variability vs 2014', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Hazard Count', value: history?.indicators.anomalyCount.toString(), icon: 'zap', sub: 'Extreme Event Years', color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Risk Factor', value: history?.indicators.forecastedRisk.toUpperCase(), icon: 'shield-alert', sub: 'Model Assessment', color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <i data-lucide={stat.icon} className="w-6 h-6"></i>
                </div>
                <div className="text-3xl font-black text-slate-900 leading-none">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Temp with SMA */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-950 mb-1">Temperature Variance</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">Actual vs 3-Year Moving Average</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="°C" />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="temp" fill="#fef3c7" stroke="none" />
                    <Line type="monotone" name="SMA (3yr)" dataKey="smaTemp" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Rainfall Distribution Histogram */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-950 mb-1">Seasonal Distribution</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">Average Monthly Rainfall (Nashik Dist.)</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="mm" />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="avgRain" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Task 9: Annual Report Card */}
          <div className="bg-slate-950 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex px-4 py-1.5 bg-white/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 tracking-[0.2em]">Annual Resilience Audit</div>
                  <h3 className="text-4xl font-black tracking-tighter leading-none">Your 2024 Climate Strategy Report</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">Nashik's pre-monsoon temperature peaks are arriving 12 days earlier on average. We recommend shifting your {crop} pruning schedule to mitigate early heat stress.</p>
                  <button className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-xl active:scale-95">
                    Download Full PDF Report
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="text-[10px] font-black uppercase opacity-40 mb-2">Trend Accuracy</div>
                      <div className="text-3xl font-black text-emerald-400">98.2%</div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="text-[10px] font-black uppercase opacity-40 mb-2">Data Points</div>
                      <div className="text-3xl font-black text-blue-400">1.2M+</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {projection ? (
             <div className="space-y-8">
              <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden">
                <h2 className="text-3xl font-black text-slate-950 mb-10 border-b border-slate-50 pb-10 flex items-center tracking-tighter">
                   <i data-lucide="sparkles" className="w-8 h-8 mr-4 text-emerald-500"></i>
                   AI Resilience Forecast (2024-2029)
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-[2] text-lg">
                  <div className="whitespace-pre-wrap">{projection.text}</div>
                </div>

                {/* Fix: Added display of search grounding sources as required by guidelines when using the googleSearch tool */}
                {projection.sources && projection.sources.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <i data-lucide="link" className="w-3 h-3 mr-2"></i>
                      Grounding Sources
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {projection.sources.map((source: any, i: number) => source.web && (
                        <a 
                          key={i} 
                          href={source.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          {source.web.title || source.web.uri}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
               <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                  <i data-lucide="bot" className="w-12 h-12"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-950">AI Resilience Simulation</h3>
               <p className="text-slate-500 max-w-md mt-4">Generate long-term agricultural insights for {crop} in {location}.</p>
               <button 
                  onClick={handleSimulate}
                  className="mt-10 px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl active:scale-95"
                >
                  Initiate Simulation
                </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ClimateInsights;
