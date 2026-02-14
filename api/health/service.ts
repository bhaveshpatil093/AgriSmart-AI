
import { api } from '../../lib/apiClient';
import { ApiResponse } from '../../types';

export const HealthApi = {
  check: async (): Promise<ApiResponse<{ status: string; uptime: number }>> => {
    return api.wrapSuccess({
      status: 'UP',
      // Fix: performance.now() is the standard way to measure uptime in a browser environment.
      uptime: typeof window !== 'undefined' && window.performance ? window.performance.now() / 1000 : 0
    });
  }
};
