
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

      // 2. Fetch Weather Data from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,rain&hourly=temperature_2m,relative_humidity_2m,rain,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error("Weather API failed");
      const data = await response.json();

      // 3. Map to our interface
      const current = data.current;
      const hourlyData = data.hourly;
      const dailyData = data.daily;

      // Construct hourly forecast (next 24h)
      const hourly: HourlyForecast[] = [];
      const currentHourIndex = hourlyData.time.findIndex((t: string) => t === current.time) || 0;

      for (let i = 0; i < 24; i++) {
        const idx = currentHourIndex + i;
        if (idx < hourlyData.time.length) {
          hourly.push({
            time: new Date(hourlyData.time[idx]).getHours() + ':00',
            temp: hourlyData.temperature_2m[idx],
            rainfall: hourlyData.rain[idx],
            humidity: hourlyData.relative_humidity_2m[idx],
            condition: getWeatherCondition(hourlyData.weather_code[idx])
          });
        }
      }

      // Construct 7-day forecast
      const forecast7Day = dailyData.time.map((date: string, i: number) => ({
        date,
        temp: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
        condition: getWeatherCondition(dailyData.weather_code[i])
      }));

      // Basic alerts based on data (Simulation for now, as Open-Meteo alerts are separate/complex)
      const alerts: WeatherAlert[] = [];
      if (current.temperature_2m > 38) {
        alerts.push({
          id: 'heat_alert', type: 'heatwave', severity: 'warning',
          message: 'High temperatures detected. Ensure adequate irrigation.',
          startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }
      if (current.wind_speed_10m > 20) {
        alerts.push({
          id: 'wind_alert', type: 'strong_wind', severity: 'advisory',
          message: 'High winds detected. Avoid spraying today.',
          startTime: new Date().toISOString(), endTime: new Date(Date.now() + 43200000).toISOString()
        });
      }

      // Default favourable alert if nothing else
      if (alerts.length === 0) {
        alerts.push({
          id: 'favorable', type: 'favorable', severity: 'advisory',
          message: 'Good conditions for field operations today.',
          startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString()
        });
      }

      const weatherData: WeatherData = {
        locationId: `loc_${lat}_${lng}`,
        locationName: resolvedLocation,
        timestamp: new Date().toISOString(),
        temperature: current.temperature_2m,
        rainfall: current.rain,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        condition: getWeatherCondition(current.weather_code),
        alerts,
        hourlyForecast: hourly,
        forecast7Day
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
