/**
 * Ganba Hero - Japanese Learning App
 * 
 * Main App component with providers and navigation.
 */

import React, { useEffect } from 'react';
import { StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme';
import { analyticsService } from '@/services';
import { configureRevenueCat } from '@/services/paywall';
import { requestNotificationPermission, registerForPushNotifications } from '@/services/notifications';
import { useAuthStore, useStudyStore } from '@/store';
import { RootNavigator } from '@/navigation';
import { onAuthStateChanged } from '@/api/auth';
import { getUser, createUser, updateUser, getTodayStats } from '@/api/firestore';
import { ErrorBoundary } from '@/components/shared';
import type { User } from '@/types';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Navigation theme
const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

// Loading screen while checking auth
function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// Main app content with auth listener
function AppContent() {
  const authStatus = useAuthStore(state => state.status);
  const setUser = useAuthStore(state => state.setUser);
  const setStatus = useAuthStore(state => state.setStatus);
  const setDailyGoal = useStudyStore(state => state.setDailyGoal);
  const setCardsStudiedToday = useStudyStore(state => state.setCardsStudiedToday);

  useEffect(() => {
    // Initialize analytics
    analyticsService.initialize();
    analyticsService.logAppOpen();
    configureRevenueCat();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to get existing user from Firestore
          let userData = await getUser(firebaseUser.uid);
          
          // If no user document exists, create one
          if (!userData) {
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Learner',
              avatarUrl: firebaseUser.photoURL,
              isAnonymous: firebaseUser.isAnonymous,
              currentLevel: 'N5',
              subscriptionStatus: 'free',
              totalXp: 0,
              level: 1,
              currentStreak: 0,
              longestStreak: 0,
              lastStudyDate: null,
              settings: {
                dailyNewCards: 5,
                showFurigana: true,
                ttsEnabled: true,
                soundEnabled: true,
                enhancedAnalyticsEnabled: false,
                reminderTime: '09:00',
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await createUser(newUser);
            userData = newUser;
          }
          
          // Sync displayName/avatarUrl from Firebase Auth (may have changed)
          if (
            firebaseUser.displayName &&
            (userData.displayName !== firebaseUser.displayName ||
              userData.avatarUrl !== firebaseUser.photoURL)
          ) {
            userData = {
              ...userData,
              displayName: firebaseUser.displayName,
              avatarUrl: firebaseUser.photoURL,
            };
            updateUser(firebaseUser.uid, {
              displayName: firebaseUser.displayName,
              avatarUrl: firebaseUser.photoURL,
            } as any).catch(() => {});
          }

          setUser(userData);

          // Hydrate daily progress so it survives page refreshes
          setDailyGoal(userData.settings?.dailyNewCards ?? 5);
          getTodayStats(userData.uid).then(stats => {
            setCardsStudiedToday(stats.cardsReviewed);
          }).catch(() => {});

          // Request push permission and store FCM token
          requestNotificationPermission().then(async (permission) => {
            if (permission === 'granted') {
              const token = await registerForPushNotifications();
              if (token && userData) {
                updateUser(userData.uid, { fcmToken: token } as any).catch(() => {});
              }
            }
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setStatus, setDailyGoal, setCardsStudiedToday]);

  // Show loading while checking auth
  if (authStatus === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <NavigationContainer theme={navigationTheme}>
              <AppContent />
            </NavigationContainer>
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

