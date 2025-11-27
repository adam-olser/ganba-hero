/**
 * Level Choice Screen
 * 
 * First onboarding screen - choose JLPT level or take placement test.
 * Can be skipped (defaults to N5).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, Heading2, Body, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius, getJlptColor } from '@/theme';
import { useSettingsStore, useAuthStore } from '@/store';
import { updateUser } from '@/api';
import type { OnboardingScreenProps, JlptLevel } from '@/types';

const JLPT_LEVELS: Array<{ level: JlptLevel; description: string }> = [
  { level: 'N5', description: 'Complete beginner' },
  { level: 'N4', description: 'Basic Japanese' },
  { level: 'N3', description: 'Intermediate' },
  { level: 'N2', description: 'Upper intermediate' },
  { level: 'N1', description: 'Advanced' },
];

export function LevelChoiceScreen({ navigation }: OnboardingScreenProps<'LevelChoice'>) {
  const user = useAuthStore(state => state.user);
  const setHasSeenOnboarding = useSettingsStore(state => state.setHasSeenOnboarding);
  const [selectedLevel, setSelectedLevel] = React.useState<JlptLevel>('N5');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleSelectLevel = async (level: JlptLevel) => {
    setSelectedLevel(level);
  };
  
  const handleContinue = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateUser(user.uid, { currentLevel: selectedLevel });
      navigation.navigate('GoalSetting');
    } catch (error) {
      console.error('Failed to update level:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    // Skip onboarding entirely, use defaults (N5, 5 cards/day)
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
          <Heading2 align="center">Choose Your Level</Heading2>
          <Body color="textSecondary" align="center" style={styles.subtitle}>
            Select your current Japanese level, or start from the beginning.
          </Body>
        </View>
        
        {/* Level Options */}
        <View style={styles.levelList}>
          {JLPT_LEVELS.map(({ level, description }) => (
            <TouchableOpacity
              key={level}
              onPress={() => handleSelectLevel(level)}
              activeOpacity={0.7}
            >
              <Card
                variant={selectedLevel === level ? 'outlined' : 'default'}
                padding="medium"
                style={[
                  styles.levelCard,
                  selectedLevel === level && {
                    borderColor: getJlptColor(level),
                  },
                ]}
              >
                <View style={styles.levelContent}>
                  <View style={[styles.levelBadge, { backgroundColor: getJlptColor(level) }]}>
                    <Text variant="label" color="textInverse">{level}</Text>
                  </View>
                  <View style={styles.levelText}>
                    <Text variant="body">{level}</Text>
                    <Caption>{description}</Caption>
                  </View>
                  {selectedLevel === level && (
                    <View style={styles.checkmark}>
                      <Text>✓</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Continue Button */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleContinue}
          />
          
          <TouchableOpacity onPress={() => {}} style={styles.testLink}>
            <Text variant="label" color="primary">
              Not sure? Take a placement test
            </Text>
          </TouchableOpacity>
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
  levelList: {
    flex: 1,
    gap: spacing.md,
  },
  levelCard: {
    marginBottom: 0,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
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
  footer: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  testLink: {
    alignItems: 'center',
    padding: spacing.sm,
  },
});

export default LevelChoiceScreen;

