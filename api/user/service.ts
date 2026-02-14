
import { api } from '../../lib/apiClient';
import { User, ApiResponse } from '../../types';

export const UserApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    // Return mock session user
    return api.request('/api/user/profile');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.request('/api/user/profile', 'PUT', data);
  },

  deleteAccount: async (): Promise<ApiResponse<void>> => {
    localStorage.removeItem('agri_smart_token');
    return api.wrapSuccess(undefined);
  },

  exportData: async (): Promise<ApiResponse<{ url: string }>> => {
    return api.wrapSuccess({ url: '#' });
  }
};
