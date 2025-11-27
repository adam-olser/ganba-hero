/**
 * Link Account Banner
 * 
 * A dismissible banner prompting anonymous users to link their account.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Text, Caption } from '@/components/shared';
import { colors, spacing, borderRadius } from '@/theme';

interface LinkAccountBannerProps {
  onPress: () => void;
  onDismiss?: () => void;
}

export function LinkAccountBanner({ onPress, onDismiss }: LinkAccountBannerProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <View style={styles.textContainer}>
          <Text variant="label" color="textPrimary">Save your progress</Text>
          <Caption color="textSecondary">
            Link your account to keep your data safe
          </Caption>
        </View>
        <View style={styles.arrow}>
          <Text color="primary">→</Text>
        </View>
      </View>
      {onDismiss && (
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <Text color="textMuted" style={styles.dismissText}>✕</Text>
        </Pressable>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warningMuted,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  arrow: {
    paddingLeft: spacing.sm,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
  },
  dismissText: {
    fontSize: 12,
  },
});

export default LinkAccountBanner;

