/**
 * Onboarding Navigator
 * 
 * Handles onboarding flow - can be skipped entirely.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { OnboardingStackParamList } from '@/types';
import {
  LevelChoiceScreen,
  GoalSettingScreen,
} from '@/screens/Onboarding';

const Stack = createStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="LevelChoice" component={LevelChoiceScreen} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />
    </Stack.Navigator>
  );
}

export default OnboardingNavigator;

