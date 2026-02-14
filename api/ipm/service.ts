import { api } from '../../lib/apiClient';
import { IPMSummary, IPMTask, SprayLogEntry, ApiResponse, Crop } from '../../types';

export const IPMApi = {
  getSummary: async (crop: Crop): Promise<ApiResponse<IPMSummary>> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Mock IPM Tasks based on Nashik region seasonal pests
    const tasks: IPMTask[] = [
      {
        id: 'ipm-t1',
        title: 'Mealybug Barrier Installation',
        category: 'Mechanical',
        description: 'Apply sticky grease bands around the main trunk to prevent ant-aided mealybug migration.',
        recommendedDate: today,
        status: 'pending',
        pestTarget: 'Mealybug'
      },
      {
        id: 'ipm-t2',
        title: 'Trichogramma Card Deployment',
        category: 'Biological',
        description: 'Install 50 cards per acre to naturally control Fruit Borer population.',
        recommendedDate: today,
        status: 'pending',
        pestTarget: 'Fruit Borer'
      },
      {
        id: 'ipm-t3',
        title: 'Sanitation: Debris Removal',
        category: 'Cultural',
        description: 'Remove fallen fruits and leaves from previous cycle to eliminate overwintering pupae.',
        recommendedDate: today,
        status: 'completed',
        pestTarget: 'Multiple Pests'
      }
    ];

    const logs: SprayLogEntry[] = [
      {
        id: 'log-01',
        date: '2024-05-10',
        productName: 'Abamectin 1.8% EC',
        activeIngredient: 'Abamectin',
        dosage: '1.5ml / Liter',
        targetPest: 'Mites',
        weatherAtTime: 'Sunny, 28C, Low Wind',
        phiDays: 7,
        reiHours: 24,
        operatorName: 'Sanjay Patil',
        effectiveness: 'High'
      }
    ];

    return api.wrapSuccess({
      cropId: crop.cropId,
      cropName: `${crop.cropType} (${crop.variety})`,
      tasks,
      logs,
      complianceScore: 82,
      chemicalDependency: 25
    });
  },

  logSpray: async (log: Omit<SprayLogEntry, 'id'>): Promise<ApiResponse<SprayLogEntry>> => {
    return api.request<SprayLogEntry>('/api/ipm/logs', 'POST', {
      id: Math.random().toString(36).substr(2, 9),
      ...log
    });
  }
};