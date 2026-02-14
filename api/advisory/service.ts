import { api } from '../../lib/apiClient';
import { Advisory, ApiResponse, User, Crop, PersonalizedAdvisory } from '../../types';
import { generatePersonalizedAdvisory } from '../../services/geminiService';
import { WeatherApi } from '../weather/service';
import { MarketApi } from '../market/service';
import { CropsApi } from '../crops/service';

let advisoryStore: PersonalizedAdvisory[] = [];

export const AdvisoryApi = {
  getLatest: async (userId: string): Promise<ApiResponse<Advisory[]>> => {
    const advisories: Advisory[] = [
      {
        advisoryId: 'adv1',
        userId,
        cropId: 'c1',
        type: 'irrigation',
        content: 'Heavy rainfall expected in 48 hours. Reduce drip irrigation by 30% to avoid root rot.',
        priority: 'high',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 2).toISOString()
      },
      {
        advisoryId: 'adv2',
        userId,
        type: 'market',
        content: 'Market prices for Thompson grapes are up 15% in nearby Pune Mandi. Consider harvesting early if maturity is reached.',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString()
      }
    ];
    return api.wrapSuccess(advisories);
  },

  /**
   * Task 39: Automated Bulk Generation Service Simulator
   */
  runDailyCron: async (users: User[], progressCallback?: (status: string) => void): Promise<ApiResponse<PersonalizedAdvisory[]>> => {
    const results: PersonalizedAdvisory[] = [];
    const marketRes = await MarketApi.getLatestPrices();
    const marketData = marketRes.success ? marketRes.data! : [];

    for (const user of users) {
      if (progressCallback) progressCallback(`Processing profile: ${user.name}...`);
      
      const cropsRes = await CropsApi.getByUser(user.userId);
      const weatherRes = await WeatherApi.getForLocation(user.location.village);
      
      if (cropsRes.success && cropsRes.data && cropsRes.data.length > 0 && weatherRes.success) {
        const crop = cropsRes.data[0];
        const advisory = await generatePersonalizedAdvisory(user, crop, weatherRes.data!, marketData);
        results.push(advisory);
        advisoryStore.push(advisory);
      }
    }

    return api.wrapSuccess(results);
  },

  getStoredPersonalAdvisories: async (userId: string): Promise<ApiResponse<PersonalizedAdvisory[]>> => {
    return api.wrapSuccess(advisoryStore.filter(a => a.id.length > 0)); // Simulation
  }
};