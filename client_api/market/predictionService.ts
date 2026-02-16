import { api } from '../../lib/apiClient';
import { PricePredictionOutcome, ApiResponse, PricePredictionPoint, FeatureImportance } from '../../types';

export const PricePredictionApi = {
  /**
   * Task 23: Vertex AI Price Prediction Endpoint Simulation
   */
  getForecast: async (cropType: string, timeframe: '7d' | '15d'): Promise<ApiResponse<PricePredictionOutcome>> => {
    const days = timeframe === '7d' ? 7 : 15;
    const basePrice = cropType === 'Onion' ? 2450 : cropType === 'Grape' ? 7500 : 1800;
    
    // Feature weights specific to Nashik region
    const explainability: FeatureImportance[] = [
      { feature: 'Export Demand (UAE/Europe)', weight: 0.42, impact: 'positive' },
      { feature: 'Lasalgaon Mandi Arrivals', weight: 0.28, impact: 'negative' },
      { feature: 'Fuel Prices (Transport Cost)', weight: 0.15, impact: 'negative' },
      { feature: 'Monsoon Soil Moisture (Crop Stress)', weight: 0.10, impact: 'positive' },
      { feature: 'Festival Proximity (Diwali/Holi)', weight: 0.05, impact: 'positive' }
    ];

    const predictions: PricePredictionPoint[] = Array.from({ length: days }).map((_, i) => {
      const date = new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0];
      const variance = Math.sin(i * 0.5) * (basePrice * 0.05);
      const pred = basePrice + variance + (Math.random() * 50);
      
      return {
        date,
        predictedPrice: Math.round(pred),
        confidenceUpper: Math.round(pred * 1.08),
        confidenceLower: Math.round(pred * 0.92)
      };
    });

    const outcome: PricePredictionOutcome = {
      cropId: 'c-predict-99',
      cropType,
      timeframe,
      predictions,
      metrics: {
        mape: 4.8, // 4.8% error rate is excellent for vertex AI AutoML
        baselineMape: 12.5, // Naive models (seasonal averages) are 12.5% off
        lastRetrained: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      explainability
    };

    return api.wrapSuccess(outcome);
  }
};