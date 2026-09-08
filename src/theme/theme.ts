import { borderWidth, colorTokens, fontFamily, radii, shadows, spacing, typeScale } from './tokens';
import type { ColorScheme, ColorTokens } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  fontFamily: typeof fontFamily;
  type: typeof typeScale;
  borderWidth: typeof borderWidth;
}

function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: colorTokens[scheme],
    spacing,
    radii,
    shadows,
    fontFamily,
    type: typeScale,
    borderWidth
  };
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

export function getTheme(scheme: ColorScheme): Theme {
  return scheme === 'dark' ? darkTheme : lightTheme;
}
