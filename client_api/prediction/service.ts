
import { api } from '../../lib/apiClient';
import { PredictionOutcome, ApiResponse, RainfallPrediction } from '../../types';

export const PredictionApi = {
  /**
   * Simulates a request to Vertex AI Prediction Endpoint.
   */
  getRainfallForecast: async (location: string, timeframe: '24h' | '48h' | '7d'): Promise<ApiResponse<PredictionOutcome>> => {
    const hours = timeframe === '24h' ? 24 : timeframe === '48h' ? 48 : 168;
    const interval = timeframe === '7d' ? 24 : 1; // Hourly for 24h/48h, daily for 7d
    const points = Math.ceil(hours / interval);

    const predictions: RainfallPrediction[] = Array.from({ length: points }).map((_, i) => {
      const ts = new Date(Date.now() + i * interval * 3600000);
      const base = Math.random() * 5;
      const pred = base + (Math.random() * 2 - 1); // Model variance
      return {
        timestamp: ts.toLocaleTimeString([], timeframe === '7d' ? { weekday: 'short' } : { hour: '2-digit' }),
        predictedRainfall: Math.max(0, parseFloat(pred.toFixed(2))),
        baselineRainfall: Math.max(0, parseFloat(base.toFixed(2))),
        probability: 0.2 + Math.random() * 0.6,
        confidenceInterval: [Math.max(0, pred - 0.5), pred + 0.5]
      };
    });

    const outcome: PredictionOutcome = {
      timeframe,
      predictions,
      evaluation: {
        modelId: 'vertex-rain-forecaster-v2',
        version: '2.4.1-alpha',
        rmse: 0.42,
        mae: 0.31,
        accuracyScore: 0.94,
        lastRetrained: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      explanation: "Model detected a localized low-pressure trough combined with an 18% spike in tropospheric humidity. High correlation with historical rainfall events in the Nashik sub-region."
    };

    return api.wrapSuccess(outcome);
  }
};
