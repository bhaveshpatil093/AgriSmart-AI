
import { api } from '../../lib/apiClient';
import { WeatherImpactAssessment, DamageReport, ApiResponse, Crop, WeatherData } from '../../types';

export const ImpactApi = {
  /**
   * Risk Assessment Engine: Identifies vulnerabilities for Nashik specialties.
   */
  getAssessment: async (crop: Crop, weather: WeatherData): Promise<ApiResponse<WeatherImpactAssessment>> => {
    let riskScore = 15; // Base seasonal risk
    const vulnerabilities: WeatherImpactAssessment['vulnerabilities'] = [];
    
    // 1. Grape Specific: Frost & Hail
    if (crop.cropType === 'Grape') {
      if (weather.temperature < 6) {
        riskScore += 45;
        vulnerabilities.push({
          factor: 'Frost Burn',
          description: 'Nashik winter dip below 6°C risks dormant bud damage.',
          impact: 'High'
        });
      }
      if (weather.alerts.some(a => a.type === 'hail')) {
        riskScore += 55;
        vulnerabilities.push({
          factor: 'Berry Cracking',
          description: 'Physical hail impact on maturing Thompson bunches.',
          impact: 'High'
        });
      }
    }

    // 2. Onion Specific: Waterlogging
    if (crop.cropType === 'Onion') {
      const rain24h = weather.hourlyForecast.slice(0, 24).reduce((s, h) => s + h.rainfall, 0);
      if (rain24h > 40) {
        riskScore += 40;
        vulnerabilities.push({
          factor: 'Bulb Rot',
          description: 'Heavy rain in black soil causes waterlogging and fungal infection.',
          impact: 'High'
        });
      }
    }

    // 3. Tomato Specific: Heat Stress
    if (crop.cropType === 'Tomato' && weather.temperature > 39) {
      riskScore += 35;
      vulnerabilities.push({
        factor: 'Flower Drop',
        description: 'Pollen sterility due to extreme afternoon heat.',
        impact: 'Medium'
      });
    }

    const riskLevel: WeatherImpactAssessment['riskLevel'] = 
      riskScore > 70 ? 'Critical' :
      riskScore > 45 ? 'High' :
      riskScore > 20 ? 'Moderate' : 'Low';

    const assessment: WeatherImpactAssessment = {
      cropId: crop.cropId,
      cropName: `${crop.cropType} (${crop.variety})`,
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      potentialYieldLoss: Math.round(riskScore * 0.7),
      vulnerabilities,
      protectiveMeasures: [
        'Apply Boron-based sprays to strengthen cell walls',
        'Use plastic mulch to prevent soil splashing',
        'Secure anti-hail nets over primary vineyard blocks'
      ],
      recoverySteps: [
        'Light dosage of foliar Urea for vegetative recovery',
        'Apply curative systemic fungicide within 24h of impact',
        'Clear silt from drainage channels immediately'
      ]
    };

    return api.wrapSuccess(assessment);
  },

  reportDamage: async (report: Omit<DamageReport, 'id' | 'status'>): Promise<ApiResponse<DamageReport>> => {
    return api.request<DamageReport>('/api/damage-reports', 'POST', {
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      ...report
    });
  },

  getReports: async (userId: string): Promise<ApiResponse<DamageReport[]>> => {
    return api.wrapSuccess([
      {
        id: 'dr-n-01',
        cropId: 'c1',
        incidentDate: '2024-01-15',
        weatherType: 'Frost',
        estimatedLoss: 12,
        notes: 'Frost recorded in Niphad sub-district block.',
        status: 'Verified'
      }
    ]);
  }
};
