import type { Timestamp } from '@react-native-firebase/firestore';

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type SubscriptionStatus = 'free' | 'premium' | 'lifetime';

export type StudyMode = 'recognition' | 'recall' | 'both';

export interface UserSettings {
  dailyNewCards: number;
  dailyReviewLimit: number;
  showFurigana: boolean;
  ttsEnabled: boolean;
  ttsSpeed: number;
  soundEnabled: boolean;
  preferredMode: StudyMode;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  enhancedAnalyticsEnabled: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isAnonymous: boolean;
  currentLevel: JlptLevel;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: Timestamp | null;

  // Gamification
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null; // YYYY-MM-DD format
  level: number; // XP-based level

  // Timestamps
  createdAt: Timestamp;
  lastActiveAt: Timestamp;

  // Settings
  settings: UserSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyNewCards: 5,
  dailyReviewLimit: 100,
  showFurigana: true,
  ttsEnabled: true,
  ttsSpeed: 1.0,
  soundEnabled: true,
  preferredMode: 'both',
  notificationsEnabled: true,
  reminderTime: '09:00',
  enhancedAnalyticsEnabled: false,
};

export function createDefaultUser(uid: string, email: string | null, isAnonymous: boolean): Omit<User, 'createdAt' | 'lastActiveAt'> {
  return {
    uid,
    email,
    displayName: null,
    avatarUrl: null,
    isAnonymous,
    currentLevel: 'N5',
    subscriptionStatus: 'free',
    subscriptionExpiry: null,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    level: 1,
    settings: DEFAULT_USER_SETTINGS,
  };
}

