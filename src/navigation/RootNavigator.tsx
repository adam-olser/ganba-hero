/**
 * Root Navigator
 * 
 * Handles navigation between auth, onboarding, and main app.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore, useSettingsStore } from '@/store';
import type { RootStackParamList } from '@/types';

// Navigators
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const authStatus = useAuthStore(state => state.status);
  const hasSeenOnboarding = useSettingsStore(state => state.hasSeenOnboarding);
  
  if (authStatus === 'loading') {
    // Could show a splash screen here
    return null;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authStatus === 'unauthenticated' ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasSeenOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;

