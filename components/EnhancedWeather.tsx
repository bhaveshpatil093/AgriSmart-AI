import React, { useState, useEffect } from 'react';
import { WeatherData, WeatherAlert, AgriculturalMetrics } from '../types';
import { WeatherApi } from '../client_api/weather/service';
import { useAuth } from '../contexts/AuthContext';
import { i18n } from '../utils/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EnhancedWeatherProps {
  location?: string;
  coords?: { lat: number; lng: number };
}

const EnhancedWeather: React.FC<EnhancedWeatherProps> = ({ location, coords }) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | '7day' | 'alerts' | 'metrics' | 'history'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  useEffect(() => {
    loadWeather();
  }, [location, coords]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [loading, activeTab, weather]);

  const loadWeather = async () => {
    setLoading(true);
    const loc = location || user?.location.village || 'Nashik';
    const result = await WeatherApi.getForLocation(loc, coords);
    if (result.success && result.data) {
      setWeather(result.data);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'bg-red-50 border-red-200 text-red-700';
      case 'orange': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'green': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'red': return 'alert-triangle';
      case 'orange': return 'alert-circle';
      case 'yellow': return 'info';
      case 'green': return 'check-circle';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Weather Data...</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-medium">Unable to load weather data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Enhanced Weather Forecast</h1>
          <p className="text-slate-500 font-medium mt-2">{weather.locationName}</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className={`w-3 h-3 rounded-full ${
            weather.alerts.some(a => a.severity === 'red') ? 'bg-red-500' :
            weather.alerts.some(a => a.severity === 'orange') ? 'bg-orange-500' :
            weather.alerts.some(a => a.severity === 'yellow') ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}></div>
          <span className="text-xs font-bold text-slate-600">
            {weather.alerts.some(a => a.severity === 'red') ? 'Critical Alert' :
             weather.alerts.some(a => a.severity === 'orange') ? 'Warning Active' :
             weather.alerts.some(a => a.severity === 'yellow') ? 'Advisory' : 'All Clear'}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: 'sun' },
          { id: 'hourly', label: 'Hourly', icon: 'clock' },
          { id: '7day', label: '7-Day', icon: 'calendar' },
          { id: 'alerts', label: 'Alerts', icon: 'bell', badge: weather.alerts.filter(a => a.severity === 'red' || a.severity === 'orange').length },
          { id: 'metrics', label: 'Agri Metrics', icon: 'leaf' },
          { id: 'history', label: 'History', icon: 'trending-up' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <i data-lucide={tab.icon} className="w-4 h-4"></i>
            <span>{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-black">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Conditions */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-6xl font-black text-slate-900 mb-2">{Math.round(weather.temperature)}°</div>
                <div className="text-sm font-bold text-slate-600">{weather.condition}</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Humidity</span>
                  <span className="text-lg font-black text-slate-900">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Wind Speed</span>
                  <span className="text-lg font-black text-slate-900">{weather.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Rainfall</span>
                  <span className="text-lg font-black text-slate-900">{weather.rainfall} mm</span>
                </div>
              </div>
              <div className="space-y-4">
                {weather.agriculturalMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Soil Moisture</span>
                      <span className="text-lg font-black text-emerald-600">{weather.agriculturalMetrics.soilMoistureProbability}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">UV Index</span>
                      <span className="text-lg font-black text-amber-600">{weather.agriculturalMetrics.uvIndex}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Field Operations</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        weather.agriculturalMetrics.fieldOperationSuitability === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                        weather.agriculturalMetrics.fieldOperationSuitability === 'good' ? 'bg-blue-100 text-blue-700' :
                        weather.agriculturalMetrics.fieldOperationSuitability === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {weather.agriculturalMetrics.fieldOperationSuitability.toUpperCase()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {weather.alerts.filter(a => a.severity === 'red' || a.severity === 'orange').length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">Critical Weather Alerts</h3>
              {weather.alerts
                .filter(a => a.severity === 'red' || a.severity === 'orange')
                .map(alert => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-2xl border-2 ${getSeverityColor(alert.severity)} cursor-pointer hover:scale-[1.01] transition-all`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                          <i data-lucide={getSeverityIcon(alert.severity)} className="w-6 h-6"></i>
                        </div>
                        <div>
                          <div className="text-lg font-black mb-1">{alert.type.replace('_', ' ').toUpperCase()}</div>
                          <p className="text-sm font-medium mb-2">{alert.message}</p>
                          {alert.actionable && (
                            <div className="text-sm font-bold bg-white/50 px-3 py-2 rounded-lg mt-2">
                              💡 {alert.actionable}
                            </div>
                          )}
                        </div>
                      </div>
                      <i data-lucide="chevron-right" className="w-5 h-5"></i>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Weather Recommendations */}
          {weather.agriculturalMetrics && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Farming Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Spraying</div>
                  <div className={`text-lg font-black ${
                    weather.agriculturalMetrics.sprayingRecommendation === 'recommended' ? 'text-emerald-600' :
                    weather.agriculturalMetrics.sprayingRecommendation === 'caution' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {weather.agriculturalMetrics.sprayingRecommendation === 'recommended' ? '✅ Recommended' :
                     weather.agriculturalMetrics.sprayingRecommendation === 'caution' ? '⚠️ Use Caution' : '❌ Not Recommended'}
                  </div>
                  <div className="text-sm text-slate-600 font-medium mt-1">
                    Wind: {weather.agriculturalMetrics.windSpeedForSpraying}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Irrigation</div>
                  <div className={`text-lg font-black ${
                    weather.agriculturalMetrics.irrigationRecommendation === 'increase' ? 'text-blue-600' :
                    weather.agriculturalMetrics.irrigationRecommendation === 'delay' ? 'text-orange-600' :
                    weather.agriculturalMetrics.irrigationRecommendation === 'decrease' ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    {weather.agriculturalMetrics.irrigationRecommendation === 'increase' ? '⬆️ Increase' :
                     weather.agriculturalMetrics.irrigationRecommendation === 'delay' ? '⏸️ Delay' :
                     weather.agriculturalMetrics.irrigationRecommendation === 'decrease' ? '⬇️ Decrease' : '✅ Proceed'}
                  </div>
                  <div className="text-sm text-slate-600 font-medium mt-1">
                    Soil Moisture: {weather.agriculturalMetrics.soilMoistureProbability}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hourly Tab */}
      {activeTab === 'hourly' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">24-Hour Hourly Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weather.hourlyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value: number) => `${value}°C`}
              />
              <Line type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} name="Temperature" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-x-auto">
            {weather.hourlyForecast.slice(0, 12).map((hour, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl text-center min-w-[100px]">
                <div className="text-xs font-bold text-slate-500 mb-2">{hour.time}</div>
                <div className="text-lg font-black text-slate-900 mb-1">{Math.round(hour.temp)}°</div>
                <div className="text-xs text-slate-600 font-medium">{hour.condition}</div>
                {hour.rainfall > 0 && (
                  <div className="text-xs text-blue-600 font-bold mt-1">💧 {hour.rainfall}mm</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Tab */}
      {activeTab === '7day' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">7-Day Forecast</h3>
          <div className="space-y-3">
            {weather.forecast7Day.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <div className="flex items-center space-x-6 flex-1">
                  <div className="text-sm font-black text-slate-900 min-w-[120px]">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-500">
                    <i data-lucide={day.condition.includes('Sunny') || day.condition.includes('Clear') ? 'sun' : 
                                    day.condition.includes('Rain') ? 'cloud-rain' : 'cloud'} className="w-6 h-6"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-600">{day.condition}</span>
                </div>
                <div className="flex items-center space-x-6">
                  {day.rainfall && day.rainfall > 0 && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <i data-lucide="droplet" className="w-4 h-4"></i>
                      <span className="text-sm font-bold">{day.rainfall.toFixed(1)}mm</span>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">
                      {day.maxTemp ? `${Math.round(day.maxTemp)}°` : `${day.temp}°`} / {day.minTemp ? `${Math.round(day.minTemp)}°` : `${day.temp - 5}°`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {weather.alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border-2 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                  <i data-lucide={getSeverityIcon(alert.severity)} className="w-6 h-6"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-black">{alert.type.replace('_', ' ').toUpperCase()}</div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-3">{alert.message}</p>
                  {alert.actionable && (
                    <div className="bg-white/50 px-4 py-3 rounded-xl">
                      <div className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Recommended Action</div>
                      <div className="text-sm font-bold">{alert.actionable}</div>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-slate-500 font-medium">
                    Valid until: {new Date(alert.endTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agricultural Metrics Tab */}
      {activeTab === 'metrics' && weather.agriculturalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Soil & Moisture</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Soil Moisture Probability</span>
                  <span className="text-2xl font-black text-emerald-600">{weather.agriculturalMetrics.soilMoistureProbability}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${weather.agriculturalMetrics.soilMoistureProbability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Spraying Conditions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Wind Speed</div>
                <div className={`text-lg font-black ${
                  weather.agriculturalMetrics.windSpeedForSpraying === 'optimal' ? 'text-emerald-600' :
                  weather.agriculturalMetrics.windSpeedForSpraying === 'moderate' ? 'text-yellow-600' :
                  weather.agriculturalMetrics.windSpeedForSpraying === 'high' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {weather.agriculturalMetrics.windSpeedForSpraying.toUpperCase()}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Recommendation</div>
                <div className={`text-lg font-black ${
                  weather.agriculturalMetrics.sprayingRecommendation === 'recommended' ? 'text-emerald-600' :
                  weather.agriculturalMetrics.sprayingRecommendation === 'caution' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {weather.agriculturalMetrics.sprayingRecommendation === 'recommended' ? '✅ Recommended' :
                   weather.agriculturalMetrics.sprayingRecommendation === 'caution' ? '⚠️ Caution' : '❌ Not Recommended'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">UV Index</h3>
            <div className="text-center">
              <div className="text-5xl font-black text-amber-600 mb-2">{weather.agriculturalMetrics.uvIndex}</div>
              <div className="text-sm font-medium text-slate-600">
                {weather.agriculturalMetrics.uvIndex < 3 ? 'Low' :
                 weather.agriculturalMetrics.uvIndex < 6 ? 'Moderate' :
                 weather.agriculturalMetrics.uvIndex < 8 ? 'High' : 'Very High'}
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Field Operations</h3>
            <div className="text-center">
              <div className={`text-3xl font-black mb-2 ${
                weather.agriculturalMetrics.fieldOperationSuitability === 'excellent' ? 'text-emerald-600' :
                weather.agriculturalMetrics.fieldOperationSuitability === 'good' ? 'text-blue-600' :
                weather.agriculturalMetrics.fieldOperationSuitability === 'moderate' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {weather.agriculturalMetrics.fieldOperationSuitability.toUpperCase()}
              </div>
              <div className="text-sm font-medium text-slate-600">
                Conditions are {weather.agriculturalMetrics.fieldOperationSuitability} for field work
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Comparison Tab */}
      {activeTab === 'history' && weather.historicalComparison && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Historical Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Temperature</div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {weather.historicalComparison.deviation.temp > 0 ? '+' : ''}
                {weather.historicalComparison.deviation.temp.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-600 font-medium">
                vs. Same period last year
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Rainfall</div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {weather.historicalComparison.deviation.rainfall > 0 ? '+' : ''}
                {weather.historicalComparison.deviation.rainfall.toFixed(1)}mm
              </div>
              <div className="text-sm text-slate-600 font-medium">
                vs. Same period last year
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Last Year Average</div>
              <div className="text-lg font-black text-slate-900 mb-1">
                {weather.historicalComparison.samePeriodLastYear.avgTemp.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {weather.historicalComparison.samePeriodLastYear.totalRainfall.toFixed(1)}mm rainfall
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

export default EnhancedWeather;
