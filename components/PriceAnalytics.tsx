import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, BarChart, Cell } from 'recharts';
import { MarketApi } from '../api/market/service';
import { PriceHistoryPoint, YoYPricePoint, MarketArbitrage } from '../types';

const PriceAnalytics: React.FC = () => {
  const [commodity, setCommodity] = useState('Onion');
  const [variety, setVariety] = useState('Regular Hybrid');
  const [trendData, setTrendData] = useState<PriceHistoryPoint[]>([]);
  const [yoyData, setYoyData] = useState<YoYPricePoint[]>([]);
  const [arbitrage, setArbitrage] = useState<MarketArbitrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<'30d' | '90d'>('90d');

  useEffect(() => {
    loadAnalytics();
  }, [commodity, variety]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, trendData, yoyData, arbitrage]);

  const loadAnalytics = async () => {
    setLoading(true);
    const [trendRes, yoyRes, arbRes] = await Promise.all([
      MarketApi.getAdvancedTrendData(commodity, variety),
      MarketApi.getYoYSeasonality(commodity),
      MarketApi.getMarketArbitrage(commodity, 'Nashik')
    ]);

    if (trendRes.success) setTrendData(trendRes.data || []);
    if (yoyRes.success) setYoyData(yoyRes.data || []);
    if (arbRes.success) setArbitrage(arbRes.data || []);
    setLoading(false);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Price,SMA7,SMA30\n"
      + trendData.map(e => `${e.date},${e.modalPrice},${e.sma7},${e.sma30}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${commodity}_Price_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Running Regression Models...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Price Trend Intelligence</h1>
          <p className="text-slate-500 font-medium">Statistical analysis of Nashik regional markets</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <select 
             value={commodity} 
             onChange={(e) => setCommodity(e.target.value)}
             className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
           >
             <option>Onion</option>
             <option>Grape</option>
             <option>Tomato</option>
           </select>
           <button 
             onClick={handleExport}
             className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2"
           >
             <i data-lucide="download" className="w-4 h-4"></i>
             <span>Export CSV</span>
           </button>
        </div>
      </header>

      {/* Primary Trend Chart */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="flex justify-between items-start mb-12">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Price Volatility & SMAs</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">90-Day Trend with Moving Average Regression</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600">₹2,450</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Current Modal</div>
               </div>
               <div className={`p-3 rounded-2xl border ${trendData[trendData.length-1].modalPrice > trendData[trendData.length-1].sma30! ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                  <i data-lucide={trendData[trendData.length-1].modalPrice > trendData[trendData.length-1].sma30! ? 'trending-up' : 'trending-down'} className="w-6 h-6"></i>
               </div>
            </div>
         </div>
         <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={trendData}>
                  <defs>
                     <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
                  <Area type="monotone" name="Modal Price" dataKey="modalPrice" fill="url(#modalGradient)" stroke="#10b981" strokeWidth={4} />
                  <Line type="monotone" name="7d SMA" dataKey="sma7" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" name="30d SMA" dataKey="sma30" stroke="#f59e0b" strokeWidth={2} dot={false} />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* YoY Seasonality */}
         <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Year-over-Year Shift</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Comparison with Previous Cycle</p>
               </div>
               <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase">Seasonal Context</div>
            </div>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoyData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                     <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                     <Legend iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold'}} />
                     <Bar name="2024 (Current)" dataKey="currentYear" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                     <Bar name="2023 (Previous)" dataKey="previousYear" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start space-x-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <i data-lucide="lightbulb" className="w-5 h-5 text-amber-500"></i>
               </div>
               <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"Historically, {commodity} prices in Nashik peak during Oct-Nov due to post-monsoon supply gaps. Consider storage solutions for 15% higher returns."</p>
            </div>
         </div>

         {/* Mandi Arbitrage */}
         <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h3 className="text-xl font-black tracking-tight">Mandi Arbitrage Engine</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Best Selling Destination (Net After Transport)</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                     <i data-lucide="truck" className="w-5 h-5 text-emerald-400"></i>
                  </div>
               </div>
               <div className="space-y-4">
                  {arbitrage.sort((a, b) => b.netPrice - a.netPrice).map((dest, i) => (
                    <div key={i} className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                       <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                             {i + 1}
                          </div>
                          <div>
                             <div className="text-sm font-black">{dest.mandiName}</div>
                             <div className="text-[9px] text-slate-400 font-bold uppercase">{dest.distanceKm} km away</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className={`text-lg font-black ${i === 0 ? 'text-emerald-400' : 'text-white'}`}>₹{dest.netPrice}</div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase">Estimated Net</div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-5 bg-white text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
                  Book Transport Partner
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { label: 'Volatility Index', value: 'High', sub: 'Fluctuation > 12%', icon: 'activity', color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Demand Signal', value: 'Strong', sub: 'High Buyer Interest', icon: 'zap', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Best Time to Sell', value: '7 Days', sub: 'Projected Peak', icon: 'clock', color: 'text-blue-400', bg: 'bg-blue-500/10' }
         ].map((ins, i) => (
           <div key={i} className="bg-slate-950 p-8 rounded-[40px] text-white space-y-4">
              <div className={`w-12 h-12 ${ins.bg} ${ins.color} rounded-2xl flex items-center justify-center mb-6`}>
                 <i data-lucide={ins.icon} className="w-6 h-6"></i>
              </div>
              <div>
                 <div className="text-[10px] font-black uppercase opacity-40 mb-1">{ins.label}</div>
                 <div className="text-2xl font-black tracking-tight">{ins.value}</div>
                 <div className="text-[10px] font-bold text-slate-500 mt-2">{ins.sub}</div>
              </div>
           </div>
         ))}
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PriceAnalytics;