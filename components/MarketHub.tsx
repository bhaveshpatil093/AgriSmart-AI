import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketApi } from '../client_api/market/service';
import { MandiPrice, AuctionFeed, UserPriceReport } from '../types';

const MarketHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'live' | 'trends' | 'report'>('daily');
  const [commodity, setCommodity] = useState('Onion');
  const [mandi, setMandi] = useState('Lasalgaon');
  const [rates, setRates] = useState<MandiPrice[]>([]);
  const [auctions, setAuctions] = useState<AuctionFeed[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({ price: '', variety: 'Regular' });

  useEffect(() => {
    loadData();
  }, [commodity, mandi, activeTab]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, rates, auctions, activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'daily') {
      const res = await MarketApi.getMandiRates(mandi, commodity);
      if (res.success) setRates(res.data || []);
    } else if (activeTab === 'live') {
      const res = await MarketApi.getLiveAuctions(mandi);
      if (res.success) setAuctions(res.data || []);
    } else if (activeTab === 'trends') {
      const res = await MarketApi.getHistoricalPrices(commodity);
      if (res.success) setHistory(res.data || []);
    }
    setLoading(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UserPriceReport = {
      userId: 'u123',
      mandiName: mandi,
      commodity,
      price: parseFloat(report.price),
      variety: report.variety,
      timestamp: new Date().toISOString()
    };
    await MarketApi.reportPrice(payload);
    alert("Report submitted for validation. Thank you!");
    setReport({ price: '', variety: 'Regular' });
  };

  const mandis = ['Lasalgaon', 'Pimpalgaon', 'Nashik', 'Niphad', 'Yeola', 'Dindori'];
  const commodities = ['Onion', 'Grape', 'Tomato', 'Wheat', 'Maize'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Intelligence Hub</h1>
          <p className="text-slate-500 font-medium">Aggregated Mandi rates from Agmarknet & eNAM</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crop</label>
              <select 
                value={commodity} 
                onChange={(e) => setCommodity(e.target.value)}
                className="block w-40 px-4 py-2 bg-white border border-slate-200 rounded-[15px] text-xs font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {commodities.map(c => <option key={c}>{c}</option>)}
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mandi</label>
              <select 
                value={mandi} 
                onChange={(e) => setMandi(e.target.value)}
                className="block w-40 px-4 py-2 bg-white border border-slate-200 rounded-[15px] text-xs font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {mandis.map(m => <option key={m}>{m}</option>)}
              </select>
           </div>
        </div>
      </header>

      <div className="flex bg-slate-100 p-1 rounded-[15px] border border-slate-200 w-fit overflow-x-auto no-scrollbar">
         {[
           { id: 'daily', label: 'Daily Rates', icon: 'list' },
           { id: 'live', label: 'eNAM Auction', icon: 'zap' },
           { id: 'trends', label: 'Price Trends', icon: 'trending-up' },
           { id: 'report', label: 'Report Price', icon: 'plus-circle' }
         ].map((t) => (
           <button 
             key={t.id}
             onClick={() => setActiveTab(t.id as any)}
             className={`flex items-center space-x-2 shrink-0 px-6 py-2.5 rounded-[15px] text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
           >
             <i data-lucide={t.icon} className="w-4 h-4"></i>
             <span>{t.label}</span>
           </button>
         ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[15px] border border-slate-100">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
           <p className="text-slate-500 font-medium">Fetching regional pricing data...</p>
        </div>
      ) : (
        <div className="animate-slide-up">
           {activeTab === 'daily' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rates.map(rate => (
                  <div key={rate.id} className="bg-white p-8 rounded-[15px] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden group hover:border-emerald-300 transition-all">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{rate.variety}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                             <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-[15px] text-slate-500">Grade {rate.grade}</span>
                             <span className="text-[10px] font-bold text-slate-400">{rate.source}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-3xl font-black text-emerald-600">₹{rate.modalPrice}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Modal Price</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                       <div className="p-3 bg-slate-50 rounded-[15px]">
                          <div className="text-[9px] text-slate-400 font-black uppercase mb-1">Min Price</div>
                          <div className="text-sm font-bold text-slate-700">₹{rate.minPrice}</div>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-[15px]">
                          <div className="text-[9px] text-slate-400 font-black uppercase mb-1">Max Price</div>
                          <div className="text-sm font-bold text-slate-700">₹{rate.maxPrice}</div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                       <span>Arrival: {rate.arrivalQuantity} {rate.unit}s</span>
                       <span className="flex items-center">
                          <i data-lucide="clock" className="w-3 h-3 mr-1"></i> Updated 2h ago
                       </span>
                    </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'live' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">eNAM Real-time Auctions</h2>
                   <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live Auction Feed</span>
                   </div>
                </div>
                <div className="bg-white rounded-[15px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lot ID / Item</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Bid</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidder Interest</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ends In</th>
                            <th className="px-10 py-6"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {auctions.map(auc => (
                           <tr key={auc.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-10 py-8">
                                 <div className="text-sm font-black text-slate-900">{auc.lotNumber}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">{auc.commodity}</div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="text-lg font-black text-emerald-600">₹{auc.currentBid}</div>
                                 <div className="text-[9px] text-emerald-400 font-bold uppercase">Per Quintal</div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center space-x-4">
                                    <div className="flex -space-x-2">
                                       {Array.from({ length: 3 }).map((_, i) => (
                                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                                       ))}
                                       <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-50 text-[10px] font-bold text-emerald-600 flex items-center justify-center">+{auc.biddersCount - 3}</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Bidders</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="text-sm font-black text-slate-900">{auc.endTime}</div>
                                 <div className="text-[9px] text-slate-400 font-bold uppercase">Auction Close</div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button className="px-6 py-2.5 bg-slate-950 text-white rounded-[15px] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">Watch Bid</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'trends' && (
             <div className="space-y-8">
                <div className="bg-white p-12 rounded-[15px] border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-12">
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight">Regional Price Volatility</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">30-Day Modal Rate Trend: {commodity}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-[15px] border border-emerald-100 text-center">
                         <div className="text-[10px] font-black text-emerald-800 uppercase">Trend Index</div>
                         <div className="text-xl font-black text-emerald-600">+12.4%</div>
                      </div>
                   </div>
                   <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={history}>
                            <defs>
                               <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                            <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="modalPrice" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'report' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[15px] flex items-center justify-center">
                      <i data-lucide="mic" className="w-10 h-10"></i>
                   </div>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Voice-First <br /> Mandi Reports</h2>
                   <p className="text-xl text-slate-500 font-medium leading-relaxed">Report your actual sale price to help verify official data. Verified contributors get priority access to advanced harvest timing models.</p>
                   <div className="flex items-center space-x-4">
                      <div className="p-4 bg-white border border-slate-100 rounded-[15px] shadow-sm">
                         <div className="text-2xl font-black text-slate-900">450+</div>
                         <div className="text-[10px] text-slate-400 font-black uppercase">Reports Today</div>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-[15px] shadow-sm">
                         <div className="text-2xl font-black text-emerald-600">Top 5%</div>
                         <div className="text-[10px] text-slate-400 font-black uppercase">Contributor Rank</div>
                      </div>
                   </div>
                </div>

                <form onSubmit={handleReportSubmit} className="bg-white p-12 rounded-[15px] border border-slate-200 shadow-2xl space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Rate (₹ per Quintal)</label>
                      <input 
                        required
                        type="number" 
                        value={report.price}
                        onChange={(e) => setReport({...report, price: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-black text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="e.g. 2400"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crop Variety</label>
                      <select 
                        value={report.variety}
                        onChange={(e) => setReport({...report, variety: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                         <option>Regular Hybrid</option>
                         <option>Export Quality (AAA)</option>
                         <option>Small Size (Golta)</option>
                         <option>Double Patti</option>
                      </select>
                   </div>
                   <button 
                     type="submit"
                     className="w-full py-6 bg-slate-950 text-white rounded-[15px] font-black text-lg hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3"
                   >
                      <i data-lucide="check-circle" className="w-6 h-6"></i>
                      <span>Verify & Submit</span>
                   </button>
                </form>
             </div>
           )}
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MarketHub;