import { z } from 'zod';
import { api } from '../../lib/apiClient';
import { Crop, ApiResponse, Activity, CostRecord } from '../../types';
import { generateMilestones } from '../../utils/agronomy';

export const CropSchema = z.object({
  userId: z.string(),
  cropType: z.string().min(2),
  variety: z.string(),
  plantingDate: z.string(),
  farmSize: z.number().positive(),
  plotLocation: z.string().optional(),
  irrigationMethod: z.enum(['drip', 'sprinkler', 'flood']),
  healthScore: z.number().min(0).max(100).optional(),
  soilData: z.object({
    ph: z.number().optional(),
    nitrogen: z.number().optional(),
    phosphorus: z.number().optional(),
    potassium: z.number().optional(),
  }).optional(),
  targetYield: z.number().optional().default(10),
});

const mockImages = [
  'https://images.unsplash.com/photo-1595304033282-3e28be636d14?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1596373809653-e5786a51d8b9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800'
];

export const CropsApi = {
  getByUser: async (userId: string): Promise<ApiResponse<Crop[]>> => {
    const crops: Crop[] = [
      {
        cropId: 'c1',
        userId,
        cropType: 'Grape',
        variety: 'Thompson Seedless',
        plantingDate: '2023-11-15',
        currentStage: 'Fruit Set',
        farmSize: 4.5,
        plotLocation: 'East Block - Hill Side',
        irrigationMethod: 'drip',
        healthScore: 92,
        lastAnalysis: '2024-03-10',
        milestones: generateMilestones('Grape', '2023-11-15'),
        yieldHistory: [
          { season: 'Rabi 2022', amount: 12.5, unit: 'Tons' },
          { season: 'Rabi 2021', amount: 11.2, unit: 'Tons' }
        ],
        soilData: { ph: 7.2, nitrogen: 45, phosphorus: 22, potassium: 180 },
        activities: [
          { id: 'a1', type: 'Irrigated', date: '2024-03-12', notes: 'Standard cycle, 4 hours' },
          { id: 'a2', type: 'Pruned', date: '2024-02-15', notes: 'Winter cleaning complete' }
        ],
        costs: [
          { id: 'co1', category: 'Fertilizer', amount: 15000, date: '2024-01-10' },
          { id: 'co2', category: 'Labor', amount: 8000, date: '2024-02-05' }
        ],
        targetYield: 45,
        images: [mockImages[0], mockImages[2]]
      },
      {
        cropId: 'c2',
        userId,
        cropType: 'Onion',
        variety: 'Bhima Super',
        plantingDate: '2024-01-10',
        currentStage: 'Vegetative',
        farmSize: 2.0,
        plotLocation: 'Central Valley',
        irrigationMethod: 'drip',
        healthScore: 78,
        lastAnalysis: '2024-03-08',
        milestones: generateMilestones('Onion', '2024-01-10'),
        yieldHistory: [
          { season: 'Kharif 2023', amount: 8.4, unit: 'Tons' }
        ],
        soilData: { ph: 6.8, nitrogen: 38, phosphorus: 19, potassium: 165 },
        activities: [
          { id: 'a3', type: 'Fertilized', date: '2024-03-05', notes: 'DAP 50kg applied' }
        ],
        costs: [
          { id: 'co3', category: 'Seeds', amount: 4500, date: '2024-01-05' }
        ],
        targetYield: 30,
        images: [mockImages[1]]
      }
    ];
    return api.wrapSuccess(crops);
  },

  create: async (data: any): Promise<ApiResponse<Crop>> => {
    const validated = CropSchema.parse(data);
    const newCrop: Crop = {
      cropId: Math.random().toString(36).substr(2, 9),
      userId: validated.userId,
      cropType: validated.cropType,
      variety: validated.variety,
      plantingDate: validated.plantingDate,
      farmSize: validated.farmSize,
      irrigationMethod: validated.irrigationMethod,
      targetYield: validated.targetYield,
      ...validated,
      currentStage: 'Seedling',
      healthScore: 100,
      milestones: generateMilestones(validated.cropType, validated.plantingDate),
      lastAnalysis: new Date().toISOString(),
      activities: [],
      costs: [],
      images: [mockImages[Math.floor(Math.random() * mockImages.length)]]
    };
    return api.request<Crop>('/api/crops', 'POST', newCrop);
  },

  addActivity: async (cropId: string, activity: Omit<Activity, 'id'>): Promise<ApiResponse<Activity>> => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      ...activity
    };
    return api.wrapSuccess(newActivity);
  },

  addCost: async (cropId: string, cost: Omit<CostRecord, 'id'>): Promise<ApiResponse<CostRecord>> => {
    const newCost: CostRecord = {
      id: Math.random().toString(36).substr(2, 9),
      ...cost
    };
    return api.wrapSuccess(newCost);
  },

  delete: async (cropId: string): Promise<ApiResponse<void>> => {
    return api.request<void>(`/api/crops/${cropId}`, 'DELETE');
  }
};
