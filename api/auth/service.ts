
import { api } from '../../lib/apiClient';
import { ApiResponse, User, UserRole } from '../../types';

export const AuthApi = {
  requestOtp: async (phone: string): Promise<ApiResponse<{ sessionId: string }>> => {
    // Simulating Firebase Auth requestOtp
    return api.request('/api/auth/otp', 'POST', { sessionId: Math.random().toString(36).substr(2, 9) });
  },

  verifyOtp: async (phone: string, otp: string): Promise<ApiResponse<{ token: string; user?: User }>> => {
    // Simulating Firebase Auth verifyOtp
    // In a real app, if user doesn't exist, they proceed to onboarding
    const isReturningUser = phone === '+1234567890';
    
    const mockUser: User = {
      userId: 'u123',
      name: 'Farmer John',
      phone: '+1234567890',
      language: 'en',
      role: UserRole.FARMER,
      location: { village: 'Green Valley', ward: 'West' },
      // Fix: Added missing soilType to mockUser farmDetails
      farmDetails: { crops: ['Corn'], size: 10, irrigation: 'drip', soilType: 'Black' },
      // Fix: Add missing preference fields to satisfy the User type
      preferences: { 
        notifications: true, 
        notificationChannels: { push: true, sms: false, voice: false },
        alertThresholds: { critical: true, warning: true, advisory: true },
        quietHours: { enabled: false, start: "22:00", end: "06:00" },
        categorySettings: { weather: true, market: true, community: true, advisory: true },
        units: 'metric' 
      },
      createdAt: new Date().toISOString()
    };

    const token = btoa(JSON.stringify({ phone, exp: Date.now() + 86400000 }));
    localStorage.setItem('agri_smart_token', token);

    return api.wrapSuccess({
      token,
      user: isReturningUser ? mockUser : undefined
    });
  },

  logout: () => {
    localStorage.removeItem('agri_smart_token');
    window.location.reload();
  },

  getCurrentSession: (): string | null => {
    return localStorage.getItem('agri_smart_token');
  }
};
