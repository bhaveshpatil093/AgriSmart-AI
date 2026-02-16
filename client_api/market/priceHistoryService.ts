import { api } from '../../lib/apiClient';
import { ApiResponse, HistoricalPriceData, PriceHistoryFilters } from '../../types';

// Mock historical price data generator
// In production, this would fetch from Agmarknet API or Supabase
const generateMockHistoricalData = (filters: PriceHistoryFilters): HistoricalPriceData[] => {
  const data: HistoricalPriceData[] = [];
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base prices by crop type
  const basePrices: Record<string, number> = {
    'Tomato': 2500,
    'Onion': 1800,
    'Grape': 4500,
    'All': 3000
  };

  const markets = filters.marketLocation === 'All' 
    ? ['Lasalgaon', 'Pimpalgaon', 'Nashik', 'Dindori']
    : [filters.marketLocation];
  
  const crops = filters.cropType === 'All'
    ? ['Tomato', 'Onion', 'Grape']
    : [filters.cropType];

  // Generate data points (sample every 7 days for performance)
  for (let i = 0; i < daysDiff; i += 7) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    if (currentDate > endDate) break;

    crops.forEach(crop => {
      markets.forEach(market => {
        const basePrice = basePrices[crop] || basePrices['All'];
        
        // Add seasonal variation
        const month = currentDate.getMonth();
        let seasonalMultiplier = 1;
        if (crop === 'Tomato') {
          // Tomatoes peak in winter
          seasonalMultiplier = month >= 10 || month <= 2 ? 1.3 : month >= 6 && month <= 8 ? 0.7 : 1;
        } else if (crop === 'Onion') {
          // Onions peak in summer
          seasonalMultiplier = month >= 3 && month <= 5 ? 1.4 : month >= 9 && month <= 11 ? 0.8 : 1;
        } else if (crop === 'Grape') {
          // Grapes peak in late summer
          seasonalMultiplier = month >= 4 && month <= 6 ? 1.2 : month >= 11 || month <= 1 ? 0.9 : 1;
        }

        // Add random variation
        const randomVariation = 0.85 + Math.random() * 0.3; // ±15% variation
        const price = Math.round(basePrice * seasonalMultiplier * randomVariation);
        
        // Market-specific adjustments
        let marketPrice = price;
        if (market === 'Lasalgaon') marketPrice = Math.round(price * 1.05); // Slightly higher
        if (market === 'Pimpalgaon') marketPrice = Math.round(price * 0.98); // Slightly lower

        data.push({
          date: currentDate.toISOString().split('T')[0],
          cropType: crop,
          marketLocation: market,
          price: marketPrice,
          minPrice: Math.round(marketPrice * 0.92),
          maxPrice: Math.round(marketPrice * 1.08),
          volume: Math.floor(1000 + Math.random() * 5000)
        });
      });
    });
  }

  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const PriceHistoryApi = {
  getHistoricalPrices: async (filters: PriceHistoryFilters): Promise<ApiResponse<HistoricalPriceData[]>> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, this would be:
      // const response = await api.request('/api/market/history', 'POST', filters);
      // return response;

      // For now, use mock data
      const mockData = generateMockHistoricalData(filters);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch historical prices'
      };
    }
  },

  // Get price statistics
  getPriceStats: async (filters: PriceHistoryFilters): Promise<ApiResponse<{
    average: number;
    min: number;
    max: number;
    median: number;
    stdDev: number;
  }>> => {
    try {
      const pricesRes = await PriceHistoryApi.getHistoricalPrices(filters);
      
      if (!pricesRes.success || !pricesRes.data) {
        return { success: false, error: 'Failed to fetch data' };
      }

      const prices = pricesRes.data.map(d => d.price).sort((a, b) => a - b);
      const average = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = prices[0];
      const max = prices[prices.length - 1];
      const median = prices[Math.floor(prices.length / 2)];
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);

      return {
        success: true,
        data: { average, min, max, median, stdDev }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to calculate statistics'
      };
    }
  }
};
