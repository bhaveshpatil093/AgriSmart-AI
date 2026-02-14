import { api } from '../../lib/apiClient';
import { Notification, ApiResponse, AlertSeverity, NotificationAnalytics, User } from '../../types';

let notificationHistory: Notification[] = [
  {
    id: 'n1',
    userId: 'u123',
    title: 'Welcome to AgriSmart',
    message: 'Your farm profile is now active. Explore climate insights to get started.',
    type: 'system',
    severity: 'advisory',
    isRead: true,
    channel: 'in-app',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

let globalAnalytics: NotificationAnalytics = {
  sent: 1240,
  delivered: 1215,
  opened: 840,
  clicked: 310,
  failed: 25
};

export const NotificationApi = {
  getHistory: async (userId: string): Promise<ApiResponse<Notification[]>> => {
    return api.wrapSuccess([...notificationHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const n = notificationHistory.find(item => item.id === notificationId);
    if (n) {
      n.isRead = true;
      n.openedAt = new Date().toISOString();
      globalAnalytics.opened++;
    }
    return api.wrapSuccess(undefined);
  },

  markAllAsRead: async (userId: string): Promise<ApiResponse<void>> => {
    notificationHistory.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        n.openedAt = new Date().toISOString();
        globalAnalytics.opened++;
      }
    });
    return api.wrapSuccess(undefined);
  },

  getAnalytics: async (): Promise<ApiResponse<NotificationAnalytics>> => {
    return api.wrapSuccess(globalAnalytics);
  },

  /**
   * Task 40: Centralized Delivery Service with Fallback & Priority
   */
  send: async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>, user?: User): Promise<ApiResponse<Notification>> => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 1. Check User Preferences & Quiet Hours
    if (user && user.preferences.quietHours.enabled) {
      const [startH, startM] = user.preferences.quietHours.start.split(':').map(Number);
      const [endH, endM] = user.preferences.quietHours.end.split(':').map(Number);
      
      // Basic check: is current time between start and end?
      const currentMinutes = currentHour * 60 + now.getMinutes();
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      const isDuringQuietHours = startMinutes < endMinutes 
        ? (currentMinutes >= startMinutes && currentMinutes <= endMinutes)
        : (currentMinutes >= startMinutes || currentMinutes <= endMinutes);

      // Bypass quiet hours only for CRITICAL severity
      if (isDuringQuietHours && notification.severity !== 'critical') {
        console.log(`[Priority Queue] Delaying non-critical alert during Quiet Hours: ${notification.title}`);
        return api.wrapSuccess({
          ...notification,
          id: 'queued-' + Math.random().toString(36).substr(2, 5),
          isRead: false,
          createdAt: now.toISOString(),
          message: `${notification.message} (Queued for morning)`
        } as Notification);
      }
    }

    // 2. Channel Fallback Logic
    let primaryChannel = notification.channel;
    let fallbackUsed = false;

    // Simulate FCM delivery attempt
    const fcmSuccess = Math.random() > 0.1; // 90% success for push
    if (!fcmSuccess && primaryChannel === 'push') {
      console.log(`[FCM] Push failed. Routing to SMS Fallback...`);
      primaryChannel = 'sms';
      fallbackUsed = true;
    }

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: now.toISOString(),
      deliveredAt: now.toISOString(),
      ...notification,
      channel: primaryChannel
    };

    notificationHistory.push(newNotification);
    globalAnalytics.sent++;
    globalAnalytics.delivered++;

    // 3. Simulated Provider Integration
    if (primaryChannel === 'sms') {
      console.log(`[Twilio/MSG91] Sending SMS: ${notification.message}`);
    } else if (primaryChannel === 'voice') {
      console.log(`[Voice API] Ringing user for critical alert: ${notification.title}`);
    }

    return api.wrapSuccess(newNotification);
  }
};