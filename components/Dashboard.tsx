import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketApi } from '../api/market/service';
import { CropsApi } from '../api/crops/service';
import { HealthApi } from '../api/health/service';

import { WeatherApi } from '../api/weather/service';
import { IrrigationApi } from '../api/irrigation/service';
import { Crop, MarketPrice, Advisory, WeatherData, IrrigationRecommendation, WeatherAlert, AppView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { i18n, Language } from '../utils/i18n';

interface Task {
  id: string;
  title: string;
  category: 'irrigation' | 'pest' | 'fertilizer' | 'general';
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardProps {
  setView?: (view: AppView) => void;
  user?: any | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, user: propUser }) => {
  const { user: ctxUser } = useAuth();
  const user = propUser ?? ctxUser;
  
  useEffect(() => {
    console.log('[Dashboard] mounted with user:', user);
    if (!user) {
      console.warn('[Dashboard] No user provided, checking localStorage...');
      const savedUser = localStorage.getItem('agri_smart_user');
      if (savedUser) {
        console.log('[Dashboard] Found user in localStorage:', JSON.parse(savedUser));
      }
    }
  }, [user]);
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);

  const [irrigationRecs, setIrrigationRecs] = useState<IrrigationRecommendation[]>([]);

  const [apiStatus, setApiStatus] = useState<'UP' | 'DOWN' | 'PENDING'>('PENDING');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  // Task state
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Check drip emitters in East Block', category: 'irrigation', isCompleted: false, priority: 'high' },
    { id: '2', title: 'Monitor for Downy Mildew spots', category: 'pest', isCompleted: false, priority: 'medium' },
    { id: '3', title: 'Prepare Potassium Schoenite spray', category: 'fertilizer', isCompleted: true, priority: 'high' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLang(e.detail);
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const win = window as any;
    if (win.lucide) win.lucide.createIcons();

    // Initialize location detection
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          loadData(loc);
        },
        (err) => {
          console.warn("Location denied:", err);
          loadData(); // Load default
        },
        { timeout: 10000 }
      );
    } else {
      loadData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async (coords?: { lat: number, lng: number }) => {
    try {
      const userId = user?.userId || 'u123';
      const location = user?.location.village || 'Nashik';

      const [marketRes, cropsRes, healthRes, weatherRes] = await Promise.all([
        MarketApi.getLatestPrices(),
        CropsApi.getByUser(userId),
        HealthApi.check(),
        WeatherApi.getForLocation(location, coords)
      ]);

      if (marketRes.success) setMarketPrices(marketRes.data || []);
      if (cropsRes.success) setCrops(cropsRes.data || []);
      if (weatherRes.success) {
        setLoadingWeather(false);
        const wData = weatherRes.data || null;
        setWeather(wData);
        if (wData) {
          if (cropsRes.success) {
            const irrRes = await IrrigationApi.getRecommendations(cropsRes.data!, wData);
            if (irrRes.success) setIrrigationRecs(irrRes.data || []);
          }
        }
      }
      setApiStatus(healthRes.success ? 'UP' : 'DOWN');
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setApiStatus('DOWN');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return i18n.translate('dashboard.goodMorning');
    if (hour < 17) return i18n.translate('dashboard.goodAfternoon');
    return i18n.translate('dashboard.goodEvening');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      category: 'general',
      isCompleted: false,
      priority: 'medium'
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const rainProbability = useMemo(() => Math.floor(Math.random() * 40), []); // Simulated for UI

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-7xl mx-auto">
      {/* Personalized Greeting & Status Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Farmer'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening on your farm.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-1.5 px-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Synced: {lastSync}</span>
        </div>
      </header>

      {/* Alerts Carousel / Banner */}
      {weather?.alerts && weather.alerts.length > 0 ? (
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {weather?.alerts.map(alert => (
            <div key={alert.id} className="min-w-[300px] md:min-w-[400px] bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start space-x-3 shrink-0 animate-slide-up">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <i data-lucide="zap" className="w-6 h-6"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight truncate">{alert.type.replace('_', ' ')}</h4>
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded">Critical</span>
                </div>
                <p className="text-xs text-rose-800 font-medium leading-relaxed">{alert.message}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">Action Now</button>
                  <button className="px-3 py-1.5 bg-white text-rose-500 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-200">Dismiss</button>
                </div>
              </div>
            </div>
          ))}

        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Weather & Quick Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Enhanced Weather Widget */}
          <div
            onClick={() => {
              if (setView) {
                setView(AppView.ENHANCED_WEATHER);
              }
            }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm group hover:border-emerald-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                  {loadingWeather ? (
                    <>
                      <span className="animate-pulse bg-slate-200 h-6 w-24 rounded"></span>
                      <span className="text-xs font-normal text-slate-400 ml-2 animate-pulse">Locating...</span>
                    </>
                  ) : (
                    <>
                      {weather?.locationName || 'Nashik'}
                      {userLocation && <i data-lucide="map-pin" className="w-3 h-3 ml-2 text-emerald-500"></i>}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{weather?.condition || 'Loading...'}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <i data-lucide={loadingWeather ? 'loader-2' : 'sun'} className={`w-5 h-5 ${loadingWeather ? 'animate-spin' : ''}`}></i>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-5xl font-bold text-slate-800 tracking-tighter">
                {weather?.temperature || '--'}°
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * rainProbability) / 100}
                    className="text-blue-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-blue-600">{rainProbability}%</span>
                  <span className="text-[7px] font-black text-slate-300 uppercase">Rain</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Humidity</div>
                <div className="text-sm font-bold text-slate-800">{weather?.humidity}%</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wind</div>
                <div className="text-sm font-bold text-slate-800">{weather?.windSpeed} km/h</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Harvesting', val: '12d', icon: 'scissors', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Soil Health', val: 'Optimum', icon: 'leaf', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Best Price', val: '₹2,450', icon: 'trending-up', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Community', val: '14 New', icon: 'users', color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-2 group-hover:rotate-6 transition-transform`}>
                  <i data-lucide={stat.icon} className="w-4 h-4"></i>
                </div>
                <div className="text-lg font-bold text-slate-800">{stat.val}</div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Tasks & AI Advice */}
        <div className="lg:col-span-5 space-y-8">
          {/* Task Manager */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{i18n.translate('dashboard.tasks')}</h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {tasks.filter(t => !t.isCompleted).length} Pending
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[350px]">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-all cursor-pointer border ${task.isCompleted ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <button className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'}`}>
                    <i data-lucide="check" className="w-4 h-4"></i>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold tracking-tight ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>{task.priority}</span>
                      <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{task.category}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <i data-lucide="check-circle-2" className="w-8 h-8"></i>
                  </div>
                  <p className="text-slate-400 font-medium">All tasks completed for today!</p>
                </div>
              )}
            </div>

            <form onSubmit={addTask} className="relative mt-auto">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Quick add a custom task..."
                className="w-full bg-slate-50 border border-slate-100 rounded-[15px] py-5 pl-8 pr-16 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 w-10 h-10 bg-emerald-600 text-white rounded-[15px] flex items-center justify-center shadow-lg shadow-emerald-100 active:scale-90 transition-transform"
              >
                <i data-lucide="plus" className="w-5 h-5"></i>
              </button>
            </form>
          </div>


        </div>

        {/* RIGHT COLUMN: Market & Inventory */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{i18n.translate('dashboard.marketPulse')}</h3>
              <i data-lucide="bar-chart-2" className="w-4 h-4 text-slate-400"></i>
            </div>
            <div className="space-y-3 flex-1">
              {marketPrices.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all group">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{item.cropType}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase tracking-tight">{item.mandiName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">₹{item.price.toFixed(0)}</div>
                    <div className={`text-[10px] font-bold flex items-center justify-end ${item.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <i data-lucide={item.change.startsWith('+') ? 'trending-up' : 'trending-down'} className="w-3 h-3 mr-1"></i>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md">
              Full Market View
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-bold tracking-tight flex items-center">
              <i data-lucide="database" className="w-4 h-4 mr-2 text-emerald-400"></i>
              {i18n.translate('dashboard.cropInventory')}
            </h3>
            <div className="space-y-6">
              {crops.map((crop) => (
                <div key={crop.cropId} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-400 group-hover:text-white transition-colors">{crop.cropType}</span>
                    <span className={`text-[10px] font-black ${crop.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{crop.healthScore}% Healthy</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${crop.healthScore > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${crop.healthScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Display Selected Crop Varieties */}
            {user?.farmDetails?.cropVarieties && user.farmDetails.cropVarieties.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-tight text-slate-400">Selected Varieties</h4>
                <div className="flex flex-wrap gap-2">
                  {user.farmDetails.cropVarieties.map((variety, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30"
                    >
                      {variety}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Forecast Modal */}
      {showWeatherModal && weather && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowWeatherModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[15px] p-12 shadow-2xl animate-scale-up overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">7-Day Climate Projection</h2>
              <button onClick={() => setShowWeatherModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-[15px] transition-all">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            <div className="space-y-4">
              {weather.forecast7Day.map((day, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[15px] border border-slate-100 group hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="text-sm font-black text-slate-900 min-w-[100px]">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}</div>
                    <div className="w-10 h-10 bg-white rounded-[15px] flex items-center justify-center shadow-sm text-amber-500">
                      <i data-lucide={day.condition.includes('Sunny') ? 'sun' : day.condition.includes('Rain') ? 'cloud-rain' : 'cloud'} className="w-5 h-5"></i>
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">{day.condition}</span>
                  </div>
                  <div className="text-lg font-black text-slate-900">{day.temp}°C</div>
                </div>
              ))}
            </div>
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
      `}</style>
    </div>
  );
};

export default Dashboard;