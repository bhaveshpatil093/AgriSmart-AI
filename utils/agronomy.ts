
import { CropMilestone } from '../types';

export interface StageInfo {
  name: string;
  dapRange: [number, number]; // Days After Planting
  description: string;
}

const CROP_STAGES: Record<string, StageInfo[]> = {
  'Grape': [
    { name: 'Sprouting', dapRange: [0, 15], description: 'Bud burst and initial leaf emergence.' },
    { name: 'Vegetative', dapRange: [15, 45], description: 'Rapid shoot growth and leaf area development.' },
    { name: 'Flowering', dapRange: [45, 65], description: 'Inflorescence development and blooming.' },
    { name: 'Fruit Set', dapRange: [65, 90], description: 'Berries begin to grow after pollination.' },
    { name: 'Ripening', dapRange: [90, 120], description: 'Color change (veraison) and sugar accumulation.' },
    { name: 'Harvest', dapRange: [120, 150], description: 'Optimal maturity reached for picking.' },
  ],
  'Onion': [
    { name: 'Establishment', dapRange: [0, 20], description: 'Rooting and initial leaf sprout.' },
    { name: 'Vegetative', dapRange: [20, 50], description: 'Folliage growth and nutrient accumulation.' },
    { name: 'Bulb Initiation', dapRange: [50, 80], description: 'Bulb begins to swell at the base.' },
    { name: 'Bulb Development', dapRange: [80, 110], description: 'Rapid bulb enlargement.' },
    { name: 'Maturity', dapRange: [110, 135], description: 'Leaves begin to fall (neck fall).' },
  ],
  'Tomato': [
    { name: 'Establishment', dapRange: [0, 15], description: 'Transplant recovery and rooting.' },
    { name: 'Vegetative', dapRange: [15, 35], description: 'Branching and height increase.' },
    { name: 'Flowering', dapRange: [35, 55], description: 'First clusters of yellow flowers appear.' },
    { name: 'Fruit Set', dapRange: [55, 85], description: 'Fruit development from green to orange.' },
    { name: 'Harvesting', dapRange: [85, 120], description: 'Fruit turns red and ready for picking.' },
  ],
};

export const calculateCropStage = (cropType: string, plantingDate: string) => {
  const start = new Date(plantingDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const dap = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const stages = CROP_STAGES[cropType] || CROP_STAGES['Tomato']; // Default to Tomato
  const currentStage = stages.find(s => dap >= s.dapRange[0] && dap < s.dapRange[1]) || stages[stages.length - 1];

  return {
    dap,
    stageName: currentStage.name,
    description: currentStage.description,
    nextStage: stages[stages.indexOf(currentStage) + 1]?.name || 'Finished',
    progress: Math.min(100, Math.round((dap / stages[stages.length - 1].dapRange[1]) * 100))
  };
};

export const generateMilestones = (cropType: string, plantingDate: string): CropMilestone[] => {
  const start = new Date(plantingDate);
  const stages = CROP_STAGES[cropType] || CROP_STAGES['Tomato'];
  const now = new Date();

  return stages.map(s => {
    const expected = new Date(start);
    expected.setDate(start.getDate() + s.dapRange[0]);
    
    let status: 'pending' | 'active' | 'completed' = 'pending';
    if (now >= expected) {
      const nextExpected = new Date(start);
      nextExpected.setDate(start.getDate() + s.dapRange[1]);
      status = now < nextExpected ? 'active' : 'completed';
    }

    return {
      stage: s.name,
      expectedDate: expected.toISOString(),
      status
    };
  });
};
