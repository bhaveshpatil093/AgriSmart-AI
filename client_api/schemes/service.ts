import { api } from '../../lib/apiClient';
import { GovtScheme, SchemeApplication, ApiResponse, User } from '../../types';

let mockSchemes: GovtScheme[] = [
  {
    id: 'sch-1',
    name: 'MahaDBT Drip Irrigation Subsidy',
    authority: 'State',
    category: 'Irrigation',
    description: 'Up to 80% subsidy for small and marginal farmers for installing drip irrigation systems in Nashik region.',
    subsidyPercent: 80,
    maxBenefit: '₹65,000 per acre',
    eligibility: { maxLandSize: 5, cropTypes: ['Grape', 'Onion', 'Tomato', 'Horticulture'] },
    documents: ['7/12 Extract', 'Aadhar Card', 'Bank Passbook', 'Quotation from Authorized Dealer'],
    officialUrl: 'https://mahadbt.maharashtra.gov.in/',
    impactScore: 5
  },
  {
    id: 'sch-2',
    name: 'PM-Kisan Samman Nidhi',
    authority: 'Central',
    category: 'Subsidy',
    description: 'Direct income support of ₹6,000 per year in three equal installments to all land-holding farmer families.',
    maxBenefit: '₹6,000 per year',
    eligibility: { cropTypes: ['All'] },
    documents: ['Land Records', 'Aadhar', 'Bank Account'],
    officialUrl: 'https://pmkisan.gov.in/',
    impactScore: 4
  },
  {
    id: 'sch-3',
    name: 'Magel Tyala Shet-Tale (Farm Pond)',
    authority: 'State',
    category: 'Irrigation',
    description: 'Assistance for digging farm ponds to ensure protective irrigation during dry spells.',
    maxBenefit: '₹50,000 subsidy',
    eligibility: { maxLandSize: 10, cropTypes: ['All'] },
    documents: ['7/12', '8-A', 'Caste Certificate (if applicable)'],
    officialUrl: 'https://krishi.maharashtra.gov.in/',
    impactScore: 5
  },
  {
    id: 'sch-4',
    name: 'SMAM: Farm Equipment Subsidy',
    authority: 'Central',
    category: 'Equipment',
    description: 'Subsidy for purchasing tractors, tillers, and sprayers for modernizing farm operations.',
    subsidyPercent: 50,
    maxBenefit: 'Up to ₹2.5 Lakhs',
    eligibility: { cropTypes: ['All'] },
    documents: ['Aadhar', 'Photo', 'Land documents', 'Voter ID'],
    officialUrl: 'https://farmech.dac.gov.in/',
    impactScore: 3
  }
];

let mockApplications: SchemeApplication[] = [
  {
    id: 'app-1',
    schemeId: 'sch-1',
    schemeName: 'MahaDBT Drip Subsidy',
    status: 'Verified',
    appliedDate: '2024-02-15',
    trackingNumber: 'MH-NSK-2024-9021',
    nextStep: 'Field Inspection by Taluka Agriculture Officer',
    lastUpdate: '2024-03-10'
  }
];

export const GovtSchemesApi = {
  getSchemes: async (): Promise<ApiResponse<GovtScheme[]>> => {
    return api.wrapSuccess(mockSchemes);
  },

  getRecommended: async (user: User): Promise<ApiResponse<GovtScheme[]>> => {
    const recommended = mockSchemes.filter(s => {
      // Basic matching logic
      const sizeMatch = !s.eligibility.maxLandSize || user.farmDetails.size <= s.eligibility.maxLandSize;
      const cropMatch = s.eligibility.cropTypes.includes('All') || 
                       user.farmDetails.crops.some(c => s.eligibility.cropTypes.includes(c));
      return sizeMatch && cropMatch;
    });
    return api.wrapSuccess(recommended.sort((a, b) => b.impactScore - a.impactScore));
  },

  getApplications: async (userId: string): Promise<ApiResponse<SchemeApplication[]>> => {
    return api.wrapSuccess(mockApplications);
  },

  applyForScheme: async (schemeId: string): Promise<ApiResponse<SchemeApplication>> => {
    const scheme = mockSchemes.find(s => s.id === schemeId);
    const newApp: SchemeApplication = {
      id: Math.random().toString(36).substr(2, 9),
      schemeId,
      schemeName: scheme?.name || 'New Application',
      status: 'Submitted',
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      nextStep: 'Document verification by District Office'
    };
    mockApplications.unshift(newApp);
    return api.wrapSuccess(newApp);
  }
};
