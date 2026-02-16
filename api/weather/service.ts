
import { api } from '../../lib/apiClient';
import { WeatherData, ApiResponse, WeatherAlert, HourlyForecast, AIWeatherAdvisory } from '../../types';
import { generateWeatherAdvisory } from '../../services/geminiService';

// Simple in-memory cache
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let weatherCache: { [key: string]: { data: WeatherData; timestamp: number } } = {};
let advisoryCache: { [key: string]: { data: AIWeatherAdvisory; timestamp: number } } = {};

const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export const WeatherApi = {
  /**
   * Fetches real weather data from Open-Meteo
   */
  getForLocation: async (locationName: string, coords?: { lat: number; lng: number }): Promise<ApiResponse<WeatherData>> => {
    // Default to Nashik if no coords
    const lat = coords?.lat || 19.9975;
    const lng = coords?.lng || 73.7898;

    // Unique cache key for lat/lng
    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const now = Date.now();

    if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp) < CACHE_DURATION) {
      return api.wrapSuccess(weatherCache[cacheKey].data);
    }

    try {
      // 1. Reverse Geocoding (if coords provided) to get actual city name
      let resolvedLocation = locationName;
      if (coords) {
        try {
          // Using OpenStreetMap Nominatim (more accurate for Indian villages)
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, {
            headers: {
              'User-Agent': 'AgriSmart-Nashik/1.0' // Action required by Nominatim usage policy
            }
          });

          if (geoRes.ok) {
            const geoData = await geoRes.json();
            // Prioritize: Village > Town > City > County > State District
            resolvedLocation = geoData.address.village ||
              geoData.address.town ||
              geoData.address.city ||
              geoData.address.municipality ||
              geoData.address.county ||
              geoData.address.state_district ||
              locationName;
          }
        } catch (e) {
          console.warn("Geo lookup failed, using default name provided");
        }
      }

      // 2. Fetch Weather Data from Open-Meteo with enhanced parameters
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,rain,uv_index&hourly=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error("Weather API failed");
      const data = await response.json();

      // 3. Map to our interface
      const current = data.current;
      const hourlyData = data.hourly;
      const dailyData = data.daily;

      // Construct hourly forecast (next 24h with enhanced data)
      const hourly: HourlyForecast[] = [];
      const currentHourIndex = hourlyData.time.findIndex((t: string) => t === current.time) || 0;

      for (let i = 0; i < 24; i++) {
        const idx = currentHourIndex + i;
        if (idx < hourlyData.time.length) {
          hourly.push({
            time: new Date(hourlyData.time[idx]).getHours() + ':00',
            temp: hourlyData.temperature_2m[idx],
            rainfall: hourlyData.rain[idx] || 0,
            humidity: hourlyData.relative_humidity_2m[idx],
            condition: getWeatherCondition(hourlyData.weather_code[idx]),
            windSpeed: hourlyData.wind_speed_10m?.[idx] || 0,
            uvIndex: hourlyData.uv_index?.[idx] || 0,
            soilMoisture: Math.max(0, Math.min(100, 60 + (hourlyData.rain[idx] || 0) * 5 - (hourlyData.temperature_2m[idx] - 25) * 2))
          });
        }
      }

      // Construct 7-day forecast with enhanced data
      const forecast7Day = dailyData.time.map((date: string, i: number) => ({
        date,
        temp: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
        minTemp: dailyData.temperature_2m_min[i],
        maxTemp: dailyData.temperature_2m_max[i],
        condition: getWeatherCondition(dailyData.weather_code[i]),
        rainfall: dailyData.rain_sum?.[i] || 0,
        windSpeed: dailyData.wind_speed_10m_max?.[i] || 0
      }));

      // Enhanced alerts with color-coded severity levels
      const alerts: WeatherAlert[] = [];
      
      // Heatwave detection
      if (current.temperature_2m > 42) {
        alerts.push({
          id: 'heat_alert_critical', type: 'heatwave', severity: 'red',
          message: 'Extreme heatwave conditions! Temperature above 42°C. Take immediate precautions.',
          actionable: 'Increase irrigation frequency, provide shade for crops, avoid field work during peak hours.',
          priority: 1,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      } else if (current.temperature_2m > 38) {
        alerts.push({
          id: 'heat_alert', type: 'heatwave', severity: 'orange',
          message: 'High temperatures detected. Ensure adequate irrigation.',
          actionable: 'Increase irrigation, avoid midday field operations.',
          priority: 2,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }

      // Heavy rain detection
      const totalRainfall24h = hourly.slice(0, 24).reduce((sum, h) => sum + (h.rainfall || 0), 0);
      if (totalRainfall24h > 100) {
        alerts.push({
          id: 'heavy_rain_alert', type: 'heavy_rain', severity: 'red',
          message: 'Heavy rainfall warning! Over 100mm expected in 24 hours.',
          actionable: 'Delay irrigation, ensure proper drainage, protect crops from waterlogging.',
          priority: 1,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      } else if (totalRainfall24h > 50) {
        alerts.push({
          id: 'moderate_rain_alert', type: 'heavy_rain', severity: 'orange',
          message: 'Moderate to heavy rainfall expected.',
          actionable: 'Reduce irrigation, check drainage systems.',
          priority: 2,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }

      // Drought detection (low rainfall over extended period)
      const avgRainfall7Days = forecast7Day.reduce((sum, d) => sum + (d.rainfall || 0), 0) / 7;
      if (avgRainfall7Days < 2 && current.temperature_2m > 35) {
        alerts.push({
          id: 'drought_alert', type: 'drought', severity: 'orange',
          message: 'Drought conditions developing. Low rainfall and high temperatures.',
          actionable: 'Increase irrigation frequency, consider mulching to retain soil moisture.',
          priority: 2,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 7 * 86400000).toISOString()
        });
      }

      // Frost detection (low temperature)
      const minTempNext7Days = Math.min(...forecast7Day.map(d => d.minTemp || d.temp));
      if (minTempNext7Days < 5) {
        alerts.push({
          id: 'frost_alert', type: 'frost', severity: 'red',
          message: 'Frost warning! Temperatures may drop below 5°C.',
          actionable: 'Cover sensitive crops, use frost protection measures, delay planting.',
          priority: 1,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 7 * 86400000).toISOString()
        });
      }

      // Wind speed for spraying
      if (current.wind_speed_10m > 25) {
        alerts.push({
          id: 'wind_alert', type: 'strong_wind', severity: 'orange',
          message: 'High winds detected. Unsuitable for spraying operations.',
          actionable: 'Delay spraying until wind speed decreases below 15 km/h.',
          priority: 2,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 43200000).toISOString()
        });
      } else if (current.wind_speed_10m >= 15 && current.wind_speed_10m <= 25) {
        alerts.push({
          id: 'wind_caution', type: 'strong_wind', severity: 'yellow',
          message: 'Moderate winds. Use caution when spraying.',
          actionable: 'Spray with caution, avoid windy periods.',
          priority: 3,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 43200000).toISOString()
        });
      }

      // Spraying conditions recommendation
      if (current.wind_speed_10m < 15 && current.rainfall === 0 && (current.uv_index || 0) < 8) {
        alerts.push({
          id: 'spraying_good', type: 'spraying_conditions', severity: 'green',
          message: 'Good conditions for spraying operations.',
          actionable: 'Good day for spraying - low wind, no rain expected.',
          priority: 4,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }

      // Default favorable alert if no critical alerts
      if (alerts.filter(a => a.severity === 'red' || a.severity === 'orange').length === 0) {
        alerts.push({
          id: 'favorable', type: 'favorable', severity: 'green',
          message: 'Good conditions for field operations today.',
          actionable: 'Proceed with planned farming activities.',
          priority: 5,
          startTime: new Date().toISOString(), 
          endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }

      // Sort alerts by priority (lower number = higher priority)
      alerts.sort((a, b) => (a.priority || 99) - (b.priority || 99));

      // Calculate agricultural metrics
      const avgWindSpeed = hourly.slice(0, 12).reduce((sum, h) => sum + (h.windSpeed || 0), 0) / 12;
      const avgUVIndex = hourly.slice(0, 12).reduce((sum, h) => sum + (h.uvIndex || 0), 0) / 12;
      const avgSoilMoisture = hourly.slice(0, 12).reduce((sum, h) => sum + (h.soilMoisture || 60), 0) / 12;

      const agriculturalMetrics = {
        soilMoistureProbability: Math.round(avgSoilMoisture),
        uvIndex: Math.round(avgUVIndex),
        windSpeedForSpraying: avgWindSpeed < 15 ? 'optimal' : avgWindSpeed < 20 ? 'moderate' : avgWindSpeed < 25 ? 'high' : 'unsuitable',
        sprayingRecommendation: (avgWindSpeed < 15 && current.rain === 0 && avgUVIndex < 8) ? 'recommended' : 
                                 (avgWindSpeed < 20 && current.rain === 0) ? 'caution' : 'not_recommended',
        irrigationRecommendation: (avgSoilMoisture < 40 || current.temperature_2m > 35) ? 'increase' :
                                  (avgSoilMoisture > 80 || totalRainfall24h > 50) ? 'delay' :
                                  (avgSoilMoisture > 60) ? 'decrease' : 'proceed',
        fieldOperationSuitability: (current.wind_speed_10m < 15 && current.rain === 0 && current.temperature_2m < 38) ? 'excellent' :
                                   (current.wind_speed_10m < 20 && current.rain < 5 && current.temperature_2m < 40) ? 'good' :
                                   (current.wind_speed_10m < 25 && current.rain < 10) ? 'moderate' : 'poor'
      };

      // Historical comparison (mock data - in production, fetch from historical database)
      const historicalComparison = {
        samePeriodLastYear: {
          avgTemp: current.temperature_2m + (Math.random() * 4 - 2), // ±2°C variation
          totalRainfall: totalRainfall24h * (0.8 + Math.random() * 0.4), // 80-120% variation
          extremeEvents: alerts.filter(a => a.severity === 'red' || a.severity === 'orange').length
        },
        deviation: {
          temp: current.temperature_2m - (current.temperature_2m + (Math.random() * 4 - 2)),
          rainfall: totalRainfall24h - (totalRainfall24h * (0.8 + Math.random() * 0.4))
        }
      };

      const weatherData: WeatherData = {
        locationId: `loc_${lat}_${lng}`,
        locationName: resolvedLocation,
        timestamp: new Date().toISOString(),
        temperature: current.temperature_2m,
        rainfall: current.rain || 0,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        condition: getWeatherCondition(current.weather_code),
        alerts,
        hourlyForecast: hourly,
        forecast7Day,
        agriculturalMetrics,
        historicalComparison
      };

      weatherCache[cacheKey] = { data: weatherData, timestamp: now };
      return api.wrapSuccess(weatherData);

    } catch (error) {
      console.error("WeatherAPI Error:", error);
      // Fallback to mock if API fails
      return {
        success: false,
        error: "Weather service unavailable",
        timestamp: new Date().toISOString()
      };
    }
  },

  getAIAdvisory: async (weather: WeatherData, language: 'en' | 'hi' | 'mr'): Promise<ApiResponse<AIWeatherAdvisory>> => {
    // Keep existing implementation
    const cacheKey = `${weather.locationId}_${language}`;
    const now = Date.now();

    if (advisoryCache[cacheKey] && (now - advisoryCache[cacheKey].timestamp) < CACHE_DURATION) {
      return api.wrapSuccess(advisoryCache[cacheKey].data);
    }

    try {
      const advisory = await generateWeatherAdvisory(weather, language);
      advisoryCache[cacheKey] = { data: advisory, timestamp: now };
      return api.wrapSuccess(advisory);
    } catch (error) {
      return {
        success: false,
        error: "AI Advisory service unavailable",
        timestamp: new Date().toISOString()
      };
    }
  }
};
