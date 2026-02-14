import { api } from '../../lib/apiClient';
import { PipelineStage, TestCoverage, UATFeedback, LoadTestMetric, ApiResponse } from '../../types';

export const QAApi = {
  getPipeline: async (): Promise<ApiResponse<PipelineStage[]>> => {
    return api.wrapSuccess([
      { id: '1', name: 'Lint & Prettier', status: 'SUCCESS', durationMs: 4500, logs: ['All files formatted.', 'No lint errors found.'] },
      { id: '2', name: 'Unit Tests (Jest)', status: 'SUCCESS', durationMs: 12400, logs: ['PASS  api/crops/service.test.ts', 'PASS  utils/agronomy.test.ts', '42 tests passed.'] },
      { id: '3', name: 'Security Audit', status: 'SUCCESS', durationMs: 8200, logs: ['Scanning for dependencies...', 'No vulnerabilities found.'] },
      { id: '4', name: 'Build (Next.js)', status: 'RUNNING', durationMs: 35000, logs: ['Creating optimized production build...', 'Compiling...'] },
      { id: '5', name: 'PWA Staging Deploy', status: 'PENDING', durationMs: 0, logs: [] }
    ]);
  },

  getCoverage: async (): Promise<ApiResponse<TestCoverage>> => {
    return api.wrapSuccess({
      unit: 88.4,
      integration: 74.2,
      e2e: 62.5,
      total: 75.03
    });
  },

  getUATFeedback: async (): Promise<ApiResponse<UATFeedback[]>> => {
    return api.wrapSuccess([
      { id: 'f1', userId: 'u101', userName: 'Vikas K.', role: 'Farmer', rating: 5, category: 'Accuracy', comment: 'Crop scanner identified Downy Mildew correctly on the first try.', timestamp: new Date().toISOString() },
      { id: 'f2', userId: 'u202', userName: 'Sunita P.', role: 'Progressive Farmer', rating: 4, category: 'Usability', comment: 'Market Hub is fast, but adding custom alerts took a few taps too many.', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'f3', userId: 'u303', userName: 'Dr. Patil', role: 'Expert', rating: 5, category: 'Feature Request', comment: 'Adding a PHI calculator in the spray registry would be amazing for export compliance.', timestamp: new Date(Date.now() - 172800000).toISOString() }
    ]);
  },

  getLoadMetrics: async (): Promise<ApiResponse<LoadTestMetric>> => {
    return api.wrapSuccess({
      concurrentUsers: 5400,
      avgLatency: 312,
      errorRate: 0.02,
      cpuUsage: 45,
      memoryUsage: 68
    });
  },

  triggerPipeline: async (): Promise<ApiResponse<void>> => {
    return api.wrapSuccess(undefined);
  }
};