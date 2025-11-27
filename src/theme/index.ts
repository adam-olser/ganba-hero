export { colors, getJlptColor, type ColorName } from './colors';
export {
  typography,
  fontSizes,
  fontWeights,
  lineHeights,
  type TypographyVariant,
} from './typography';
export {
  spacing,
  borderRadius,
  layout,
  shadows,
  type SpacingSize,
  type BorderRadiusSize,
  type ShadowSize,
} from './spacing';

// Re-export as default theme object for convenience
import { colors } from './colors';
import { typography, fontSizes, fontWeights } from './typography';
import { spacing, borderRadius, layout, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  layout,
  shadows,
} as const;

export default theme;