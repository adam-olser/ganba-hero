/**
 * Grade Buttons Component
 * 
 * Buttons for grading flashcard answers using simplified SM-2 quality ratings.
 * Shows after the answer is revealed.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Caption } from '@/components/shared';
import { colors, spacing, borderRadius } from '@/theme';
import type { Quality } from '@/services/srs';

interface GradeButtonsProps {
  onGrade: (quality: Quality) => void;
  showHints?: boolean;
}

interface GradeOption {
  quality: Quality;
  label: string;
  sublabel: string;
  color: string;
}

const GRADE_OPTIONS: GradeOption[] = [
  {
    quality: 1,
    label: 'Again',
    sublabel: '< 1 min',
    color: colors.error,
  },
  {
    quality: 3,
    label: 'Hard',
    sublabel: '10 min',
    color: colors.warning,
  },
  {
    quality: 4,
    label: 'Good',
    sublabel: '1 day',
    color: colors.success,
  },
  {
    quality: 5,
    label: 'Easy',
    sublabel: '4 days',
    color: colors.info,
  },
];

export function GradeButtons({ onGrade, showHints = true }: GradeButtonsProps) {
  return (
    <View style={styles.container}>
      {GRADE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.quality}
          style={[styles.button, { borderColor: option.color }]}
          onPress={() => onGrade(option.quality)}
          activeOpacity={0.7}
        >
          <Text variant="label" style={{ color: option.color }}>
            {option.label}
          </Text>
          {showHints && (
            <Caption color="textMuted">{option.sublabel}</Caption>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    minHeight: 64,
  },
});

export default GradeButtons;

