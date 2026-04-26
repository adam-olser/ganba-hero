/**
 * Main Navigator
 *
 * Bottom tabs for mobile, sidebar for desktop.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList, StudyStackParamList, SettingsStackParamList } from '@/types';
import { colors, spacing, layout } from '@/theme';
import { useResponsive } from '@/hooks';
import { Icon, Text, type IconName } from '@/components/shared';

// Screens
import { HomeScreen } from '@/screens/Home';
import StudyScreen from '@/screens/Study/StudyScreen';
import FlashcardSessionScreen from '@/screens/Study/FlashcardSessionScreen';
import KanaChartScreen from '@/screens/Study/KanaChartScreen';
import GrammarListScreen from '@/screens/Study/GrammarListScreen';
import GrammarDetailScreen from '@/screens/Study/GrammarDetailScreen';
import VocabBrowserScreen from '@/screens/Study/VocabBrowserScreen';
import KanjiPracticeScreen from '@/screens/Study/KanjiPracticeScreen';
import ProgressScreen from '@/screens/Progress/ProgressScreen';
import SettingsScreen from '@/screens/Settings/SettingsScreen';
import AttributionScreen from '@/screens/Settings/AttributionScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const StudyStack = createStackNavigator<StudyStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  HomeTab:     { icon: 'home',     label: 'Home' },
  StudyTab:    { icon: 'book',     label: 'Study' },
  ProgressTab: { icon: 'chart',    label: 'Progress' },
  SettingsTab: { icon: 'settings', label: 'Settings' },
};

// Tab icon for bottom tab bar
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconName = TAB_META[name]?.icon ?? 'home';
  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={24} color={focused ? colors.primary : colors.textMuted} />
    </View>
  );
}

// Sidebar rendered on desktop (replaces bottom tab bar)
function DesktopSidebar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarLogoRow}>
        <Text style={styles.sidebarLogo}>頑</Text>
        <Text style={styles.sidebarAppName}>Ganba Hero</Text>
      </View>
      <View style={styles.sidebarNav}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name] ?? { icon: 'home' as IconName, label: route.name };
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.sidebarItem, focused && styles.sidebarItemActive]}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
            >
              <Icon
                name={meta.icon}
                size={20}
                color={focused ? colors.primary : colors.textMuted}
              />
              <Text
                variant="label"
                color={focused ? 'primary' : 'textMuted'}
                style={styles.sidebarLabel}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
      <StudyStack.Screen name="KanjiPractice" component={KanjiPracticeScreen} />
      <StudyStack.Screen name="VocabBrowser" component={VocabBrowserScreen} />
    </StudyStack.Navigator>
  );
}

// Settings tab with nested stack for sub-screens
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="DataSources" component={AttributionScreen} />
    </SettingsStack.Navigator>
  );
}

export function MainNavigator() {
  const { showSidebar } = useResponsive();

  return (
    <Tab.Navigator
      tabBar={showSidebar ? (props) => <DesktopSidebar {...props} /> : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: showSidebar ? styles.tabBarHidden : styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
      sceneContainerStyle={showSidebar ? styles.sidebarSceneContainer : undefined}
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
        component={SettingsStackNavigator}
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
  tabBarHidden: {
    display: 'none',
    height: 0,
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
  // Sidebar (desktop) — absolutely positioned on the left so the scene can offset right
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: layout.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    zIndex: 10,
  },
  sidebarLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  sidebarLogo: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '700',
  },
  sidebarAppName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sidebarNav: {
    gap: spacing.xs,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
  },
  sidebarItemActive: {
    backgroundColor: colors.primaryMuted,
  },
  sidebarLabel: {
    fontSize: 15,
  },
  sidebarSceneContainer: {
    marginLeft: layout.sidebarWidth,
  },
});

export default MainNavigator;

