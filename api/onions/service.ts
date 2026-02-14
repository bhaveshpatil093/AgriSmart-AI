import { api } from '../../lib/apiClient';
import { OnionAdvisory, ApiResponse, WeatherData, MarketPrice, Crop } from '../../types';

export const OnionApi = {
  getAdvisory: async (crop: Crop, weather: WeatherData, market: MarketPrice[]): Promise<ApiResponse<OnionAdvisory>> => {
    // Risk factors for Onions
    // Purple Blotch likes high humidity (>80%) and warm temp (25-30C)
    const humidity = weather.humidity;
    const temp = weather.temperature;
    
    const purpleBlotchScore = (humidity > 75 && temp > 22 && temp < 32) ? 85 : 20;
    const thripsScore = (temp > 30 && humidity < 50) ? 70 : 35;
    
    // Determine market recommendation
    const onionPrice = market.find(m => m.cropType.includes('Onion'))?.price || 0;
    const priceTrend = market.find(m => m.cropType.includes('Onion'))?.change.startsWith('+') ? 'UP' : 'DOWN';
    
    const advisory: OnionAdvisory = {
      currentStage: crop.currentStage,
      weeklyTasks: [
        {
          id: 'ot1',
          title: 'Irrigation Cut-off Planning',
          description: 'Identify if 50% neck fall is reached. Stop irrigation 15 days before harvest for better shelf life.',
          priority: 'high',
          isCompleted: false,
          category: 'harvest'
        },
        {
          id: 'ot2',
          title: 'Stemphylium Spray',
          description: 'Apply preventive fungicide if morning dew is heavy in the Nashik valley.',
          priority: 'medium',
          isCompleted: false,
          category: 'protection'
        },
        {
          id: 'ot3',
          title: 'NPK Top Dressing',
          description: 'Apply last dose of Nitrogen if bulb initiation has just started.',
          priority: 'low',
          isCompleted: true,
          category: 'nutrition'
        }
      ],
      risks: [
        {
          name: 'Purple Blotch',
          riskLevel: purpleBlotchScore > 70 ? 'High' : 'Moderate',
          score: purpleBlotchScore,
          symptoms: ['Small water-soaked lesions', 'Purple centers with yellow halo'],
          organicTreatment: 'Neem oil spray (3000 ppm)',
          chemicalTreatment: 'Mancozeb or Chlorothalonil'
        },
        {
          name: 'Onion Thrips',
          riskLevel: thripsScore > 60 ? 'High' : 'Low',
          score: thripsScore,
          symptoms: ['Silvering of leaves', 'Curled leaf tips'],
          organicTreatment: 'Spinosad (OMRI listed)',
          chemicalTreatment: 'Fipronil'
        }
      ],
      marketRecommendation: priceTrend === 'UP' 
        ? `Prices in Lasalgaon are peaking. If bulbs are mature (75% neck fall), harvest immediately to capture current rates.`
        : "Market stable. Ensure proper field curing for 3-5 days to maximize bulb quality and color.",
      harvestWindow: "June 05 - June 15 (Post-monsoon risk low)",
      curingTips: [
        "Leave harvested onions in rows for 3 days in the sun.",
        "Ensure bulbs are covered by leaves of the next row to avoid sunscald.",
        "Cut tops only when necks are completely dry to prevent rot during storage."
      ]
    };

    return api.wrapSuccess(advisory);
  }
};