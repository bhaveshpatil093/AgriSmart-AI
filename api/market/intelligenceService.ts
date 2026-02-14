import { api } from '../../lib/apiClient';
import { ApiResponse, MarketOpportunity, MarketNews, SaleRecord, SellRecommendation, MarketAlert, Market } from '../../types';

export const IntelligenceApi = {
  getTodaysMarkets: async (cropType: string): Promise<ApiResponse<MarketOpportunity[]>> => {
    const mandis = [
      { id: '1', name: 'Lasalgaon APMC', dist: 35, base: 2450 },
      { id: '2', name: 'Pimpalgaon APMC', dist: 42, base: 2520 },
      { id: '3', name: 'Nashik Mandi', dist: 12, base: 2380 },
      { id: '4', name: 'Yeola Mandi', dist: 85, base: 2600 },
      { id: '5', name: 'Niphad Mandi', dist: 50, base: 2410 },
      { id: '6', name: 'Kalwan Mandi', dist: 65, base: 2480 },
      { id: '7', name: 'Vashi (Mumbai)', dist: 180, base: 3100 },
      { id: '8', name: 'Pune Gultekdi', dist: 210, base: 2950 },
      { id: '9', name: 'Surat Mandi', dist: 240, base: 3050 },
      { id: '10', name: 'Dindori Mandi', dist: 28, base: 2430 }
    ];

    const data: MarketOpportunity[] = mandis.map(m => {
      const change = (Math.random() * 8 - 3);
      return {
        mandiId: m.id,
        mandiName: m.name,
        commodity: cropType,
        currentPrice: Math.round(m.base + (Math.random() * 50)),
        changePercent: parseFloat(change.toFixed(1)),
        distanceKm: m.dist,
        isBestPrice: m.id === '7', // Vashi usually highest but far
        arrivalVolume: `${Math.floor(Math.random() * 5000 + 1000)} Quintals`
      };
    });

    return api.wrapSuccess(data);
  },

  getMarketNews: async (): Promise<ApiResponse<MarketNews[]>> => {
    const news: MarketNews[] = [
      {
        id: 'n1',
        title: 'MEP for Onion Exports Removed',
        source: 'Directorate General of Foreign Trade',
        timestamp: new Date().toISOString(),
        category: 'policy',
        impactScore: 5,
        summary: 'The government has removed the Minimum Export Price on onions, likely boosting demand in Nashik markets.'
      },
      {
        id: 'n2',
        title: 'UAE Export Demand Surges for Thompson Grapes',
        source: 'APEDA Pulse',
        timestamp: new Date().toISOString(),
        category: 'export',
        impactScore: 4,
        summary: 'Major retail chains in Dubai increase orders for high-brix Nashik grapes.'
      },
      {
        id: 'n3',
        title: 'NAFED to Start Buffer Stock Procurement',
        source: 'AgriNews India',
        timestamp: new Date().toISOString(),
        category: 'policy',
        impactScore: 4,
        summary: 'Government agencies to procure 5 lakh tons of rabi onion to stabilize domestic prices.'
      }
    ];
    return api.wrapSuccess(news);
  },

  getSellRecommendation: async (cropType: string, estimatedYield: number): Promise<ApiResponse<SellRecommendation>> => {
    const recommendation: SellRecommendation = {
      action: 'Wait 3-5 Days',
      reasoning: 'Removal of export curbs and upcoming Holi festival demand are projected to drive prices up by 8-12%. Supply arrivals in Lasalgaon are dipping due to unseasonal rain in neighboring talukas.',
      riskLevel: 'Medium',
      projectedPriceChange: 10.5,
      expectedProfit: estimatedYield * 250 // Difference if they wait
    };
    return api.wrapSuccess(recommendation);
  },

  getMySalesHistory: async (userId: string): Promise<ApiResponse<SaleRecord[]>> => {
    const history: SaleRecord[] = [
      { id: 's1', date: '2024-03-12', commodity: 'Onion', mandiName: 'Lasalgaon', quantity: 45, unit: 'Quintal', pricePerUnit: 2350, totalRealization: 105750 },
      { id: 's2', date: '2024-01-20', commodity: 'Grape', mandiName: 'Pimpalgaon', quantity: 1200, unit: 'Kg', pricePerUnit: 68, totalRealization: 81600 }
    ];
    return api.wrapSuccess(history);
  },

  getAlerts: async (userId: string): Promise<ApiResponse<MarketAlert[]>> => {
    const alerts: MarketAlert[] = [
      { id: 'al-1', cropType: 'Onion', thresholdPrice: 3000, condition: 'ABOVE', isActive: true, createdAt: new Date().toISOString() },
      { id: 'al-2', cropType: 'Grape', thresholdPrice: 80, condition: 'ABOVE', isActive: false, createdAt: new Date().toISOString() }
    ];
    return api.wrapSuccess(alerts);
  },

  saveAlert: async (alert: Omit<MarketAlert, 'id' | 'createdAt'>): Promise<ApiResponse<MarketAlert>> => {
    return api.wrapSuccess({
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    });
  },

  getMarketDetails: async (mandiId: string): Promise<ApiResponse<Market>> => {
    return api.wrapSuccess({
      id: mandiId,
      name: 'Lasalgaon APMC',
      address: 'Main Market Yard, Lasalgaon, Nashik, MH 422306',
      contact: '+91 2550 266 035',
      hours: '08:00 AM - 06:00 PM (Monday - Saturday)',
      lat: 20.125,
      lng: 74.225,
      rating: 4.8,
      reviewsCount: 1250,
      photos: [
        'https://images.unsplash.com/photo-1596373809653-e5786a51d8b9?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800'
      ]
    });
  }
};
