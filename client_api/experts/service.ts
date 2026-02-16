import { api } from '../../lib/apiClient';
import { ExpertProfile, ExpertQuestion, ConsultationSession, ApiResponse } from '../../types';

let mockExpertQuestions: ExpertQuestion[] = [
  {
    id: 'q1',
    userId: 'u123',
    title: 'Severe bunch rot in Early Sweet Grapes',
    content: 'The berries are turning soft and water-soaked despite preventive sprays. Is this Botrytis?',
    cropType: 'Grape',
    urgency: 'Urgent',
    status: 'Answered',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    answer: {
      expertId: 'exp1',
      content: 'Based on the soft texture, this is likely Botrytis cinerea. Immediate removal of infected clusters and spray of Iprodione is required. Check for high canopy humidity.',
      timestamp: new Date().toISOString(),
      references: [{ title: 'Grape Disease Mgmt Guide', url: '#' }],
      isVerifiedSolution: true
    }
  }
];

export const ExpertApi = {
  getExperts: async (crop?: string): Promise<ApiResponse<ExpertProfile[]>> => {
    const experts: ExpertProfile[] = [
      {
        id: 'exp1',
        name: 'Dr. Sanjay Patil',
        role: 'Pathologist',
        specializations: ['Grape Diseases', 'Fungal Management'],
        credentials: ['PhD Agronomy (MPKV)', 'ICAR Senior Scientist'],
        rating: 4.9,
        reviewCount: 450,
        languages: ['Marathi', 'English', 'Hindi'],
        responseTime: '< 2 Hours',
        availability: [
          { day: 'Monday', slots: ['10:00', '11:00', '15:00'] },
          { day: 'Tuesday', slots: ['09:00', '14:00'] }
        ],
        verified: true,
        bio: 'Leading researcher in Downy Mildew resistance for the Nashik export corridor.'
      },
      {
        id: 'exp2',
        name: 'Ms. Vidya Deshmukh',
        role: 'Soil Scientist',
        specializations: ['Onion Nutrition', 'Salinity Control'],
        credentials: ['MSc Soil Science', 'Extension Officer'],
        rating: 4.7,
        reviewCount: 280,
        languages: ['Marathi', 'Hindi'],
        responseTime: '< 6 Hours',
        availability: [
          { day: 'Wednesday', slots: ['10:00', '11:00'] }
        ],
        verified: true,
        bio: 'Helping smallholders optimize N-P-K ratios for Rabi Onion cultivation.'
      }
    ];

    if (crop) {
      return api.wrapSuccess(experts.filter(e => e.specializations.some(s => s.includes(crop))));
    }
    return api.wrapSuccess(experts);
  },

  askQuestion: async (question: Partial<ExpertQuestion>): Promise<ApiResponse<ExpertQuestion>> => {
    const newQ: ExpertQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'u123',
      title: question.title || '',
      content: question.content || '',
      cropType: question.cropType || 'General',
      urgency: question.urgency || 'Standard',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    mockExpertQuestions.push(newQ);
    return api.wrapSuccess(newQ);
  },

  getQuestions: async (userId: string): Promise<ApiResponse<ExpertQuestion[]>> => {
    return api.wrapSuccess(mockExpertQuestions.filter(q => q.userId === userId));
  },

  bookConsultation: async (session: Omit<ConsultationSession, 'id' | 'status' | 'meetingLink'>): Promise<ApiResponse<ConsultationSession>> => {
    const newSession: ConsultationSession = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'Scheduled',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      ...session
    };
    return api.wrapSuccess(newSession);
  }
};