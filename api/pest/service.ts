import { api } from '../../lib/apiClient';
import { PestDetection, OutbreakZone, ApiResponse } from '../../types';

let detectionLogs: PestDetection[] = [];

export const PestApi = {
  saveDetection: async (detection: PestDetection): Promise<ApiResponse<PestDetection>> => {
    detectionLogs.push(detection);
    return api.wrapSuccess(detection);
  },

  getRegionalOutbreaks: async (location: string): Promise<ApiResponse<OutbreakZone[]>> => {
    // Simulated outbreak data for Nashik region
    const outbreaks: OutbreakZone[] = [
      { village: 'Ozar', disease: 'Downy Mildew', count: 42, riskLevel: 'High' },
      { village: 'Pimpalgaon', disease: 'Thrips', count: 18, riskLevel: 'Medium' },
      { village: 'Sinnar', disease: 'Late Blight', count: 5, riskLevel: 'Low' }
    ];
    return api.wrapSuccess(outbreaks);
  },

  validateDetection: async (id: string, isValid: boolean): Promise<ApiResponse<void>> => {
    const d = detectionLogs.find(log => log.id === id);
    if (d) d.isVerified = isValid;
    return api.wrapSuccess(undefined);
  }
};