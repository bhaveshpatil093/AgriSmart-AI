import { api } from '../../lib/apiClient';
import { TomatoAdvisory, ApiResponse, WeatherData, MarketPrice, Crop } from '../../types';

export const TomatoApi = {
  getAdvisory: async (crop: Crop, weather: WeatherData, market: MarketPrice[]): Promise<ApiResponse<TomatoAdvisory>> => {
    // Risk factors for Tomatoes in Nashik region
    const humidity = weather.humidity;
    const temp = weather.temperature;
    
    // Blight risk: High humidity + Moderate temp
    const blightScore = (humidity > 80 && temp > 18 && temp < 26) ? 80 : 30;
    // Heat stress risk: Extreme heat > 35C
    const heatStressScore = temp > 35 ? 75 : 15;
    
    // Market analysis
    const tomatoPrice = market.find(m => m.cropType.includes('Tomato'))?.price || 0;
    const priceTrend = market.find(m => m.cropType.includes('Tomato'))?.change.startsWith('+') ? 'UP' : 'DOWN';
    
    const advisory: TomatoAdvisory = {
      currentStage: crop.currentStage,
      weeklyTasks: [
        {
          id: 'tt1',
          title: 'Trellis & Staking Reinforcement',
          description: 'Ensure bamboo stakes are secure. Fruit clusters are getting heavy; double tie the main stem.',
          priority: 'high',
          isCompleted: false,
          category: 'staking'
        },
        {
          id: 'tt2',
          title: 'Foliar Calcium Spray',
          description: 'Prevent Blossom End Rot by applying Calcium Nitrate during high-heat afternoon peaks.',
          priority: 'medium',
          isCompleted: false,
          category: 'protection'
        },
        {
          id: 'tt3',
          title: 'Lower Leaf Pruning',
          description: 'Remove bottom leaves touching the soil to improve airflow and prevent soil-borne blight.',
          priority: 'low',
          isCompleted: true,
          category: 'protection'
        }
      ],
      risks: [
        {
          name: 'Early/Late Blight',
          riskLevel: blightScore > 70 ? 'High' : 'Low',
          score: blightScore,
          symptoms: ['Brown target-like spots', 'Dark water-soaked patches'],
          organicTreatment: 'Copper oxychloride or Trichoderma viride',
          chemicalTreatment: 'Mancozeb or Azoxystrobin'
        },
        {
          name: 'Leaf Curl (Whitefly)',
          riskLevel: heatStressScore > 60 ? 'Moderate' : 'Low',
          score: heatStressScore,
          symptoms: ['Upward curling of leaves', 'Stunted growth'],
          organicTreatment: 'Yellow sticky traps + Neem oil',
          chemicalTreatment: 'Imidacloprid'
        }
      ],
      marketRecommendation: priceTrend === 'UP' 
        ? `Fresh market prices in Nashik Mandi are rising. Harvest at 'Breaker' stage for long-distance transport to capture premium rates.`
        : "Prices stable. If selling to nearby processing units, allow fruit to reach 'Red Ripe' stage for maximum solids.",
      harvestStages: [
        { stage: 'Breaker', color: 'bg-yellow-100', purpose: 'Long distance transport (5-7 days shelf life)' },
        { stage: 'Pink/Turning', color: 'bg-pink-200', purpose: 'Local markets (2-3 days shelf life)' },
        { stage: 'Red Ripe', color: 'bg-red-500', purpose: 'Immediate consumption or Processing' }
      ],
      stakingAdvice: "Maintain a 'V' system for hybrid varieties to ensure maximum light penetration and easier spraying."
    };

    return api.wrapSuccess(advisory);
  }
};