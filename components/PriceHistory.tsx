import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { PriceHistoryApi } from '../api/market/priceHistoryService';
import { HistoricalPriceData, PriceHistoryFilters } from '../types';
import { i18n } from '../utils/i18n';

const PriceHistory: React.FC = () => {
  const [data, setData] = useState<HistoricalPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'seasonal'>('monthly');
  const [filters, setFilters] = useState<PriceHistoryFilters>({
    cropType: 'All',
    marketLocation: 'All',
    startDate: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [loading, chartType, viewMode]);

  const loadData = async () => {
    setLoading(true);
    const result = await PriceHistoryApi.getHistoricalPrices(filters);
    if (result.success && result.data) {
      setData(result.data);
    }
    setLoading(false);
  };

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data.length) return [];

    if (viewMode === 'monthly') {
      const monthly = data.reduce((acc, item) => {
        const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { month, prices: [], count: 0 };
        }
        acc[month].prices.push(item.price);
        acc[month].count++;
        return acc;
      }, {} as Record<string, { month: string; prices: number[]; count: number }>);

      return Object.values(monthly).map(({ month, prices }) => ({
        period: month,
        average: prices.reduce((a, b) => a + b, 0) / prices.length,
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: prices.length
      }));
    }

    if (viewMode === 'yearly') {
      const yearly = data.reduce((acc, item) => {
        const year = new Date(item.date).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = { year, prices: [] };
        }
        acc[year].prices.push(item.price);
        return acc;
      }, {} as Record<string, { year: string; prices: number[] }>);

      return Object.values(yearly).map(({ year, prices }) => ({
        period: year,
        average: prices.reduce((a, b) => a + b, 0) / prices.length,
        min: Math.min(...prices),
        max: Math.max(...prices),
        yoy: 0 // Calculate YoY later
      }));
    }

    // Seasonal
    const seasonal = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const month = date.getMonth();
      let season = 'Winter';
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Monsoon';
      
      if (!acc[season]) {
        acc[season] = { season, prices: [] };
      }
      acc[season].prices.push(item.price);
      return acc;
    }, {} as Record<string, { season: string; prices: number[] }>);

    return Object.values(seasonal).map(({ season, prices }) => ({
      period: season,
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices)
    }));
  }, [data, viewMode]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) return null;
    const prices = data.map(d => d.price);
    return {
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      current: prices[prices.length - 1],
      change: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
    };
  }, [data]);

  // Find best selling periods
  const bestPeriods = useMemo(() => {
    if (!chartData.length) return [];
    const sorted = [...chartData].sort((a, b) => b.average - a.average);
    return sorted.slice(0, 3);
  }, [chartData]);

  const handleExport = () => {
    const csv = [
      ['Date', 'Crop Type', 'Market', 'Price (₹/Quintal)', 'Min Price', 'Max Price'].join(','),
      ...data.map(d => [
        d.date,
        d.cropType,
        d.marketLocation,
        d.price,
        d.minPrice || d.price,
        d.maxPrice || d.price
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-history-${filters.cropType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CROP_TYPES = ['All', 'Tomato', 'Onion', 'Grape'];
  const MARKETS = ['All', 'Lasalgaon', 'Pimpalgaon', 'Nashik', 'Dindori'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Historical Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Price History Analytics</h1>
          <p className="text-slate-500 font-medium mt-2">Historical price trends and seasonal patterns</p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg flex items-center space-x-2"
        >
          <i data-lucide="download" className="w-4 h-4"></i>
          <span>Export CSV</span>
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Crop Type</label>
            <select
              value={filters.cropType}
              onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Market Location</label>
            <select
              value={filters.marketLocation}
              onChange={(e) => setFilters({ ...filters, marketLocation: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Average Price</div>
            <div className="text-2xl font-black text-slate-900">₹{stats.average.toFixed(0)}</div>
            <div className="text-xs text-slate-500 font-medium">per quintal</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Minimum</div>
            <div className="text-2xl font-black text-red-600">₹{stats.min.toFixed(0)}</div>
            <div className="text-xs text-slate-500 font-medium">lowest recorded</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Maximum</div>
            <div className="text-2xl font-black text-emerald-600">₹{stats.max.toFixed(0)}</div>
            <div className="text-xs text-slate-500 font-medium">peak price</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Current</div>
            <div className="text-2xl font-black text-slate-900">₹{stats.current.toFixed(0)}</div>
            <div className="text-xs text-slate-500 font-medium">latest price</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Change</div>
            <div className={`text-2xl font-black ${stats.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 font-medium">over period</div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-50 p-1 rounded-xl">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              chartType === 'line' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              chartType === 'bar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Bar Chart
          </button>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'monthly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'yearly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setViewMode('seasonal')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'seasonal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Seasonal
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">
          Price Trends - {viewMode === 'monthly' ? 'Monthly' : viewMode === 'yearly' ? 'Year-over-Year' : 'Seasonal'} View
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value: number) => `₹${value.toFixed(0)}`}
              />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={3} name="Average Price" dot={{ fill: '#10b981', r: 4 }} />
              <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Minimum" />
              <Line type="monotone" dataKey="max" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Maximum" />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value: number) => `₹${value.toFixed(0)}`}
              />
              <Legend />
              <Bar dataKey="average" fill="#10b981" name="Average Price" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Best Selling Periods */}
      {bestPeriods.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl border border-emerald-200">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
            <i data-lucide="trending-up" className="w-6 h-6 text-emerald-600"></i>
            <span>Best Selling Periods</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestPeriods.map((period, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-slate-600 uppercase tracking-wider">{period.period}</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-600 mb-1">₹{period.average.toFixed(0)}</div>
                <div className="text-xs text-slate-500 font-medium">Average price per quintal</div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-500">Range:</span>
                  <span className="font-bold text-slate-700">₹{period.min.toFixed(0)} - ₹{period.max.toFixed(0)}</span>
                </div>
              </div>
            ))}
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

export default PriceHistory;
