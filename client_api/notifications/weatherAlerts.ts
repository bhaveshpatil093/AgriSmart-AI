import { WeatherAlert, WeatherAlertSeverity } from '../../types';
import { NotificationApi } from './service';

// Mock SMS service (integrate with Twilio in production)
export const SMSAlertService = {
  sendSMS: async (phone: string, message: string): Promise<{ success: boolean; error?: string }> => {
    // In production, integrate with Twilio:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: '+1234567890',
    //   to: phone
    // });

    console.log(`[SMS Alert] To: ${phone}, Message: ${message}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
};

// Push notification service
export const PushNotificationService = {
  sendPush: async (userId: string, title: string, body: string, data?: any): Promise<{ success: boolean }> => {
    // In production, use service worker or Firebase Cloud Messaging
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        data,
        requireInteraction: true,
        tag: 'weather-alert'
      });
    }
    return { success: true };
  }
};

export const WeatherAlertService = {
  // Check if alert should trigger notifications
  shouldNotify: (alert: WeatherAlert): boolean => {
    return alert.severity === 'orange' || alert.severity === 'red';
  },

  // Send notifications for critical weather alerts
  sendAlertNotifications: async (
    userId: string,
    userPhone: string,
    alert: WeatherAlert,
    enableSMS: boolean = true,
    enablePush: boolean = true
  ): Promise<void> => {
    if (!WeatherAlertService.shouldNotify(alert)) {
      return;
    }

    const severityEmoji = {
      'red': '🔴',
      'orange': '🟠',
      'yellow': '🟡',
      'green': '🟢'
    };

    const title = `${severityEmoji[alert.severity]} Weather Alert: ${alert.type.replace('_', ' ').toUpperCase()}`;
    const message = alert.message + (alert.actionable ? `\n\nAction: ${alert.actionable}` : '');

    // Send push notification
    if (enablePush) {
      await PushNotificationService.sendPush(userId, title, message, {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity
      });
    }

    // Send SMS
    if (enableSMS && userPhone) {
      await SMSAlertService.sendSMS(userPhone, `${title}\n${message}`);
    }

    // Save to notification history
    await NotificationApi.send({
      userId,
      title,
      message,
      type: 'weather',
      category: 'weather',
      severity: alert.severity === 'red' ? 'critical' : alert.severity === 'orange' ? 'warning' : 'advisory',
      priority: alert.severity === 'red' ? 'critical' : 'high',
      channel: enablePush ? 'push' : 'sms'
    } as any);
  },

  // Batch send alerts for multiple users
  broadcastAlert: async (
    userIds: string[],
    userPhones: Record<string, string>,
    alert: WeatherAlert,
    preferences: Record<string, { sms: boolean; push: boolean }>
  ): Promise<void> => {
    const promises = userIds.map(userId => 
      WeatherAlertService.sendAlertNotifications(
        userId,
        userPhones[userId] || '',
        alert,
        preferences[userId]?.sms ?? true,
        preferences[userId]?.push ?? true
      )
    );
    await Promise.all(promises);
  }
};
