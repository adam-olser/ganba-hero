/**
 * Home Screen
 * 
 * Main dashboard with streak, XP, and study button.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Text, Heading2, Heading3, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useResponsive } from '@/hooks';
import { useAuthStore, useStudyStore, selectDailyProgress } from '@/store';
import { getDueCards, getTodayStats } from '@/api';
import { getLevelProgress } from '@/services/xpCalculator';
import type { MainTabProps } from '@/types';

export function HomeScreen({ navigation }: MainTabProps<'HomeTab'>) {
  const { isMobile } = useResponsive();
  const user = useAuthStore(state => state.user);
  const dailyProgress = useStudyStore(selectDailyProgress);

  // Fetch due cards count
  const { 
    data: dueCards, 
    refetch: refetchDue,
    isLoading: isLoadingDue 
  } = useQuery({
    queryKey: ['dueCards', user?.uid],
    queryFn: () => user?.uid ? getDueCards(user.uid) : Promise.resolve([]),
    enabled: !!user?.uid,
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch today's stats
  const { 
    data: todayStats, 
    refetch: refetchStats,
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['todayStats', user?.uid],
    queryFn: () => user?.uid ? getTodayStats(user.uid) : Promise.resolve(null),
    enabled: !!user?.uid,
    staleTime: 60 * 1000,
  });

  const dueCount = dueCards?.length || 0;
  const newCardsAvailable = Math.max(0, (user?.settings?.dailyNewCards || 5) - (todayStats?.newCardsLearned || 0));
  const todayAccuracy = todayStats?.cardsReviewed 
    ? Math.round((todayStats.correctAnswers / todayStats.cardsReviewed) * 100) 
    : 0;
  const levelProgress = getLevelProgress(user?.totalXp || 0);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchDue(), refetchStats()]);
  }, [refetchDue, refetchStats]);

  const handleStartStudy = () => {
    navigation.navigate('StudyTab', { screen: 'StudyHub' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.maxContentWidth },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingDue || isLoadingStats}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.header}>
          <View>
            <Caption>Welcome back</Caption>
            <Heading2>{user?.displayName || 'Learner'}</Heading2>
          </View>
          <View style={styles.mascotSmall}>
            <Text variant="japanese">🦐</Text>
          </View>
        </View>

        {/* Streak & XP Card */}
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h3" color="streak">🔥 {user?.currentStreak || 0}</Text>
              <Caption>Day Streak</Caption>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h3" color="xp">⭐ {user?.totalXp || 0}</Text>
              <Caption>Total XP</Caption>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h3" color="level">Lv. {user?.level || 1}</Text>
              <Caption>Level</Caption>
            </View>
          </View>
        </Card>

        {/* Daily Goal */}
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Heading3>Today's Goal</Heading3>
            <Text variant="body" color="textSecondary">
              {dailyProgress.cardsStudiedToday} / {dailyProgress.dailyGoal} cards
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${dailyProgress.percentage}%` }
              ]} 
            />
          </View>

          {dailyProgress.isComplete ? (
            <View style={styles.goalComplete}>
              <Text variant="body" color="success">✓ Goal Complete!</Text>
            </View>
          ) : (
            <Caption>
              {dailyProgress.remaining} cards remaining
            </Caption>
          )}
        </Card>

        {/* Start Study Button */}
        <Button
          title={dailyProgress.isComplete ? "Continue Studying" : "Start Review"}
          size="large"
          fullWidth
          onPress={handleStartStudy}
        />

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card padding="small" style={styles.quickStatCard}>
            <Text variant="h4" align="center">{dueCount}</Text>
            <Caption align="center">Due Today</Caption>
          </Card>
          <Card padding="small" style={styles.quickStatCard}>
            <Text variant="h4" align="center">{newCardsAvailable}</Text>
            <Caption align="center">New Cards</Caption>
          </Card>
          <Card padding="small" style={styles.quickStatCard}>
            <Text variant="h4" align="center">{todayAccuracy}%</Text>
            <Caption align="center">Accuracy</Caption>
          </Card>
        </View>

        {/* Level Progress */}
        <Card padding="medium" style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text variant="label">Level {levelProgress.level}</Text>
            <Caption>{levelProgress.currentXp} / {levelProgress.xpForNextLevel} XP</Caption>
          </View>
          <View style={styles.levelProgressContainer}>
            <View 
              style={[
                styles.levelProgressBar, 
                { width: `${Math.round(levelProgress.progress * 100)}%` }
              ]} 
            />
          </View>
        </Card>

        {/* Premium Banner (for free users) */}
        {user?.subscriptionStatus === 'free' && (
          <Card variant="outlined" style={styles.premiumBanner}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumText}>
                <Text variant="label" color="primary">Unlock All Levels</Text>
                <Caption>Get access to N4-N1 vocabulary</Caption>
              </View>
              <Button
                title="Upgrade"
                variant="primary"
                size="small"
                onPress={() => console.log('Show paywall')}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mascotSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  goalCard: {
    gap: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  goalComplete: {
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickStatCard: {
    flex: 1,
  },
  premiumBanner: {
    borderColor: colors.primary,
  },
  premiumContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumText: {
    flex: 1,
    gap: spacing.xs,
  },
  levelCard: {
    gap: spacing.sm,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelProgressContainer: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  levelProgressBar: {
    height: '100%',
    backgroundColor: colors.xp,
    borderRadius: borderRadius.full,
  },
});

export default HomeScreen;

