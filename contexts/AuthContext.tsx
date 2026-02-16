
import React, { createContext, useContext, useState, useEffect } from 'react';
// Fix: Import User from ../types instead of ../api/auth/service as it is not available for export from the service
import { User } from '../types';
import { AuthApi } from '../client_api/auth/service';
import { i18n } from '../utils/i18n';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] init: checking localStorage for agri_smart_user');
      // First check for saved user in localStorage
      const savedUser = localStorage.getItem('agri_smart_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          console.log('[AuthContext] init: found saved user, setting user', parsed);
          setUser(parsed);
          // Initialize language from user preference
          if (parsed.language) {
            i18n.setLanguage(parsed.language);
          }
          setIsLoading(false);
          return;
        } catch (err) {
          console.error('[AuthContext] error parsing saved user', err);
        }
      }
      
      // Fallback to token-based auth if no saved user
      const token = localStorage.getItem('agri_smart_token');
      if (token) {
        // In a real app, verify token with backend
        // For now, using mock returning user if token exists
        const mockUser: User = {
          userId: 'u123',
          name: 'Ramesh Patil',
          phone: '+91 98230 12345',
          language: 'mr',
          role: 'FARMER' as any,
          location: { village: 'Pimpalgaon', ward: 'West' },
          farmDetails: { 
            crops: ['Grape', 'Onion'], 
            cropVarieties: ['Thompson', 'Crimson', 'Puna Fursungi', 'Panchganga'],
            size: 4.5, 
            irrigation: 'drip', 
            soilType: 'Black' 
          },
          // Fix: Adding missing quietHours and categorySettings to preferences
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
        setUser(mockUser);
        // Initialize language from user preference
        if (mockUser.language) {
          i18n.setLanguage(mockUser.language);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('agri_smart_token');
    localStorage.removeItem('agri_smart_user');
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
