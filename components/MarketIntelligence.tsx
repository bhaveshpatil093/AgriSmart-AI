import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { IntelligenceApi } from '../api/market/intelligenceService';
import { MarketApi } from '../api/market/service';
import { MarketOpportunity, MarketNews, SaleRecord, SellRecommendation, PriceHistoryPoint, MarketAlert, Market } from '../types';

const MarketIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'markets' | 'advisor' | 'alerts' | 'records'>('markets');
  const [crop, setCrop] = useState('Onion');
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [recommendation, setRecommendation] = useState<SellRecommendation | null>(null);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [trends, setTrends] = useState<PriceHistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MarketOpportunity; direction: 'asc' | 'desc' } | null>(null);
  
  // Modal states
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [crop]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, activeTab, opportunities, news, recommendation, sales, showMarketModal, showAddAlert]);

  const loadDashboardData = async () => {
    setLoading(true);
    const [oppRes, newsRes, recRes, salesRes, trendRes, alertsRes] = await Promise.all([
      IntelligenceApi.getTodaysMarkets(crop),
      IntelligenceApi.getMarketNews(),
      IntelligenceApi.getSellRecommendation(crop, 50), // Mock 50 quintals
      IntelligenceApi.getMySalesHistory('u123'),
      MarketApi.getHistoricalPrices(crop),
      IntelligenceApi.getAlerts('u123')
    ]);

    if (oppRes.success) setOpportunities(oppRes.data || []);
    if (newsRes.success) setNews(newsRes.data || []);
    if (recRes.success) setRecommendation(recRes.data || null);
    if (salesRes.success) setSales(salesRes.data || []);
    if (trendRes.success) setTrends(trendRes.data || []);
    if (alertsRes.success) setAlerts(alertsRes.data || []);
    
    setLoading(false);
  };

  const filteredOpportunities = useMemo(() => {
    let items = [...opportunities].filter(o => 
      o.mandiName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [opportunities, searchTerm, sortConfig]);

  const requestSort = (key: keyof MarketOpportunity) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Market,Price,Change%,Distance,Volume\n"
      + opportunities.map(o => `${o.mandiName},${o.currentPrice},${o.changePercent}%,${o.distanceKm}km,${o.arrivalVolume}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  };

  const openMarketDetails = async (id: string) => {
    const res = await IntelligenceApi.getMarketDetails(id);
    if (res.success) {
      setSelectedMarket(res.data!);
      setShowMarketModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Computing Market Probabilities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Market Intelligence</h1>
          <p className="text-slate-500 font-medium">Real-time commodity data for precision selling</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <select 
             value={crop} 
             onChange={(e) => setCrop(e.target.value)}
             className="px-6 py-3 bg-white border border-slate-200 rounded-[15px] text-xs font-black uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
           >
             <option>Onion</option>
             <option>Grape</option>
             <option>Tomato</option>
           </select>
           <div className="flex bg-slate-100 p-1 rounded-[15px] border border-slate-200 overflow-x-auto no-scrollbar">
              {['markets', 'advisor', 'alerts', 'records'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`px-6 py-2 rounded-[15px] text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* Smart Sell Advisor prominent at top when relevant */}
      {activeTab === 'markets' && recommendation && (
        <div className="bg-emerald-600 rounded-[15px] p-10 text-white relative overflow-hidden shadow-2xl animate-slide-up group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="shrink-0 flex flex-col items-center">
                 <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[15px] flex items-center justify-center mb-4 border border-white/20">
                    <i data-lucide="trending-up" className="w-12 h-12 text-white"></i>
                 </div>
                 <div className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Confidence: 92%</div>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                 <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4">
                    <h2 className="text-4xl font-black tracking-tighter leading-none">Recommendation: {recommendation.action}</h2>
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-[15px] text-[10px] font-black uppercase tracking-widest border border-white/20">Market Insight</span>
                 </div>
                 <p className="text-emerald-50 font-medium leading-relaxed max-w-3xl italic">"{recommendation.reasoning}"</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    <div className="p-4 bg-white/10 rounded-[15px] border border-white/10">
                       <div className="text-[10px] font-black uppercase opacity-60 mb-1">Expected Upside</div>
                       <div className="text-2xl font-black text-emerald-300">+{recommendation.projectedPriceChange}%</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-[15px] border border-white/10">
                       <div className="text-[10px] font-black uppercase opacity-60 mb-1">Risk Level</div>
                       <div className="text-2xl font-black text-white">{recommendation.riskLevel}</div>
                    </div>
                 </div>
              </div>
              <button className="px-10 py-5 bg-white text-emerald-700 rounded-[15px] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
                 Schedule Sale
              </button>
           </div>
        </div>
      )}

      {activeTab === 'markets' && (
        <div className="space-y-8 animate-slide-up">
           <div className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="relative w-full md:w-96">
                    <i data-lucide="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="Search Mandis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[15px] py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={handleExport}
                      className="px-6 py-3 bg-slate-900 text-white rounded-[15px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                    >
                       <i data-lucide="download" className="w-4 h-4"></i>
                       <span>Export List</span>
                    </button>
                 </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('mandiName')}>
                             Mandi Name {sortConfig?.key === 'mandiName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('currentPrice')}>
                             Current Price {sortConfig?.key === 'currentPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('changePercent')}>
                             24h Change {sortConfig?.key === 'changePercent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('distanceKm')}>
                             Distance {sortConfig?.key === 'distanceKm' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredOpportunities.map((opp) => (
                         <tr key={opp.mandiId} className="group hover:bg-emerald-50/30 transition-colors">
                            <td className="px-6 py-6">
                               <div className="font-black text-slate-900">{opp.mandiName}</div>
                               <div className="text-[10px] font-bold text-slate-400">{opp.commodity} Hub</div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="text-lg font-black text-slate-900">₹{opp.currentPrice}</div>
                               <div className="text-[9px] text-slate-400 font-bold uppercase">Per Quintal</div>
                            </td>
                            <td className="px-6 py-6">
                               <div className={`flex items-center text-sm font-black ${opp.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  <i data-lucide={opp.changePercent >= 0 ? 'trending-up' : 'trending-down'} className="w-4 h-4 mr-2"></i>
                                  {opp.changePercent}%
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="text-sm font-bold text-slate-600">{opp.distanceKm} KM</div>
                               <div className="text-[9px] text-slate-400 uppercase">Est. Transport ₹120</div>
                            </td>
                            <td className="px-6 py-6">
                               {opp.isBestPrice && (
                                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-[15px] shadow-sm">Best Net Rate</span>
                               )}
                            </td>
                            <td className="px-6 py-6 text-right">
                               <button 
                                 onClick={() => openMarketDetails(opp.mandiId)}
                                 className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white rounded-[15px] transition-all"
                               >
                                  <i data-lucide="eye" className="w-5 h-5"></i>
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                 {filteredOpportunities.map((opp) => (
                   <div key={opp.mandiId} className="p-6 bg-slate-50 rounded-[15px] border border-slate-100 space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="font-black text-slate-900">{opp.mandiName}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">{opp.distanceKm} KM Away</div>
                         </div>
                         <div className="text-right">
                            <div className="text-xl font-black text-slate-900">₹{opp.currentPrice}</div>
                            <div className={`text-[10px] font-black ${opp.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {opp.changePercent}% 24h
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => openMarketDetails(opp.mandiId)}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-[15px]"
                      >
                         View Details
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'advisor' && (
        <div className="space-y-8 animate-slide-up">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-12 rounded-[15px] border border-slate-200 shadow-sm space-y-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Price Forecasting Tool</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Multi-modal AI Simulation</p>
                 </div>
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={trends}>
                          <defs>
                             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" hide />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} unit="₹" />
                          <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                          <Area type="monotone" name="Historical" dataKey="modalPrice" stroke="#2563eb" strokeWidth={4} fill="url(#trendGradient)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-[15px] border border-slate-100">
                       <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Min. Target</div>
                       <div className="text-xl font-black text-slate-900">₹2,100</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-[15px] border border-emerald-100">
                       <div className="text-[9px] font-black text-emerald-600 uppercase mb-1">Current</div>
                       <div className="text-xl font-black text-emerald-700">₹2,450</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-[15px] border border-slate-100">
                       <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Max. Target</div>
                       <div className="text-xl font-black text-slate-900">₹2,900</div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-slate-950 p-10 rounded-[15px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-xl font-black tracking-tight mb-8">Profit Projection Calculator</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Expected Harvest (Quintals)</label>
                          <input type="number" defaultValue="45" className="w-full bg-white/5 border border-white/10 rounded-[15px] p-4 font-black text-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Price (₹)</label>
                          <input type="number" defaultValue="2800" className="w-full bg-white/5 border border-white/10 rounded-[15px] p-4 font-black text-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                       </div>
                       <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                          <div>
                             <div className="text-[10px] font-black text-slate-500 uppercase">Estimated Revenue</div>
                             <div className="text-3xl font-black text-emerald-400">₹1,26,000</div>
                          </div>
                          <button className="p-4 bg-white/10 rounded-[15px] hover:bg-white/20 transition-all">
                             <i data-lucide="refresh-cw" className="w-6 h-6"></i>
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="p-8 bg-blue-50 rounded-[15px] border border-blue-100 flex items-start space-x-6">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-[15px] flex items-center justify-center shrink-0">
                       <i data-lucide="info" className="w-6 h-6"></i>
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Market Accuracy History</h4>
                       <p className="text-xs text-blue-800/70 mt-1 leading-relaxed font-medium">In the last 6 months, our "Wait" recommendations for Onions resulted in an average of +₹340 higher realization per quintal.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-8 animate-slide-up">
           <div className="flex justify-between items-center px-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Active Price Thresholds</h2>
              <button 
                onClick={() => setShowAddAlert(true)}
                className="px-8 py-3 bg-emerald-600 text-white rounded-[15px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center gap-2"
              >
                 <i data-lucide="plus-circle" className="w-4 h-4"></i>
                 <span>Set New Alert</span>
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-8 rounded-[15px] border bg-white shadow-sm transition-all group ${!alert.isActive ? 'opacity-50' : 'hover:border-emerald-300'}`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-[15px] flex items-center justify-center text-slate-400">
                            <i data-lucide={alert.cropType === 'Onion' ? 'sprout' : 'grape'} className="w-5 h-5"></i>
                         </div>
                         <h3 className="font-black text-slate-900">{alert.cropType}</h3>
                      </div>
                      <button className={`w-12 h-6 rounded-full transition-all relative ${alert.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alert.isActive ? 'left-7' : 'left-1'}`}></div>
                      </button>
                   </div>
                   <div className="space-y-1 mb-8">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Alert Condition</div>
                      <div className="text-xl font-black text-slate-900">Notify if Price is {alert.condition} ₹{alert.thresholdPrice}</div>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-6">
                      <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                      <button className="text-rose-500 hover:text-rose-700">Delete Alert</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default MarketIntelligence;