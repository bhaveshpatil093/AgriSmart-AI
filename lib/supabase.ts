// Supabase client configuration
// Note: Replace with your actual Supabase project URL and anon key
// These should be set as environment variables in production

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// For now, we'll create a mock Supabase client that can be replaced with the real one
// To use real Supabase, install: npm install @supabase/supabase-js

export interface SupabaseClient {
  auth: {
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<any>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<any>;
    // signInWithOAuth removed - Google OAuth not supported
    signInWithOtp: (options: { phone?: string; email?: string }) => Promise<any>;
    signOut: () => Promise<void>;
    resetPasswordForEmail: (email: string, options?: any) => Promise<any>;
    getSession: () => Promise<any>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: any }, unsubscribe: () => void };
    getUser: () => Promise<any>;
  };
  from: (table: string) => any;
}

// Mock Supabase implementation for development
// Replace this with actual Supabase client when ready
class MockSupabaseClient implements SupabaseClient {
  auth = {
    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          user: {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            email: credentials.email,
            phone: credentials.options?.data?.phone || null
          },
          session: {
            access_token: 'mock_token_' + Math.random().toString(36),
            refresh_token: 'mock_refresh_' + Math.random().toString(36)
          }
        },
        error: null
      };
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          user: {
            id: 'user_123',
            email: credentials.email
          },
          session: {
            access_token: 'mock_token_' + Math.random().toString(36),
            refresh_token: 'mock_refresh_' + Math.random().toString(36)
          }
        },
        error: null
      };
    },
    // Google OAuth removed - only Email/Password and Phone/OTP authentication supported
    signInWithOtp: async (options: { phone?: string; email?: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          message: 'OTP sent successfully',
          phone: options.phone,
          email: options.email
        },
        error: null
      };
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { error: null };
    },
    resetPasswordForEmail: async (email: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: { message: 'Password reset email sent' },
        error: null
      };
    },
    getSession: async () => {
      const token = localStorage.getItem('agri_smart_token');
      if (token) {
        return {
          data: {
            session: {
              access_token: token,
              user: {
                id: 'user_123',
                email: 'user@example.com'
              }
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock subscription
      return {
        data: { subscription: null },
        unsubscribe: () => {}
      };
    },
    getUser: async () => {
      const token = localStorage.getItem('agri_smart_token');
      if (token) {
        return {
          data: {
            user: {
              id: 'user_123',
              email: 'user@example.com'
            }
          },
          error: null
        };
      }
      return { data: { user: null }, error: null };
    }
  };
  from = (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        data: async () => ({ data: [], error: null })
      }),
      data: async () => ({ data: [], error: null })
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => ({ data, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: (columns?: string) => ({
          single: async () => ({ data, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        data: async () => ({ data: [], error: null })
      })
    })
  });
}

// Export Supabase client
// To use real Supabase, uncomment and install @supabase/supabase-js:
/*
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
*/

// For now, use mock client
export const supabase: SupabaseClient = new MockSupabaseClient() as any;
