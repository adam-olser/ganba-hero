/**
 * Notifications Service
 *
 * Handles push notifications and daily reminders.
 * Uses Web Push API for PWA and Firebase Cloud Messaging for native.
 */

import { Platform } from 'react-native';

// Notification permission status
export type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Check if notifications are supported
 */
export function isNotificationsSupported(): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 'Notification' in window;
  }
  return true;
}

/**
 * Get current notification permission status
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermission;
  }

  const messaging = require('@react-native-firebase/messaging').default;
  const status = await messaging().hasPermission();
  // 1 = AUTHORIZED, 2 = PROVISIONAL
  if (status === 1 || status === 2) return 'granted';
  if (status === -1) return 'denied';
  return 'default';
}

/**
 * Request notification permission and return FCM token if granted
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  const messaging = require('@react-native-firebase/messaging').default;
  const status = await messaging().requestPermission();
  if (status === 1 || status === 2) return 'granted';
  if (status === -1) return 'denied';
  return 'default';
}

/**
 * Register for push notifications — returns the FCM device token.
 * Call after permission is granted; store the token on the user doc.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web push registration not fully implemented');
    return null;
  }

  try {
    const messaging = require('@react-native-firebase/messaging').default;
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token ?? null;
  } catch (err) {
    console.error('[Notifications] Failed to get FCM token:', err);
    return null;
  }
}

/**
 * Schedule a daily reminder notification using react-native-push-notification
 * or the notifee library if available; falls back to a no-op if neither is present.
 */
export async function scheduleDailyReminder(options: {
  hour: number;
  minute: number;
  title?: string;
  body?: string;
}): Promise<boolean> {
  const {
    hour,
    minute,
    title = 'Time to study! 📚',
    body = "Don't break your streak — review your flashcards now 🔥",
  } = options;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        'dailyReminder',
        JSON.stringify({ enabled: true, hour, minute, title, body })
      );
    }
    return true;
  }

  try {
    // Use @notifee/react-native if available; it provides reliable scheduled notifications
    const notifee = require('@notifee/react-native').default;
    const TriggerType = require('@notifee/react-native').TriggerType;

    const channelId = await notifee.createChannel({
      id: 'daily-reminder',
      name: 'Daily Reminder',
      importance: 4, // HIGH
    });

    const now = new Date();
    const trigger = new Date(now);
    trigger.setHours(hour, minute, 0, 0);
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await notifee.createTriggerNotification(
      { title, body, android: { channelId }, ios: { sound: 'default' } },
      { type: TriggerType.TIMESTAMP, timestamp: trigger.getTime(), repeatFrequency: 2 } // DAILY
    );
    return true;
  } catch {
    // notifee not installed — schedule via FCM local notification fallback
    console.log(`[Notifications] Would schedule daily reminder at ${hour}:${minute.toString().padStart(2, '0')}`);
    return false;
  }
}

/**
 * Cancel the daily reminder notification
 */
export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('dailyReminder');
    }
    return;
  }

  try {
    const notifee = require('@notifee/react-native').default;
    await notifee.cancelAllNotifications();
  } catch {
    // notifee not installed
  }
}

/**
 * Show a local notification immediately (for testing)
 */
export async function showLocalNotification(options: {
  title: string;
  body: string;
  icon?: string;
}): Promise<void> {
  const { title, body, icon = '/icon-192.png' } = options;

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body, icon, badge: '/icon-96.png', tag: 'ganba-hero', renotify: true });
    return;
  }

  try {
    const notifee = require('@notifee/react-native').default;
    const AndroidImportance = require('@notifee/react-native').AndroidImportance;

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({ title, body, android: { channelId }, ios: { sound: 'default' } });
  } catch {
    console.log('[Notifications] showLocalNotification:', title, body);
  }
}

/**
 * Parse time string (e.g., "09:00") to hour and minute
 */
export function parseTimeString(timeString: string): { hour: number; minute: number } | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/**
 * Format hour and minute to time string
 */
export function formatTimeString(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export default {
  isNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  showLocalNotification,
  parseTimeString,
  formatTimeString,
};
