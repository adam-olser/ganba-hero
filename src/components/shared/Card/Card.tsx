/**
 * Card Component
 * 
 * Container component with consistent styling.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({
  variant = 'default',
  padding = 'medium',
  children,
  style,
  ...props
}: CardProps) {
  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ].filter(Boolean) as ViewStyle[];
  
  return (
    <View style={containerStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
  },
  
  // Variants
  variant_default: {
    backgroundColor: colors.surface,
  },
  variant_elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  variant_outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Padding
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: spacing.md,
  },
  padding_medium: {
    padding: spacing.lg,
  },
  padding_large: {
    padding: spacing.xl,
  },
});

export default Card;

