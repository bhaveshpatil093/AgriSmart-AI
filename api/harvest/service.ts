import { api } from '../../lib/apiClient';
import { ApiResponse, HarvestAdvisory, Crop, WeatherData, HarvestScenario, MaturityMetric } from '../../types';

export const HarvestApi = {
  getAdvisory: async (crop: Crop, weather: WeatherData): Promise<ApiResponse<HarvestAdvisory>> => {
    const today = new Date().toISOString().split('T')[0];
    const basePrice = crop.cropType === 'Onion' ? 2400 : crop.cropType === 'Grape' ? 7500 : 1800;
    const baseYield = crop.farmSize * (crop.cropType === 'Grape' ? 8 : 15); // Tons/Acre approximation

    const maturityMetrics: MaturityMetric[] = crop.cropType === 'Grape' ? [
      { name: 'Brix Content', value: 16.5, target: 18.0, status: 'pending', unit: '°Bx' },
      { name: 'Berry Size', value: 18, target: 18, status: 'optimal', unit: 'mm' },
      { name: 'Acid Level', value: 0.8, target: 0.6, status: 'pending', unit: '%' }
    ] : crop.cropType === 'Onion' ? [
      { name: 'Neck Fall', value: '45%', target: '70%', status: 'pending', unit: '' },
      { name: 'Bulb Size', value: 65, target: 60, status: 'optimal', unit: 'mm' },
      { name: 'Skin Curing', value: 'Light', target: 'Medium', status: 'pending', unit: '' }
    ] : [
      { name: 'Color Stage', value: 'Breaker', target: 'Red Ripe', status: 'pending', unit: '' },
      { name: 'Firmness', value: 8.5, target: 6.0, status: 'optimal', unit: 'kg/cm²' }
    ];

    const scenarios: HarvestScenario[] = [
      {
        date: today,
        label: 'Harvest Now',
        estimatedPrice: basePrice,
        estimatedWeight: baseYield,
        storageCost: 0,
        shrinkageLoss: 0,
        grossReturn: baseYield * basePrice,
        netReturn: baseYield * basePrice,
        confidence: 0.98
      },
      {
        date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        label: 'Delay 5 Days',
        estimatedPrice: basePrice * 1.15,
        estimatedWeight: baseYield * 1.05,
        storageCost: baseYield * 250, // 250 per ton cold storage
        shrinkageLoss: 2,
        grossReturn: (baseYield * 1.05 * 0.98) * (basePrice * 1.15),
        netReturn: ((baseYield * 1.05 * 0.98) * (basePrice * 1.15)) - (baseYield * 250),
        confidence: 0.82
      },
      {
        date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        label: 'Wait 10 Days',
        estimatedPrice: basePrice * 1.25,
        estimatedWeight: baseYield * 1.1,
        storageCost: baseYield * 500,
        shrinkageLoss: 5,
        grossReturn: (baseYield * 1.1 * 0.95) * (basePrice * 1.25),
        netReturn: ((baseYield * 1.1 * 0.95) * (basePrice * 1.25)) - (baseYield * 500),
        confidence: 0.65
      }
    ];

    const advisory: HarvestAdvisory = {
      cropId: crop.cropId,
      cropType: crop.cropType,
      optimalWindow: {
        start: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        end: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0]
      },
      harvestIndex: 72, // 72% ready
      maturityMetrics,
      scenarios,
      weatherSuitability: weather.rainfall > 5 ? 'Poor' : 'Excellent',
      weatherReason: weather.rainfall > 5 ? 'Rain expected. High risk of bunch rot and soil compaction.' : 'Dry, cool window detected. Ideal for post-harvest shelf life.',
      laborChecklist: [
        { item: 'Contact 12 picking crew members', completed: true },
        { item: 'Clean plastic crates (600 units)', completed: false },
        { item: 'Verify cold storage slot booking', completed: false },
        { item: 'Book 3-ton transport vehicle', completed: false }
      ],
      marketContext: "Upcoming Holi festival is driving demand in Northern mandis. Prices expected to peak within 7 days."
    };

    return api.wrapSuccess(advisory);
  }
};