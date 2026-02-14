import { api } from '../../lib/apiClient';
import { SuccessStory, ApiResponse, StoryCategory } from '../../types';

let mockStories: SuccessStory[] = [
  {
    id: 's1',
    farmerName: 'Vikas Kadam',
    location: 'Niphad, Nashik',
    cropType: 'Grape',
    category: 'Irrigation',
    title: 'Precision Drip for Export Grapes',
    problem: 'Excessive water usage in loamy soil led to bunch rot and high input costs.',
    solution: 'Implemented AgriSmart AI scheduled fertigation and real-time soil moisture monitoring.',
    result: 'Reduced water consumption by 32% while increasing export quality yield by 15%.',
    metrics: [
      { label: 'Yield Growth', value: '+15%', improvement: '2.4 Tons/Acre increase' },
      { label: 'Water Saved', value: '32%', improvement: '2M Liters per season' },
      { label: 'Export Grade', value: '92%', improvement: 'from 78%' }
    ],
    steps: [
      { title: 'Baseline Audit', description: 'Used the platform to map historical soil data and moisture drift.' },
      { title: 'Scheduler Setup', description: 'Configured automated fertigation intervals based on fruit-set phase.' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1595304033282-3e28be636d14?auto=format&fit=crop&q=80&w=1000',
    beforeImageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=1000',
    likes: 124,
    shares: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 's2',
    farmerName: 'Sunita Patil',
    location: 'Dindori, Nashik',
    cropType: 'Onion',
    category: 'Market',
    title: 'Timing the Lasalgaon Peak',
    problem: 'Selling immediately after harvest led to poor price realization during glut.',
    solution: 'Used Price Prediction models to identify a 15-day storage window before festival demand.',
    result: 'Capturing ₹2,850/quintal vs ₹1,900/quintal local rate.',
    metrics: [
      { label: 'Revenue Boost', value: '₹4.2L', improvement: '+48% higher realization' },
      { label: 'Waste Reduction', value: '12%', improvement: 'Proper curing advice used' }
    ],
    steps: [
      { title: 'Trend Monitor', description: 'Watched price volatility index for 3 weeks using Analytics tab.' },
      { title: 'Curing Logic', description: 'Followed AI curing tips to prevent bulb rot during storage.' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1596373809653-e5786a51d8b9?auto=format&fit=crop&q=80&w=1000',
    likes: 89,
    shares: 32,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const StoriesApi = {
  getStories: async (category?: StoryCategory): Promise<ApiResponse<SuccessStory[]>> => {
    let results = [...mockStories];
    if (category) results = results.filter(s => s.category === category);
    return api.wrapSuccess(results);
  },

  submitStory: async (story: Partial<SuccessStory>): Promise<ApiResponse<SuccessStory>> => {
    const newStory: SuccessStory = {
      id: Math.random().toString(36).substr(2, 9),
      farmerName: 'Current User',
      location: 'Nashik, MH',
      cropType: story.cropType || 'General',
      category: story.category || 'Tech Adoption',
      title: story.title || '',
      problem: story.problem || '',
      solution: story.solution || '',
      result: story.result || '',
      metrics: story.metrics || [],
      steps: story.steps || [],
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1000',
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString()
    };
    mockStories.unshift(newStory);
    return api.wrapSuccess(newStory);
  },

  likeStory: async (id: string): Promise<ApiResponse<void>> => {
    const s = mockStories.find(item => item.id === id);
    if (s) s.likes++;
    return api.wrapSuccess(undefined);
  }
};
