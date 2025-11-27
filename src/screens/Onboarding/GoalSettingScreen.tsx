/**
 * Goal Setting Screen
 * 
 * Set daily study goal (cards per day).
 * Can be skipped (defaults to 5 cards/day).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, Heading2, Body, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useSettingsStore, useAuthStore } from '@/store';
import { updateUserSettings } from '@/api';
import type { OnboardingScreenProps } from '@/types';

const GOAL_OPTIONS = [
  { cards: 5, label: 'Casual', description: '5 cards/day • ~2 min' },
  { cards: 10, label: 'Regular', description: '10 cards/day • ~5 min' },
  { cards: 15, label: 'Committed', description: '15 cards/day • ~8 min' },
  { cards: 20, label: 'Intensive', description: '20 cards/day • ~10 min' },
];

export function GoalSettingScreen({ navigation }: OnboardingScreenProps<'GoalSetting'>) {
  const user = useAuthStore(state => state.user);
  const setHasSeenOnboarding = useSettingsStore(state => state.setHasSeenOnboarding);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  
  const [selectedGoal, setSelectedGoal] = React.useState(5);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleFinish = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateUserSettings(user.uid, { dailyNewCards: selectedGoal });
      updateSettings({ dailyNewCards: selectedGoal });
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Failed to update goal:', error);
      // Still complete onboarding even if save fails
      setHasSeenOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    // Use default (5 cards/day)
    setHasSeenOnboarding(true);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text variant="label" color="textSecondary">Skip</Text>
          </TouchableOpacity>
        </View>
        
        {/* Title */}
        <View style={styles.titleSection}>
          <Heading2 align="center">Set Your Daily Goal</Heading2>
          <Body color="textSecondary" align="center" style={styles.subtitle}>
            How many new cards would you like to learn each day? You can change this anytime.
          </Body>
        </View>
        
        {/* Goal Options */}
        <View style={styles.goalList}>
          {GOAL_OPTIONS.map(({ cards, label, description }) => (
            <TouchableOpacity
              key={cards}
              onPress={() => setSelectedGoal(cards)}
              activeOpacity={0.7}
            >
              <Card
                variant={selectedGoal === cards ? 'outlined' : 'default'}
                padding="medium"
                style={[
                  styles.goalCard,
                  selectedGoal === cards && styles.goalCardSelected,
                ]}
              >
                <View style={styles.goalContent}>
                  <View style={styles.goalText}>
                    <Text variant="body">{label}</Text>
                    <Caption>{description}</Caption>
                  </View>
                  {selectedGoal === cards && (
                    <View style={styles.checkmark}>
                      <Text>✓</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Info Card */}
        <Card variant="default" padding="medium" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text variant="caption" color="textSecondary">
              💡 Starting with fewer cards helps build a consistent habit. 
              You can always study more if you're feeling motivated!
            </Text>
          </View>
        </Card>
        
        {/* Finish Button */}
        <View style={styles.footer}>
          <Button
            title="Start Learning!"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleFinish}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  skipButton: {
    padding: spacing.sm,
  },
  titleSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  goalList: {
    gap: spacing.md,
  },
  goalCard: {
    marginBottom: 0,
  },
  goalCardSelected: {
    borderColor: colors.primary,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
    gap: spacing.xs,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryMuted,
  },
  infoContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
});

export default GoalSettingScreen;

