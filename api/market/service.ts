import { api } from '../../lib/apiClient';
import { MarketPrice, ApiResponse, MandiPrice, AuctionFeed, UserPriceReport, PriceHistoryPoint, YoYPricePoint, MarketArbitrage } from '../../types';

export const MarketApi = {
  getLatestPrices: async (): Promise<ApiResponse<MarketPrice[]>> => {
    const prices: MarketPrice[] = [
      { 
        marketId: 'm1', 
        cropType: "Onion", 
        price: 2450.00, 
        date: new Date().toISOString(), 
        mandiName: "Lasalgaon APMC", 
        location: "Nashik, MH", 
        change: "+120" 
      },
      { 
        marketId: 'm2', 
        cropType: "Grape (Thompson)", 
        price: 75.00, 
        date: new Date().toISOString(), 
        mandiName: "Pimpalgaon APMC", 
        location: "Nashik, MH", 
        change: "+5.00" 
      }
    ];
    return api.wrapSuccess(prices);
  },

  getMandiRates: async (market: string, commodity: string): Promise<ApiResponse<MandiPrice[]>> => {
    const rates: MandiPrice[] = [
      {
        id: 'r1',
        commodity,
        variety: 'Regular Hybrid',
        market,
        minPrice: 1800,
        maxPrice: 2800,
        modalPrice: 2450,
        grade: 'A',
        arrivalQuantity: 1250,
        unit: 'Quintal',
        date: new Date().toISOString().split('T')[0],
        source: 'Agmarknet'
      }
    ];
    return api.wrapSuccess(rates);
  },

  /**
   * Requirement 22: Deep Analytical History
   */
  getAdvancedTrendData: async (commodity: string, variety: string): Promise<ApiResponse<PriceHistoryPoint[]>> => {
    const points: PriceHistoryPoint[] = Array.from({ length: 90 }).map((_, i) => {
      const date = new Date(Date.now() - (90 - i) * 86400000).toISOString().split('T')[0];
      const base = 2000 + Math.sin(i * 0.1) * 300 + Math.random() * 100;
      return {
        date,
        modalPrice: Math.round(base),
        sma7: Math.round(base * 0.98),
        sma30: Math.round(base * 1.02),
        sma90: Math.round(base * 0.95),
        isAnomaly: i === 75 || i === 82
      };
    });
    return api.wrapSuccess(points);
  },

  // Fix: Added missing getHistoricalPrices method for simplified trend viewing in MarketHub
  getHistoricalPrices: async (commodity: string): Promise<ApiResponse<PriceHistoryPoint[]>> => {
    const points: PriceHistoryPoint[] = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0];
      const base = 2000 + Math.sin(i * 0.2) * 200 + Math.random() * 50;
      return {
        date,
        modalPrice: Math.round(base),
      };
    });
    return api.wrapSuccess(points);
  },

  getYoYSeasonality: async (commodity: string): Promise<ApiResponse<YoYPricePoint[]>> => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: YoYPricePoint[] = months.map((m, i) => ({
      month: m,
      currentYear: 2200 + Math.sin(i) * 400,
      previousYear: 1900 + Math.sin(i) * 300,
      avg3Year: 2000 + Math.sin(i) * 350
    }));
    return api.wrapSuccess(data);
  },

  getMarketArbitrage: async (commodity: string, sourceLocation: string): Promise<ApiResponse<MarketArbitrage[]>> => {
    const data: MarketArbitrage[] = [
      { mandiName: 'Lasalgaon', price: 2450, distanceKm: 45, netPrice: 2380 },
      { mandiName: 'Pimpalgaon', price: 2520, distanceKm: 60, netPrice: 2420 },
      { mandiName: 'Nashik', price: 2390, distanceKm: 12, netPrice: 2375 },
      { mandiName: 'Vashi (Mumbai)', price: 3100, distanceKm: 180, netPrice: 2850 }
    ];
    return api.wrapSuccess(data);
  },

  getLiveAuctions: async (market: string): Promise<ApiResponse<AuctionFeed[]>> => {
    const auctions: AuctionFeed[] = [
      { id: 'a1', lotNumber: 'L-902', commodity: 'Onion', currentBid: 2680, biddersCount: 14, endTime: '14:30', status: 'Live' }
    ];
    return api.wrapSuccess(auctions);
  },

  reportPrice: async (report: UserPriceReport): Promise<ApiResponse<void>> => {
    return api.wrapSuccess(undefined);
  }
};