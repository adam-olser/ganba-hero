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
  // For native, we'd check FCM/APNs availability
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
  // For native, we'd check with expo-notifications or react-native-push-notification
  return 'default';
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }
  
  // For native, we'd request with expo-notifications
  console.log('[Notifications] Native permission request not implemented');
  return 'default';
}

/**
 * Schedule a daily reminder notification
 */
export async function scheduleDailyReminder(options: {
  hour: number;
  minute: number;
  title?: string;
  body?: string;
}): Promise<boolean> {
  const { hour, minute, title = 'Time to study!', body = "Don't break your streak - review your flashcards now 🔥" } = options;
  
  if (Platform.OS === 'web') {
    // For web, we can't schedule notifications directly
    // We'd need a service worker + backend for this
    console.log(`[Notifications] Would schedule daily reminder at ${hour}:${minute}`);
    
    // Store the preference in localStorage for the service worker
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('dailyReminder', JSON.stringify({
        enabled: true,
        hour,
        minute,
        title,
        body,
      }));
    }
    
    return true;
  }
  
  // For native, we'd use expo-notifications or react-native-push-notification
  console.log('[Notifications] Native scheduling not implemented');
  return false;
}

/**
 * Cancel daily reminder
 */
export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('dailyReminder');
    }
  }
  // For native, we'd cancel with expo-notifications
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
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[Notifications] Not supported');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return;
    }
    
    new Notification(title, {
      body,
      icon,
      badge: '/icon-96.png',
      tag: 'ganba-hero',
      renotify: true,
    });
  }
}

/**
 * Register for push notifications (gets FCM token)
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    // For web push, we'd need a service worker and VAPID keys
    console.log('[Notifications] Web push registration not fully implemented');
    return null;
  }
  
  // For native, we'd get FCM token
  console.log('[Notifications] Native push registration not implemented');
  return null;
}

/**
 * Parse time string (e.g., "09:00") to hour and minute
 */
export function parseTimeString(timeString: string): { hour: number; minute: number } | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  
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
  scheduleDailyReminder,
  cancelDailyReminder,
  showLocalNotification,
  registerForPushNotifications,
  parseTimeString,
  formatTimeString,
};

