import { api } from '../../lib/apiClient';
import { BackgroundJob, SystemEvent, ApiResponse, JobStatus } from '../../types';

let mockJobs: BackgroundJob[] = [
  {
    id: 'job-1',
    name: 'Weather Sync (Nashik)',
    description: 'Polls regional AWS nodes for Ward-level weather telemetry.',
    schedule: '0 */6 * * *',
    status: 'IDLE',
    lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
    nextRun: new Date(Date.now() + 3600000 * 4).toISOString(),
    avgDurationMs: 1240,
    successRate: 99.8
  },
  {
    id: 'job-2',
    name: 'Mandi Price Crawler',
    description: 'Aggregates modal prices from eNAM and Agmarknet for MH region.',
    schedule: '0 8-18/2 * * *',
    status: 'IDLE',
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString(),
    avgDurationMs: 4500,
    successRate: 98.5
  },
  {
    id: 'job-3',
    name: 'Bulk Advisory Gen',
    description: 'Triggers Gemini 1.5 Pro personalized advisory generation for all active farmers.',
    schedule: '0 5 * * *',
    status: 'IDLE',
    lastRun: new Date(new Date().setHours(5,0,0,0)).toISOString(),
    nextRun: new Date(new Date().setHours(5,0,0,0) + 86400000).toISOString(),
    avgDurationMs: 120000,
    successRate: 94.2
  },
  {
    id: 'job-4',
    name: 'ML Model Retraining',
    description: 'Weekly Vertex AI AutoML cycle for price prediction models.',
    schedule: '0 0 * * 0',
    status: 'IDLE',
    lastRun: new Date(Date.now() - 86400000 * 3).toISOString(),
    nextRun: new Date(Date.now() + 86400000 * 4).toISOString(),
    avgDurationMs: 1800000,
    successRate: 100
  },
  {
    id: 'job-5',
    name: 'DB Cleanup & Archival',
    description: 'Moves historical sensor data > 1yr to Coldline Storage.',
    schedule: '0 0 1 * *',
    status: 'IDLE',
    lastRun: '2024-05-01T00:00:00Z',
    nextRun: '2024-06-01T00:00:00Z',
    avgDurationMs: 600000,
    successRate: 100
  }
];

let systemEvents: SystemEvent[] = [
  {
    id: 'evt-1',
    timestamp: new Date().toISOString(),
    type: 'CLIMATE_ALERT',
    message: 'Extreme Temperature Trigger (38C) detected in Niphad block.',
    source: 'WeatherEngine-V2',
    severity: 'CRITICAL'
  }
];

export const JobApi = {
  getJobs: async (): Promise<ApiResponse<BackgroundJob[]>> => {
    return api.wrapSuccess(mockJobs);
  },

  getEvents: async (): Promise<ApiResponse<SystemEvent[]>> => {
    return api.wrapSuccess([...systemEvents].reverse());
  },

  triggerJob: async (jobId: string): Promise<ApiResponse<void>> => {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'RUNNING';
      // Simulate run
      setTimeout(() => {
        job.status = 'SUCCESS';
        job.lastRun = new Date().toISOString();
        systemEvents.push({
          id: Math.random().toString(36).substr(2, 5),
          timestamp: new Date().toISOString(),
          type: 'USER_ACTION',
          message: `Manual trigger: ${job.name} completed successfully.`,
          source: 'AdminPortal',
          severity: 'INFO'
        });
      }, 2000);
    }
    return api.wrapSuccess(undefined);
  },

  pushEvent: async (event: Omit<SystemEvent, 'id' | 'timestamp'>): Promise<ApiResponse<SystemEvent>> => {
    const newEvt: SystemEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    systemEvents.push(newEvt);
    return api.wrapSuccess(newEvt);
  }
};