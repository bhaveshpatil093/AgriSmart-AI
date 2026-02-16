
import { api } from '../../lib/apiClient';
import { GrapeAdvisory, ApiResponse, WeatherData, MarketPrice, Crop } from '../../types';

export const GrapeApi = {
  getAdvisory: async (crop: Crop, weather: WeatherData, market: MarketPrice[]): Promise<ApiResponse<GrapeAdvisory>> => {
    // Determine risk based on weather
    // Downy Mildew likes high humidity (>85%) and moderate temp (20-25C)
    const humidity = weather.humidity;
    const temp = weather.temperature;
    
    const downyScore = humidity > 80 && temp < 28 ? 75 : 30;
    const powderyScore = temp > 30 && humidity < 40 ? 80 : 25;
    
    // Determine market recommendation
    const grapePrice = market.find(m => m.cropType.includes('Grape'))?.price || 0;
    const priceTrend = market.find(m => m.cropType.includes('Grape'))?.change.startsWith('+') ? 'UP' : 'DOWN';
    
    const advisory: GrapeAdvisory = {
      currentStage: crop.currentStage,
      weeklyTasks: [
        {
          id: 'gt1',
          title: 'Foundation Pruning Prep',
          description: 'Apply copper hydroxide to open wounds post-harvest pruning.',
          priority: 'high',
          isCompleted: false,
          category: 'pruning'
        },
        {
          id: 'gt2',
          title: 'GA Application (Berry Set)',
          description: 'Dilute GA3 to 20ppm for fruit enlargement in Thompson variety.',
          priority: 'medium',
          isCompleted: false,
          category: 'nutrition'
        },
        {
          id: 'gt3',
          title: 'Girdling (Stage: Veraison)',
          description: 'Girdle main trunk to increase sugar accumulation and berry size.',
          priority: 'medium',
          isCompleted: true,
          category: 'pruning'
        }
      ],
      risks: [
        {
          name: 'Downy Mildew',
          riskLevel: downyScore > 70 ? 'High' : 'Low',
          score: downyScore,
          symptoms: ['Oil spots on upper leaves', 'White fuzzy growth on underside'],
          organicTreatment: 'Potassium Bicarbonate spray (0.5%)',
          chemicalTreatment: 'Metalaxyl-M + Mancozeb'
        },
        {
          name: 'Powdery Mildew',
          riskLevel: powderyScore > 70 ? 'High' : 'Low',
          score: powderyScore,
          symptoms: ['Ashy gray powder on berries', 'Leaf curling'],
          organicTreatment: 'Sulfur dust (90% WP)',
          chemicalTreatment: 'Penconazole'
        }
      ],
      marketRecommendation: priceTrend === 'UP' 
        ? `Prices in ${market.find(m => m.cropType.includes('Grape'))?.mandiName} are rising. Delay harvest by 3 days if Brix > 16.`
        : "Market stable. Recommend standard harvest window.",
      nextSprayingWindow: "Tomorrow 06:00 - 09:00 (Low Wind Speed)"
    };

    return api.wrapSuccess(advisory);
  }
};
