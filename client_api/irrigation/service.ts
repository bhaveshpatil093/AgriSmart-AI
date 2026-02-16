
import { api } from '../../lib/apiClient';
import { IrrigationRecommendation, WaterUsageRecord, ApiResponse, Crop, WeatherData, SoilType } from '../../types';

export const IrrigationApi = {
  /**
   * Decision Engine: Calculates water requirements (ETc) for Nashik's core crops.
   * Incorporates Nashik-specific Kc (Crop Coefficient) stages.
   */
  getRecommendations: async (crops: Crop[], weather: WeatherData, soilType: SoilType = 'Black'): Promise<ApiResponse<IrrigationRecommendation[]>> => {
    const recommendations: IrrigationRecommendation[] = crops.map(crop => {
      // ETo: Reference Evapotranspiration (Penman-Monteith simplification)
      const ETo = (weather.temperature * 0.16) + (100 - weather.humidity) * 0.06;
      
      // Nashik Belt Phenological Kc Mapping
      const kcMap: Record<string, Record<string, number>> = {
        'Grape': { 'Seedling': 0.3, 'Vegetative': 0.55, 'Flowering': 0.9, 'Fruit Set': 1.2, 'Maturity': 0.7, 'Harvest': 0.4 },
        'Onion': { 'Seedling': 0.4, 'Vegetative': 0.8, 'Maturity': 1.05, 'Harvest': 0.6 },
        'Tomato': { 'Seedling': 0.5, 'Vegetative': 0.85, 'Flowering': 1.15, 'Fruit Set': 1.25, 'Harvest': 0.85 },
      };

      const cropType = crop.cropType || 'Grape';
      const stage = crop.currentStage || 'Vegetative';
      const kc = kcMap[cropType]?.[stage] || 0.8;
      const ETc = ETo * kc;
      
      // Soil Water Holding Capacity adjustment
      const soilFactor = soilType === 'Black' ? 1.2 : soilType === 'Sandy' ? 0.8 : 1.0;
      
      // Rainfall compensation (effective rainfall 70%)
      const rainForecast = weather.hourlyForecast.slice(0, 24).reduce((sum, h) => sum + h.rainfall, 0);
      const effectiveRain = rainForecast * 0.7;
      
      const waterDeficit = (ETc * soilFactor) - effectiveRain;
      
      let action: 'IRRIGATE' | 'SKIP' | 'DELAY' = 'IRRIGATE';
      let reason = `${cropType} (${stage}) needs ${ETc.toFixed(1)}mm.`;
      let duration = Math.max(0, Math.round(waterDeficit * 15 * (crop.farmSize / 3)));

      if (rainForecast > 10) {
        action = 'SKIP';
        reason = `Significant rain (${rainForecast.toFixed(1)}mm) expected. Avoid waterlogging in ${soilType} soil.`;
        duration = 0;
      } else if (weather.temperature > 37) {
        action = 'IRRIGATE';
        reason = `High temperature alert! Increase water for ${cropType} fruit cooling.`;
        duration *= 1.35;
      } else if (waterDeficit < 1.0) {
        action = 'DELAY';
        reason = `Current moisture sufficient for ${cropType} in ${stage} stage.`;
        duration = 0;
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        cropId: crop.cropId,
        cropName: `${crop.cropType} (${crop.variety})`,
        action,
        durationMinutes: Math.round(duration),
        scheduledTime: '18:45',
        reason,
        moistureLevel: 35 + (Math.random() * 30),
        evapotranspiration: parseFloat(ETc.toFixed(2)),
        isApplied: false
      };
    });

    return api.wrapSuccess(recommendations);
  },

  getUsageHistory: async (userId: string): Promise<ApiResponse<WaterUsageRecord[]>> => {
    const history: WaterUsageRecord[] = Array.from({ length: 14 }).map((_, i) => ({
      id: `u-${i}`,
      date: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0],
      amountLiters: 1200 + (Math.random() * 1500),
      cropId: 'c1'
    }));
    return api.wrapSuccess(history);
  },

  applyIrrigation: async (recId: string): Promise<ApiResponse<void>> => {
    return api.wrapSuccess(undefined);
  }
};
