/**
 * Streak Calendar Component
 * 
 * Visual calendar showing study activity over the past weeks.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Caption } from '@/components/shared';
import { colors, spacing, borderRadius } from '@/theme';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  subWeeks,
  isToday,
  isFuture,
} from 'date-fns';

interface StudyDay {
  date: Date;
  studied: boolean;
  cardsReviewed?: number;
  goalMet?: boolean;
}

interface StreakCalendarProps {
  /** Array of dates when user studied */
  studyDays: Date[];
  /** Number of weeks to show (default: 7) */
  weeks?: number;
  /** Current streak count */
  currentStreak?: number;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakCalendar({ 
  studyDays, 
  weeks = 7,
  currentStreak = 0,
}: StreakCalendarProps) {
  // Generate calendar data
  const calendarData = useMemo(() => {
    const today = new Date();
    const endDate = endOfWeek(today, { weekStartsOn: 0 });
    const startDate = startOfWeek(subWeeks(endDate, weeks - 1), { weekStartsOn: 0 });
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create a Set of study day strings for fast lookup
    const studyDaySet = new Set(
      studyDays.map(d => format(d, 'yyyy-MM-dd'))
    );
    
    // Group days by week
    const weekGroups: StudyDay[][] = [];
    let currentWeek: StudyDay[] = [];
    
    allDays.forEach((day, index) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      currentWeek.push({
        date: day,
        studied: studyDaySet.has(dayStr),
      });
      
      if ((index + 1) % 7 === 0) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }
    
    return weekGroups;
  }, [studyDays, weeks]);

  const getDayStyle = (day: StudyDay) => {
    if (isFuture(day.date)) {
      return styles.dayFuture;
    }
    if (day.studied) {
      return styles.dayStudied;
    }
    if (isToday(day.date)) {
      return styles.dayToday;
    }
    return styles.dayMissed;
  };

  return (
    <View style={styles.container}>
      {/* Header with streak */}
      <View style={styles.header}>
        <View style={styles.streakInfo}>
          <Text style={styles.flameIcon}>🔥</Text>
          <Text variant="h3">{currentStreak}</Text>
          <Caption>day streak</Caption>
        </View>
      </View>

      {/* Day labels */}
      <View style={styles.dayLabels}>
        {DAYS.map((day, index) => (
          <View key={index} style={styles.dayLabelCell}>
            <Caption color="textMuted">{day}</Caption>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <View
                key={dayIndex}
                style={[styles.day, getDayStyle(day)]}
              >
                {isToday(day.date) && !day.studied && (
                  <View style={styles.todayDot} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dayMissed]} />
          <Caption color="textMuted">Missed</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dayStudied]} />
          <Caption color="textMuted">Studied</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dayFuture]} />
          <Caption color="textMuted">Future</Caption>
        </View>
      </View>
    </View>
  );
}

const CELL_SIZE = 28;
const CELL_GAP = 4;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  flameIcon: {
    fontSize: 20,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: CELL_GAP,
  },
  dayLabelCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  grid: {
    alignItems: 'center',
    gap: CELL_GAP,
  },
  week: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  day: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayStudied: {
    backgroundColor: colors.primary,
  },
  dayMissed: {
    backgroundColor: colors.surfaceHighlight,
  },
  dayToday: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayFuture: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  legend: {
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
    borderRadius: borderRadius.sm,
  },
});

export default StreakCalendar;

