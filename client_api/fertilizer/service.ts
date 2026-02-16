import { api } from '../../lib/apiClient';
import { NutrientAdvisory, ApiResponse, Crop, SoilTestData } from '../../types';

export const FertilizerApi = {
  getAdvisory: async (crop: Crop): Promise<ApiResponse<NutrientAdvisory>> => {
    const soil = crop.soilData || { ph: 7.2, nitrogen: 45, phosphorus: 22, potassium: 180 };
    
    // Logic for nutrient needs based on crop type
    const needsMap: Record<string, any[]> = {
      'Grape': [
        { nutrient: 'N', label: 'Nitrogen', requirement: 120, current: (soil.nitrogen || 0) / 1.5 },
        { nutrient: 'P', label: 'Phosphorus', requirement: 60, current: (soil.phosphorus || 0) * 1.2 },
        { nutrient: 'K', label: 'Potassium', requirement: 200, current: (soil.potassium || 0) / 2.5 },
        { nutrient: 'B', label: 'Boron', requirement: 2, current: 40 },
        { nutrient: 'Mg', label: 'Magnesium', requirement: 15, current: 85 }
      ],
      'Tomato': [
        { nutrient: 'N', label: 'Nitrogen', requirement: 150, current: (soil.nitrogen || 0) / 1.8 },
        { nutrient: 'P', label: 'Phosphorus', requirement: 80, current: (soil.phosphorus || 0) },
        { nutrient: 'K', label: 'Potassium', requirement: 180, current: (soil.potassium || 0) / 2 },
        { nutrient: 'Ca', label: 'Calcium', requirement: 25, current: 60 }
      ],
      'Onion': [
        { nutrient: 'N', label: 'Nitrogen', requirement: 100, current: (soil.nitrogen || 0) / 1.2 },
        { nutrient: 'P', label: 'Phosphorus', requirement: 50, current: (soil.phosphorus || 0) * 1.5 },
        { nutrient: 'K', label: 'Potassium', requirement: 100, current: (soil.potassium || 0) / 1.2 }
      ]
    };

    const activeNeeds = needsMap[crop.cropType] || needsMap['Grape'];
    
    const nutrientNeeds = activeNeeds.map(n => ({
      nutrient: n.nutrient,
      label: n.label,
      requirementKgPerAcre: n.requirement,
      currentLevel: Math.min(Math.max(n.current, 10), 100),
      deficiency: n.current < 40 ? 'Severe' : n.current < 75 ? 'Marginal' : 'None'
    }));

    const advisory: NutrientAdvisory = {
      cropId: crop.cropId,
      cropName: `${crop.cropType} (${crop.variety})`,
      soilPh: soil.ph || 7.0,
      nutrientNeeds: nutrientNeeds as any[],
      schedule: [
        {
          id: 'fert-1',
          dap: 15,
          date: '2024-05-25',
          productName: 'Urea (46% N)',
          dosage: 25,
          unit: 'kg/acre',
          method: 'Broadcasting',
          status: 'pending'
        },
        {
          id: 'fert-2',
          dap: 45,
          date: '2024-06-25',
          productName: '19:19:19 NPK',
          dosage: 5,
          unit: 'kg/acre',
          method: 'Fertigation',
          status: 'pending'
        },
        {
          id: 'fert-3',
          dap: 60,
          date: '2024-07-10',
          productName: 'Potassium Schoenite',
          dosage: 500,
          unit: 'g/liter',
          method: 'Foliar Spray',
          status: 'pending'
        }
      ],
      organicAlternatives: [
        'Well-decomposed Farm Yard Manure (10 tons/acre)',
        'Vermicompost enriched with Trichoderma (2 tons/acre)',
        'Green Manure (Dhaincha) before main crop'
      ],
      costAnalysis: {
        estimatedTotalCost: 8500 * crop.farmSize,
        expectedRoi: 3.2 // 3.2x return on fertilizer spend
      }
    };

    return api.wrapSuccess(advisory);
  }
};