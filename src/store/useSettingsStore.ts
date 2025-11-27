/**
 * Settings Store (Zustand)
 * 
 * Manages user preferences and app settings.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserSettings, StudyMode } from '@/types';
import { DEFAULT_USER_SETTINGS } from '@/types';

interface SettingsState extends UserSettings {
  // Local-only settings (not synced to Firebase)
  hasSeenOnboarding: boolean;
  lastReviewPromptDate: string | null;
  
  // Actions
  updateSettings: (updates: Partial<UserSettings>) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setLastReviewPromptDate: (date: string) => void;
  resetSettings: () => void;
  loadFromUser: (settings: UserSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default settings
      ...DEFAULT_USER_SETTINGS,
      hasSeenOnboarding: false,
      lastReviewPromptDate: null,
      
      // Actions
      updateSettings: (updates) => set((state) => ({
        ...state,
        ...updates,
      })),
      
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      
      setLastReviewPromptDate: (lastReviewPromptDate) => set({ lastReviewPromptDate }),
      
      resetSettings: () => set({
        ...DEFAULT_USER_SETTINGS,
        hasSeenOnboarding: false,
        lastReviewPromptDate: null,
      }),
      
      loadFromUser: (settings) => set((state) => ({
        ...state,
        ...settings,
      })),
    }),
    {
      name: 'ganba-hero-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist local-only settings
        hasSeenOnboarding: state.hasSeenOnboarding,
        lastReviewPromptDate: state.lastReviewPromptDate,
      }),
    }
  )
);

// Selectors
export const selectStudyPreferences = (state: SettingsState) => ({
  dailyNewCards: state.dailyNewCards,
  dailyReviewLimit: state.dailyReviewLimit,
  preferredMode: state.preferredMode,
  showFurigana: state.showFurigana,
});

export const selectAudioPreferences = (state: SettingsState) => ({
  ttsEnabled: state.ttsEnabled,
  ttsSpeed: state.ttsSpeed,
  soundEnabled: state.soundEnabled,
});

export const selectPrivacySettings = (state: SettingsState) => ({
  enhancedAnalyticsEnabled: state.enhancedAnalyticsEnabled,
});

export const selectNotificationSettings = (state: SettingsState) => ({
  notificationsEnabled: state.notificationsEnabled,
  reminderTime: state.reminderTime,
});

