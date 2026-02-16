import { supabase } from '../../lib/supabase';
import { User, ApiResponse } from '../../types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  location: {
    village: string;
    ward: string;
  };
  cropVarieties: string[];
  language?: 'en' | 'hi' | 'mr';
}

export interface SignInData {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

export const SupabaseAuth = {
  // Email/Password Sign Up
  signUp: async (data: SignUpData): Promise<ApiResponse<{ user: any; session: any }>> => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            location: data.location,
            cropVarieties: data.cropVarieties,
            language: data.language || 'en'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Save user profile to database
      if (authData.user) {
        const userProfile: Partial<User> = {
          userId: authData.user.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          language: data.language || 'en',
          role: 'FARMER' as any,
          location: data.location,
          farmDetails: {
            crops: [],
            cropVarieties: data.cropVarieties,
            size: 0,
            irrigation: 'drip',
            soilType: 'Black'
          },
          preferences: {
            notifications: true,
            notificationChannels: { push: true, sms: true, voice: false },
            alertThresholds: { critical: true, warning: true, advisory: true },
            quietHours: { enabled: false, start: "22:00", end: "06:00" },
            categorySettings: { weather: true, market: true, community: true, advisory: true },
            units: 'metric'
          },
          createdAt: new Date().toISOString()
        };

        // Save to Supabase users table
        const { error: profileError } = await supabase.from('users').insert([userProfile]);

        if (profileError) {
          console.error('Error saving user profile:', profileError);
        }
      }

      return {
        success: true,
        data: {
          user: authData.user,
          session: authData.session
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign up failed' };
    }
  },

  // Email/Password Sign In
  signInWithPassword: async (email: string, password: string): Promise<ApiResponse<{ user: any; session: any }>> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        localStorage.setItem('agri_smart_token', data.session.access_token);
        localStorage.setItem('agri_smart_refresh_token', data.session.refresh_token);
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign in failed' };
    }
  },

  // Google OAuth Sign In removed intentionally

  // Phone OTP Sign In
  sendOTP: async (phone: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+91${phone}`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: { message: 'OTP sent successfully' }
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  // Verify OTP
  verifyOTP: async (phone: string, otp: string): Promise<ApiResponse<{ user: any; session: any }>> => {
    try {
      // In real implementation, this would verify the OTP
      // For now, we'll simulate it
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+91${phone}`
      });

      // Mock OTP verification
      if (otp === '123456' || otp.length === 6) {
        const mockSession = {
          access_token: 'mock_token_' + Math.random().toString(36),
          refresh_token: 'mock_refresh_' + Math.random().toString(36),
          user: {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            phone: phone.startsWith('+') ? phone : `+91${phone}`
          }
        };

        localStorage.setItem('agri_smart_token', mockSession.access_token);
        localStorage.setItem('agri_smart_refresh_token', mockSession.refresh_token);

        return {
          success: true,
          data: {
            user: mockSession.user,
            session: mockSession
          }
        };
      }

      return { success: false, error: 'Invalid OTP' };
    } catch (error: any) {
      return { success: false, error: error.message || 'OTP verification failed' };
    }
  },

  // Password Reset
  resetPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: { message: 'Password reset email sent' }
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  },

  // Sign Out
  signOut: async (): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      localStorage.removeItem('agri_smart_token');
      localStorage.removeItem('agri_smart_refresh_token');

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign out failed' };
    }
  },

  // Get Current Session
  getSession: async (): Promise<ApiResponse<{ session: any }>> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: { session: data.session }
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get session' };
    }
  },

  // Get User Profile
  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as User
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get profile' };
    }
  },

  // Update User Profile
  updateProfile: async (userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('userId', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as User
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }
};