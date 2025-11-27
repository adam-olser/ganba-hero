/**
 * Skeleton Loading Components
 * 
 * Placeholder components for loading states with shimmer animation.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Easing } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

interface SkeletonProps {
  /** Width of the skeleton (number or percentage string) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  radius?: keyof typeof borderRadius | number;
  /** Additional style */
  style?: ViewStyle;
  /** Whether to animate the skeleton */
  animate?: boolean;
}

/**
 * Base skeleton component with optional shimmer animation
 */
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  radius = 'md',
  style,
  animate = true,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [animate, shimmer]);

  const opacity = animate 
    ? shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.6],
      })
    : 0.3;

  const borderRadiusValue = typeof radius === 'string' 
    ? borderRadius[radius] 
    : radius;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: borderRadiusValue,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton text line
 */
export function SkeletonText({ 
  lines = 1, 
  width = '100%',
  lastLineWidth = '60%',
  lineHeight = 16,
  gap = spacing.sm,
}: { 
  lines?: number;
  width?: number | string;
  lastLineWidth?: number | string;
  lineHeight?: number;
  gap?: number;
}) {
  return (
    <View style={[styles.textContainer, { gap }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={lineHeight}
          radius="sm"
        />
      ))}
    </View>
  );
}

/**
 * Skeleton card - common pattern for loading cards
 */
export function SkeletonCard({ 
  height = 120,
  style,
}: { 
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, { height }, style]}>
      <Skeleton width={60} height={60} radius="lg" />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="40%" height={14} />
        <Skeleton width="90%" height={14} />
      </View>
    </View>
  );
}

/**
 * Skeleton for flashcard
 */
export function SkeletonFlashcard() {
  return (
    <View style={styles.flashcard}>
      <Skeleton width={120} height={48} radius="md" />
      <Skeleton width="50%" height={24} style={styles.flashcardSpacer} />
      <Skeleton width="80%" height={20} />
    </View>
  );
}

/**
 * Skeleton for list item
 */
export function SkeletonListItem({ 
  hasAvatar = true,
  hasSubtitle = true,
}: { 
  hasAvatar?: boolean;
  hasSubtitle?: boolean;
}) {
  return (
    <View style={styles.listItem}>
      {hasAvatar && (
        <Skeleton width={48} height={48} radius="full" />
      )}
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={16} />
        {hasSubtitle && <Skeleton width="40%" height={12} />}
      </View>
    </View>
  );
}

/**
 * Skeleton for home screen stats
 */
export function SkeletonStats() {
  return (
    <View style={styles.stats}>
      <View style={styles.statItem}>
        <Skeleton width={40} height={32} radius="md" />
        <Skeleton width={60} height={12} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={60} height={32} radius="md" />
        <Skeleton width={40} height={12} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={50} height={32} radius="md" />
        <Skeleton width={50} height={12} />
      </View>
    </View>
  );
}

/**
 * Full screen loading skeleton
 */
export function SkeletonScreen() {
  return (
    <View style={styles.screen}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Skeleton width={200} height={28} radius="md" />
        <Skeleton width={40} height={40} radius="full" />
      </View>
      
      {/* Stats row */}
      <SkeletonStats />
      
      {/* Cards */}
      <View style={styles.cards}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceHighlight,
  },
  textContainer: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  flashcard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  flashcardSpacer: {
    marginVertical: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  listItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cards: {
    gap: spacing.md,
  },
});

export default Skeleton;

