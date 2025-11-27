import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
};

// Onboarding Stack
export type OnboardingStackParamList = {
  LevelChoice: undefined;
  PlacementTest: undefined;
  GoalSetting: undefined;
  NotificationSetup: undefined;
};

// Study Stack (nested in Study tab)
export type StudyStackParamList = {
  StudyHub: undefined;
  FlashcardSession: {
    mode: 'recognition' | 'recall' | 'mixed';
    level?: string;
  };
  LessonList: {
    level?: string;
  };
  LessonDetail: {
    grammarId: string;
  };
  KanaChart: undefined;
  VocabBrowser: {
    level?: string;
  };
};

// Settings Stack (nested in Settings tab)
export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  Subscription: undefined;
  StudyPreferences: undefined;
  Notifications: undefined;
  Privacy: undefined;
  DataSources: undefined;
  DeleteAccount: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: undefined;
  StudyTab: NavigatorScreenParams<StudyStackParamList>;
  ProgressTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen props types
export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = StackScreenProps<
  OnboardingStackParamList,
  T
>;

export type StudyScreenProps<T extends keyof StudyStackParamList> = StackScreenProps<
  StudyStackParamList,
  T
>;

export type SettingsScreenProps<T extends keyof SettingsStackParamList> = StackScreenProps<
  SettingsStackParamList,
  T
>;

export type MainTabProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

// Declare global types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

