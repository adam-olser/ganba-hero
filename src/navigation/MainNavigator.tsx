/**
 * Main Navigator
 * 
 * Bottom tabs for mobile, sidebar for desktop.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Platform } from 'react-native';
import type { MainTabParamList, StudyStackParamList } from '@/types';
import { colors, spacing, layout } from '@/theme';
import { useResponsive } from '@/hooks';
import { Icon, type IconName } from '@/components/shared';

// Screens
import { HomeScreen } from '@/screens/Home';
import StudyScreen from '@/screens/Study/StudyScreen';
import FlashcardSessionScreen from '@/screens/Study/FlashcardSessionScreen';
import KanaChartScreen from '@/screens/Study/KanaChartScreen';
import GrammarListScreen from '@/screens/Study/GrammarListScreen';
import GrammarDetailScreen from '@/screens/Study/GrammarDetailScreen';
import ProgressScreen from '@/screens/Progress/ProgressScreen';
import SettingsScreen from '@/screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const StudyStack = createStackNavigator<StudyStackParamList>();

// Tab icon component using custom Icon
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, IconName> = {
    HomeTab: 'home',
    StudyTab: 'book',
    ProgressTab: 'chart',
    SettingsTab: 'settings',
  };
  
  const iconName = iconMap[name] || 'home';
  const iconColor = focused ? colors.primary : colors.textMuted;
  
  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={24} color={iconColor} />
    </View>
  );
}

// Study tab with nested stack for flashcard sessions
function StudyStackNavigator() {
  return (
    <StudyStack.Navigator screenOptions={{ headerShown: false }}>
      <StudyStack.Screen name="StudyHub" component={StudyScreen} />
      <StudyStack.Screen 
        name="FlashcardSession" 
        component={FlashcardSessionScreen}
        options={{ 
          gestureEnabled: false, // Prevent swipe back during session
          presentation: 'modal',
        }}
      />
      <StudyStack.Screen name="KanaChart" component={KanaChartScreen} />
      <StudyStack.Screen name="LessonList" component={GrammarListScreen} />
      <StudyStack.Screen name="LessonDetail" component={GrammarDetailScreen} />
    </StudyStack.Navigator>
  );
}

export function MainNavigator() {
  const { showBottomTabs, showSidebar } = useResponsive();
  
  // If showing sidebar on desktop, render differently
  // For now, always use bottom tabs (sidebar to be implemented)
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="StudyTab"
        component={StudyStackNavigator}
        options={{ tabBarLabel: 'Study' }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: layout.tabBarHeight,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
});

export default MainNavigator;

