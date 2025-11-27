import { Platform, TextStyle } from 'react-native';

/**
 * Typography system for Ganba Hero
 * Uses system fonts for best Japanese character support
 */

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", sans-serif',
  default: 'System',
});

// Japanese-specific font for better kanji/kana rendering
const japaneseFontFamily = Platform.select({
  ios: 'Hiragino Sans',
  android: 'Noto Sans JP',
  web: '"Noto Sans JP", "Hiragino Sans", sans-serif',
  default: 'System',
});

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Pre-defined text styles
export const typography = {
  // Headings
  h1: {
    fontFamily,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,

  h4: {
    fontFamily,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TextStyle,

  // Body text
  body: {
    fontFamily,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,

  bodyLarge: {
    fontFamily,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,

  // Labels & captions
  label: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,

  caption: {
    fontFamily,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,

  // Button text
  button: {
    fontFamily,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.tight,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
  } as TextStyle,

  // Japanese text - larger for readability
  japanese: {
    fontFamily: japaneseFontFamily,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes['3xl'] * lineHeights.relaxed,
  } as TextStyle,

  japaneseLarge: {
    fontFamily: japaneseFontFamily,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes['5xl'] * lineHeights.relaxed,
  } as TextStyle,

  japaneseSmall: {
    fontFamily: japaneseFontFamily,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xl * lineHeights.relaxed,
  } as TextStyle,

  // Furigana (reading above kanji)
  furigana: {
    fontFamily: japaneseFontFamily,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.tight,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;

