/**
 * Ganba Hero Color Palette
 * Dark theme with warm orange/gold accent
 */

export const colors = {
  // Dark mode base
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#262626',
  surfaceHighlight: '#333333',

  // Primary - Orange/warm accent (matches shrimp mascot)
  primary: '#FF8C42',
  primaryLight: '#FFB380',
  primaryDark: '#CC6620',
  primaryMuted: 'rgba(255, 140, 66, 0.15)',

  // Secondary
  secondary: '#FFD700',
  secondaryLight: '#FFE44D',
  secondaryDark: '#B89B00',

  // Feedback colors
  success: '#4ADE80',
  successLight: '#86EFAC',
  successDark: '#22C55E',
  successMuted: 'rgba(74, 222, 128, 0.15)',

  error: '#F87171',
  errorLight: '#FCA5A5',
  errorDark: '#EF4444',
  errorMuted: 'rgba(248, 113, 113, 0.15)',

  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',

  info: '#60A5FA',
  infoLight: '#93C5FD',
  infoDark: '#3B82F6',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#525252',
  textDisabled: '#404040',
  textInverse: '#0D0D0D',

  // Border colors
  border: '#333333',
  borderLight: '#404040',
  borderFocus: '#FF8C42',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // JLPT Level colors
  jlptN5: '#4ADE80', // Green - Beginner
  jlptN4: '#60A5FA', // Blue
  jlptN3: '#FBBF24', // Yellow
  jlptN2: '#F97316', // Orange
  jlptN1: '#EF4444', // Red - Advanced

  // Streak/XP colors
  streak: '#FF8C42',
  xp: '#FFD700',
  level: '#A78BFA',

  // Transparent
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

// Helper to get JLPT color
export function getJlptColor(level: string): string {
  const levelColors: Record<string, string> = {
    N5: colors.jlptN5,
    N4: colors.jlptN4,
    N3: colors.jlptN3,
    N2: colors.jlptN2,
    N1: colors.jlptN1,
  };
  return levelColors[level] || colors.textSecondary;
}

