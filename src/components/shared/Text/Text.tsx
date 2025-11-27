/**
 * Text Component
 * 
 * Typography component with preset styles.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography, type TypographyVariant } from '@/theme';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience components
export function Heading1(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h1" {...props} />;
}

export function Heading2(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h2" {...props} />;
}

export function Heading3(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h3" {...props} />;
}

export function Heading4(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h4" {...props} />;
}

export function Body(props: Omit<TextProps, 'variant'>) {
  return <Text variant="body" {...props} />;
}

export function BodySmall(props: Omit<TextProps, 'variant'>) {
  return <Text variant="bodySmall" {...props} />;
}

export function Label(props: Omit<TextProps, 'variant'>) {
  return <Text variant="label" {...props} />;
}

export function Caption(props: Omit<TextProps, 'variant'>) {
  return <Text variant="caption" color="textSecondary" {...props} />;
}

export function JapaneseText(props: Omit<TextProps, 'variant'>) {
  return <Text variant="japanese" {...props} />;
}

export function JapaneseLarge(props: Omit<TextProps, 'variant'>) {
  return <Text variant="japaneseLarge" {...props} />;
}

export function Furigana(props: Omit<TextProps, 'variant'>) {
  return <Text variant="furigana" color="textSecondary" {...props} />;
}

export default Text;

