/**
 * Auth Listener Component
 * 
 * Listens to Firebase auth state changes and syncs with Zustand store.
 * Handles initial user creation for new signups and settings sync.
 */

import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { useAuthStore, useSettingsStore } from '@/store';
import { getUser, createUser, updateUser } from '@/api';
import type { User, JlptLevel } from '@/types';

/**
 * Create default user object for new signups
 */
function createDefaultUser(
  uid: string,
  displayName: string | null,
  email: string | null,
  isAnonymous: boolean
): Omit<User, 'createdAt' | 'lastActiveAt'> {
  return {
    uid,
    email: email || undefined,
    displayName: displayName || 'Learner',
    isAnonymous,
    currentLevel: 'N5' as JlptLevel,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    subscriptionStatus: 'free',
    settings: {
      dailyNewCards: 5,
      showFurigana: true,
      ttsEnabled: true,
      soundEnabled: true,
      notificationsEnabled: false,
      reminderTime: '09:00',
      enhancedAnalyticsEnabled: false,
    },
  };
}

export function AuthListener() {
  const setUser = useAuthStore(state => state.setUser);
  const setStatus = useAuthStore(state => state.setStatus);
  const setOnboarded = useAuthStore(state => state.setOnboarded);
  const hasSeenOnboarding = useSettingsStore(state => state.hasSeenOnboarding);
  const setHasSeenOnboarding = useSettingsStore(state => state.setHasSeenOnboarding);
  const updateLocalSettings = useSettingsStore(state => state.updateSettings);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setStatus('loading');
        
        try {
          // Check if user exists in Firestore
          let user = await getUser(firebaseUser.uid);

          if (!user) {
            // Create new user in Firestore
            const defaultUser = createDefaultUser(
              firebaseUser.uid,
              firebaseUser.displayName,
              firebaseUser.email,
              firebaseUser.isAnonymous
            );
            
            const newUser: User = {
              ...defaultUser,
              createdAt: new Date(),
              lastActiveAt: new Date(),
            } as User;
            
            await createUser(newUser);
            user = newUser;
            
            // New user - needs onboarding
            setOnboarded(false);
            setHasSeenOnboarding(false);
          } else {
            // Existing user - update lastActiveAt
            await updateUser(firebaseUser.uid, { lastActiveAt: new Date() });
            
            // Sync local settings with user settings from Firestore
            if (user.settings) {
              updateLocalSettings({
                dailyNewCards: user.settings.dailyNewCards,
                showFurigana: user.settings.showFurigana,
                ttsEnabled: user.settings.ttsEnabled,
                soundEnabled: user.settings.soundEnabled,
                notificationsEnabled: user.settings.notificationsEnabled,
                reminderTime: user.settings.reminderTime,
              });
            }
            
            // Check onboarding status - user has completed if they have a level set
            const hasCompletedOnboarding = hasSeenOnboarding || user.currentLevel !== 'N5';
            setOnboarded(hasCompletedOnboarding);
          }

          setUser(user);
          setStatus('authenticated');
        } catch (error) {
          console.error('[AuthListener] Error handling auth state:', error);
          
          // Still set as authenticated but with minimal user data
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            displayName: firebaseUser.displayName || 'Learner',
            isAnonymous: firebaseUser.isAnonymous,
            currentLevel: 'N5',
            totalXp: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            subscriptionStatus: 'free',
            settings: {
              dailyNewCards: 5,
              showFurigana: true,
              ttsEnabled: true,
              soundEnabled: true,
              notificationsEnabled: false,
              reminderTime: '09:00',
              enhancedAnalyticsEnabled: false,
            },
            createdAt: new Date(),
            lastActiveAt: new Date(),
          };
          
          setUser(fallbackUser);
          setStatus('authenticated');
        }
      } else {
        // User signed out
        setUser(null);
        setStatus('unauthenticated');
        setOnboarded(false);
      }
    });

    return unsubscribe;
  }, [setUser, setStatus, setOnboarded, hasSeenOnboarding, setHasSeenOnboarding, updateLocalSettings]);

  // This component doesn't render anything
  return null;
}

export default AuthListener;
