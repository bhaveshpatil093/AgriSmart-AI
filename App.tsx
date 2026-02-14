import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// View Components
import Dashboard from './components/Dashboard';
import CropScanner from './components/CropScanner';
import CropManagement from './components/CropManagement';
import GrapeAdvisor from './components/GrapeAdvisor';
import OnionAdvisor from './components/OnionAdvisor';
import TomatoAdvisor from './components/TomatoAdvisor';
import NutrientPlanner from './components/NutrientPlanner';
import IPMScheduler from './components/IPMScheduler';

import MarketHub from './components/MarketHub';
import MarketIntelligence from './components/MarketIntelligence';
import HarvestOptimizer from './components/HarvestOptimizer';
import CommunityForum from './components/CommunityForum';
import ExpertHub from './components/ExpertHub';
import VoiceAdvisor from './components/VoiceAdvisor';

import SuccessStories from './components/SuccessStories';
import GovtSchemesHub from './components/GovtSchemesHub';
import PriceAnalytics from './components/PriceAnalytics';
import PriceForecaster from './components/PriceForecaster';

import ClimateInsights from './components/ClimateInsights';
import RainfallForecaster from './components/RainfallForecaster';
import IrrigationManager from './components/IrrigationManager';
import ImpactAssessment from './components/ImpactAssessment';
import OnboardingFlow from './components/OnboardingFlow';
import UserProfile from './components/UserProfile';
import LandingPage from './components/LandingPage';
import NotificationCenter from './components/NotificationCenter';
import ConnectivityBanner from './components/ConnectivityBanner';
import OfflineSettings from './components/OfflineSettings';

import NotificationPreferences from './components/NotificationPreferences';
import NotificationDashboard from './components/NotificationDashboard';
import SystemJobsDashboard from './components/SystemJobsDashboard';
import AdminAnalyticsPortal from './components/AdminAnalyticsPortal';
import QADashboard from './components/QADashboard';

import { AppView, User, UserRole } from './types';
import { NotificationApi } from './api/notifications/service';
import { AnalyticsApi } from './api/analytics/service';

const AppContent: React.FC = () => {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // View Change Tracking for Analytics
  useEffect(() => {
    if (user) {
      AnalyticsApi.logEvent('view_change', { view: currentView, userId: user.userId });
    }
  }, [currentView, user]);

  useEffect(() => {
    if (user) {
      syncNotifications();
      const interval = setInterval(syncNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const syncNotifications = async () => {
    if (!user) return;
    const res = await NotificationApi.getHistory(user.userId);
    if (res.success && res.data) {
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [currentView, user, authLoading, isSidebarCollapsed, isNotificationsOpen, showOnboarding]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Ecosystem...</p>
      </div>
    );
  }

  if (!user && !showOnboarding) {
    return <LandingPage onGetStarted={() => setShowOnboarding(true)} onLogin={() => setShowOnboarding(true)} />;
  }

  if (!user && showOnboarding) {
    return <OnboardingFlow onComplete={(u) => {
      setUser(u);
      setShowOnboarding(false);
      localStorage.setItem('agri_smart_token', 'mock_token');
    }} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.CROP_MANAGEMENT: return <CropManagement />;
      case AppView.GRAPE_ADVISORY: return <GrapeAdvisor />;
      case AppView.ONION_ADVISORY: return <OnionAdvisor />;
      case AppView.TOMATO_ADVISORY: return <TomatoAdvisor />;
      case AppView.NUTRIENT_PLANNER: return <NutrientPlanner />;
      case AppView.IPM_SCHEDULER: return <IPMScheduler />;

      case AppView.MARKET_HUB: return <MarketHub />;
      case AppView.MARKET_INTELLIGENCE: return <MarketIntelligence />;
      case AppView.HARVEST_OPTIMIZER: return <HarvestOptimizer />;
      case AppView.COMMUNITY: return <CommunityForum />;
      case AppView.EXPERT_HUB: return <ExpertHub />;
      case AppView.VOICE_ADVISOR: return <VoiceAdvisor user={user!} />;

      case AppView.SUCCESS_STORIES: return <SuccessStories />;
      case AppView.GOVT_SCHEMES: return <GovtSchemesHub user={user!} />;
      case AppView.PRICE_ANALYTICS: return <PriceAnalytics />;
      case AppView.PRICE_FORECAST: return <PriceForecaster />;
      case AppView.CROP_SCANNER: return <CropScanner />;

      case AppView.CLIMATE_INSIGHTS: return <ClimateInsights />;
      case AppView.PREDICTION: return <RainfallForecaster />;
      case AppView.IRRIGATION: return <IrrigationManager />;
      case AppView.IMPACT: return <ImpactAssessment />;
      case AppView.PROFILE: return <UserProfile user={user!} onUpdate={setUser} setView={setCurrentView} />;
      case AppView.OFFLINE_SETTINGS: return <OfflineSettings />;

      case AppView.NOTIFICATION_SETTINGS: return <NotificationPreferences />;
      case AppView.NOTIFICATION_DASHBOARD: return <NotificationDashboard />;
      case AppView.SYSTEM_JOBS: return <SystemJobsDashboard />;
      case AppView.ADMIN_ANALYTICS: return <AdminAnalyticsPortal />;
      case AppView.QA_DASHBOARD: return <QADashboard />;
      default: return <Dashboard />;
    }
  };

  const isWideContent = [AppView.CLIMATE_INSIGHTS, AppView.PRICE_ANALYTICS, AppView.SUCCESS_STORIES, AppView.NOTIFICATION_DASHBOARD, AppView.SYSTEM_JOBS, AppView.ADMIN_ANALYTICS, AppView.QA_DASHBOARD].includes(currentView);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative">
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        setView={setCurrentView}
      />

      <div className="flex flex-1">
        <Sidebar
          currentView={currentView}
          setView={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className={`flex-1 flex flex-col min-w-0 transition-all ${isSidebarCollapsed ? 'px-8 md:px-12' : 'px-6 md:px-10'} py-10`}>
          <div className={`${isWideContent ? 'max-w-none' : 'max-w-[1400px]'} mx-auto w-full flex-1`}>
            {renderView()}
          </div>
          <Footer />
        </main>
      </div>

      <Navigation currentView={currentView} setView={setCurrentView} />

      <NotificationCenter
        userId={user!.userId}
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          setUnreadCount(0);
        }}
      />

      <ConnectivityBanner />

      {[AppView.DASHBOARD, AppView.CROP_MANAGEMENT].includes(currentView) && (
        <button
          onClick={() => setCurrentView(AppView.CROP_SCANNER)}
          className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-700 transition-transform active:scale-90 border-4 border-white"
        >
          <i data-lucide="camera" className="w-7 h-7"></i>
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  </AuthProvider>
);

export default App;