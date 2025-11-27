/**
 * Progress Screen
 * 
 * Stats dashboard with streak calendar and activity charts.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Heading3, Caption } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { getLevelProgress, getLevelTitle } from '@/services/xpCalculator';
import { getUserProgress, getWeeklyStats } from '@/api';
import type { MainTabProps } from '@/types';

// Generate last 7 days for the week view
function getLastSevenDays(): { date: string; dayName: string; dayNum: number }[] {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      dayNum: date.getDate(),
    });
  }
  
  return days;
}

// Generate streak calendar (last 5 weeks)
function getStreakCalendarDays(): { date: string; isToday: boolean }[][] {
  const weeks: { date: string; isToday: boolean }[][] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Start from 5 weeks ago, beginning of week (Sunday)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 34 - startDate.getDay());
  
  for (let week = 0; week < 5; week++) {
    const weekDays: { date: string; isToday: boolean }[] = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      weekDays.push({
        date: dateStr,
        isToday: dateStr === todayStr,
      });
    }
    weeks.push(weekDays);
  }
  
  return weeks;
}

interface StreakDayProps {
  date: string;
  isToday: boolean;
  hasActivity: boolean;
}

function StreakDay({ date, isToday, hasActivity }: StreakDayProps) {
  return (
    <View style={[
      styles.streakDay,
      hasActivity && styles.streakDayActive,
      isToday && styles.streakDayToday,
    ]}>
      {hasActivity && (
        <View style={styles.streakDayFill} />
      )}
    </View>
  );
}

interface WeekDayBarProps {
  dayName: string;
  dayNum: number;
  cardsStudied: number;
  maxCards: number;
  isToday: boolean;
}

function WeekDayBar({ dayName, dayNum, cardsStudied, maxCards, isToday }: WeekDayBarProps) {
  const heightPercent = maxCards > 0 ? Math.min((cardsStudied / maxCards) * 100, 100) : 0;
  
  return (
    <View style={styles.weekDayContainer}>
      <View style={styles.weekDayBarContainer}>
        <View style={[
          styles.weekDayBar,
          { height: `${Math.max(heightPercent, 4)}%` },
          isToday && styles.weekDayBarToday,
        ]} />
      </View>
      <Caption color={isToday ? 'primary' : 'textMuted'}>{dayName}</Caption>
      <Text variant="caption" color={isToday ? 'primary' : 'textSecondary'} style={styles.weekDayNum}>
        {cardsStudied}
      </Text>
    </View>
  );
}

export function ProgressScreen({ navigation }: MainTabProps<'ProgressTab'>) {
  const user = useAuthStore(state => state.user);
  
  const levelProgress = getLevelProgress(user?.totalXp || 0);
  const levelTitle = getLevelTitle(levelProgress.level);
  
  // Fetch user progress stats
  const { data: progressData, refetch: refetchProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['userProgress', user?.uid],
    queryFn: () => user?.uid ? getUserProgress(user.uid) : Promise.resolve(new Map()),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch weekly stats
  const { data: weeklyStats, refetch: refetchWeekly, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['weeklyStats', user?.uid],
    queryFn: () => user?.uid ? getWeeklyStats(user.uid) : Promise.resolve([]),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
  
  // Calculate stats
  const totalCardsLearned = progressData?.size || 0;
  const masteredCards = useMemo(() => {
    if (!progressData) return 0;
    let count = 0;
    progressData.forEach((p) => {
      if (p.status === 'mastered' || (p.interval && p.interval >= 21)) {
        count++;
      }
    });
    return count;
  }, [progressData]);
  
  const overallAccuracy = useMemo(() => {
    if (!progressData || progressData.size === 0) return 0;
    let totalCorrect = 0;
    let totalReviews = 0;
    progressData.forEach((p) => {
      totalCorrect += p.correctCount || 0;
      totalReviews += (p.correctCount || 0) + (p.incorrectCount || 0);
    });
    return totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  }, [progressData]);
  
  // Week data
  const lastSevenDays = useMemo(() => getLastSevenDays(), []);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const weeklyStatsMap = useMemo(() => {
    const map = new Map<string, number>();
    weeklyStats?.forEach((stat) => {
      map.set(stat.date, stat.cardsReviewed);
    });
    return map;
  }, [weeklyStats]);
  
  const maxCardsInWeek = useMemo(() => {
    let max = 10; // minimum for scale
    weeklyStats?.forEach((stat) => {
      if (stat.cardsReviewed > max) max = stat.cardsReviewed;
    });
    return max;
  }, [weeklyStats]);
  
  // Streak calendar data
  const streakCalendar = useMemo(() => getStreakCalendarDays(), []);
  const activeDates = useMemo(() => {
    const set = new Set<string>();
    weeklyStats?.forEach((stat) => {
      if (stat.cardsReviewed > 0) {
        set.add(stat.date);
      }
    });
    return set;
  }, [weeklyStats]);
  
  const handleRefresh = async () => {
    await Promise.all([refetchProgress(), refetchWeekly()]);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProgress || isLoadingWeekly}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading2>Progress</Heading2>
        </View>
        
        {/* Level Card */}
        <Card variant="elevated" style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text variant="h2" color="level">Lv. {levelProgress.level}</Text>
              <Text variant="body" color="textSecondary">{levelTitle}</Text>
            </View>
            <View style={styles.xpInfo}>
              <Text variant="h4" color="xp">⭐ {user?.totalXp || 0}</Text>
              <Caption>Total XP</Caption>
            </View>
          </View>
          
          {/* Level Progress Bar */}
          <View style={styles.levelProgressSection}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${levelProgress.progress * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Caption>{levelProgress.currentXp} XP</Caption>
              <Caption>{levelProgress.xpForNextLevel} XP to next level</Caption>
            </View>
          </View>
        </Card>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card padding="medium" style={styles.statCard}>
            <Icon name="flame" size={24} color={colors.streak} />
            <Text variant="h3" color="streak">{user?.currentStreak || 0}</Text>
            <Caption>Day Streak</Caption>
          </Card>
          
          <Card padding="medium" style={styles.statCard}>
            <Icon name="star" size={24} color={colors.warning} />
            <Text variant="h3">{user?.longestStreak || 0}</Text>
            <Caption>Best Streak</Caption>
          </Card>
          
          <Card padding="medium" style={styles.statCard}>
            <Icon name="book" size={24} color={colors.primary} />
            <Text variant="h3">{totalCardsLearned}</Text>
            <Caption>Cards Learned</Caption>
          </Card>
          
          <Card padding="medium" style={styles.statCard}>
            <Icon name="check" size={24} color={colors.success} />
            <Text variant="h3">{overallAccuracy}%</Text>
            <Caption>Accuracy</Caption>
          </Card>
        </View>
        
        {/* Weekly Activity */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>This Week</Heading3>
          <Card padding="medium" style={styles.weeklyCard}>
            <View style={styles.weeklyChart}>
              {lastSevenDays.map((day) => (
                <WeekDayBar
                  key={day.date}
                  dayName={day.dayName}
                  dayNum={day.dayNum}
                  cardsStudied={weeklyStatsMap.get(day.date) || 0}
                  maxCards={maxCardsInWeek}
                  isToday={day.date === todayStr}
                />
              ))}
            </View>
          </Card>
        </View>
        
        {/* Streak Calendar */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Activity Calendar</Heading3>
          <Card padding="medium" style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Caption color="textMuted">S</Caption>
              <Caption color="textMuted">M</Caption>
              <Caption color="textMuted">T</Caption>
              <Caption color="textMuted">W</Caption>
              <Caption color="textMuted">T</Caption>
              <Caption color="textMuted">F</Caption>
              <Caption color="textMuted">S</Caption>
            </View>
            <View style={styles.calendarGrid}>
              {streakCalendar.map((week, weekIdx) => (
                <View key={weekIdx} style={styles.calendarWeek}>
                  {week.map((day) => (
                    <StreakDay
                      key={day.date}
                      date={day.date}
                      isToday={day.isToday}
                      hasActivity={activeDates.has(day.date)}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotInactive]} />
                <Caption color="textMuted">No activity</Caption>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotActive]} />
                <Caption color="textMuted">Studied</Caption>
              </View>
            </View>
          </Card>
        </View>
        
        {/* JLPT Progress */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>JLPT Progress</Heading3>
          <Card padding="medium">
            <View style={styles.jlptList}>
              <JLPTProgressRow 
                level="N5" 
                color={colors.jlptN5} 
                current={masteredCards} 
                total={800}
                locked={false}
              />
              <JLPTProgressRow 
                level="N4" 
                color={colors.jlptN4} 
                current={0} 
                total={1500}
                locked={user?.subscriptionStatus === 'free'}
              />
              <JLPTProgressRow 
                level="N3" 
                color={colors.jlptN3} 
                current={0} 
                total={3750}
                locked={user?.subscriptionStatus === 'free'}
              />
              <JLPTProgressRow 
                level="N2" 
                color={colors.jlptN2} 
                current={0} 
                total={6000}
                locked={user?.subscriptionStatus === 'free'}
              />
              <JLPTProgressRow 
                level="N1" 
                color={colors.jlptN1} 
                current={0} 
                total={10000}
                locked={user?.subscriptionStatus === 'free'}
              />
            </View>
            
            {user?.subscriptionStatus === 'free' && (
              <View style={styles.premiumNote}>
                <Caption color="textMuted">
                  🔒 Unlock N4-N1 with Premium
                </Caption>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface JLPTProgressRowProps {
  level: string;
  color: string;
  current: number;
  total: number;
  locked: boolean;
}

function JLPTProgressRow({ level, color, current, total, locked }: JLPTProgressRowProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <View style={[styles.jlptRow, locked && styles.jlptRowLocked]}>
      <Text variant="label" style={{ color: locked ? colors.textMuted : color, width: 32 }}>
        {level}
      </Text>
      <View style={styles.jlptProgressBar}>
        <View style={[
          styles.jlptProgress, 
          { width: `${percentage}%`, backgroundColor: locked ? colors.textMuted : color }
        ]} />
      </View>
      <Caption color={locked ? 'textMuted' : 'textSecondary'} style={styles.jlptPercent}>
        {locked ? '🔒' : `${percentage}%`}
      </Caption>
    </View>
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
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing.lg,
  },
  levelCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  levelInfo: {
    gap: spacing.xs,
  },
  xpInfo: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  levelProgressSection: {
    gap: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.level,
    borderRadius: borderRadius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  // Weekly chart
  weeklyCard: {
    paddingVertical: spacing.lg,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  weekDayBarContainer: {
    flex: 1,
    width: 20,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekDayBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    minHeight: 4,
  },
  weekDayBarToday: {
    backgroundColor: colors.primary,
  },
  weekDayNum: {
    fontSize: 10,
  },
  // Calendar
  calendarCard: {
    gap: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarGrid: {
    gap: spacing.xs,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakDay: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: {
    backgroundColor: colors.primaryMuted,
  },
  streakDayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  streakDayFill: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotInactive: {
    backgroundColor: colors.surfaceHighlight,
  },
  legendDotActive: {
    backgroundColor: colors.primary,
  },
  // JLPT Progress
  jlptList: {
    gap: spacing.md,
  },
  jlptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  jlptRowLocked: {
    opacity: 0.5,
  },
  jlptProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  jlptProgress: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  jlptPercent: {
    width: 40,
    textAlign: 'right',
  },
  premiumNote: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
});

export default ProgressScreen;
