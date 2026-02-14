
import React, { createContext, useContext, useState, useEffect } from 'react';
// Fix: Import User from ../types instead of ../api/auth/service as it is not available for export from the service
import { User } from '../types';
import { AuthApi } from '../api/auth/service';

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
          farmDetails: { crops: ['Grape', 'Onion'], size: 4.5, irrigation: 'drip', soilType: 'Black' },
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
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('agri_smart_token');
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
