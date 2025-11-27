/**
 * Spacing system for Ganba Hero
 * Based on 4px grid for consistency
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
} as const;

export type SpacingSize = keyof typeof spacing;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export type BorderRadiusSize = keyof typeof borderRadius;

// Common layout sizes
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.xl,

  // Card padding
  cardPadding: spacing.lg,
  cardPaddingSmall: spacing.md,

  // Button heights
  buttonHeightSmall: 36,
  buttonHeightMedium: 44,
  buttonHeightLarge: 52,

  // Input heights
  inputHeight: 48,
  inputHeightSmall: 40,

  // Icon sizes
  iconSizeSmall: 16,
  iconSizeMedium: 24,
  iconSizeLarge: 32,
  iconSizeXLarge: 48,

  // Avatar sizes
  avatarSizeSmall: 32,
  avatarSizeMedium: 48,
  avatarSizeLarge: 64,
  avatarSizeXLarge: 96,

  // Max content width for desktop
  maxContentWidth: 900,

  // Sidebar width for desktop
  sidebarWidth: 280,

  // Tab bar height
  tabBarHeight: 60,

  // Header height
  headerHeight: 56,
} as const;

// Shadows for elevation
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

export type ShadowSize = keyof typeof shadows;

