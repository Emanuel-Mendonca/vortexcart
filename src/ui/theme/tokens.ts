/**
 * Design Tokens
 * -----------------------------------------------------------------------
 * Fonte única de verdade para cores, tipografia, espaçamento e raios.
 *
 * Paleta "Vortex", atmosférica, cósmica, glassmorphism. Extraída de um
 * esquema Material Design 3 (tons "primary/secondary/tertiary/surface"
 * completos, fornecidos para o tema escuro). O tema claro foi derivado
 * usando os próprios tokens "inverse-*" e "*-fixed*" do M3, que existem
 * exatamente para compor a versão oposta do tema de forma consistente
 * com a mesma paleta, não são cores inventadas à parte.
 */

export const palette = {
  lavender: '#CCBFF7',
  lavenderDeep: '#625788', // "inverse-primary" do M3, primary do tema claro
  gold: '#D3C87C',
  night: '#10131B',
  white: '#FFFFFF'
} as const;

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderMuted: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  danger: string;
  overlay: string;
}

export const colorTokens: Record<'light' | 'dark', ColorPalette> = {
  light: {
    background: palette.white,
    surface: palette.white,
    surfaceAlt: '#F3F0FA', // tonalidade clara da família lavanda
    text: '#1E1341', // "on-primary-fixed", texto escuro com matiz roxo
    textMuted: 'rgba(30,19,65,0.62)',
    textFaint: 'rgba(30,19,65,0.4)',
    border: '#7A7290',
    borderMuted: 'rgba(74,64,111,0.18)',
    primary: palette.lavenderDeep, // "inverse-primary" do M3
    primaryPressed: '#4A406F', // "on-primary-fixed-variant"
    onPrimary: palette.white,
    accent: palette.gold, // "tertiary"
    onAccent: '#363100', // "on-tertiary"
    danger: '#BA1A1A',
    overlay: 'rgba(16,19,27,0.6)'
  },
  dark: {
    background: palette.night, // "background" / "surface"
    surface: '#1D1F28', // "surface-container"
    surfaceAlt: '#272A32', // "surface-container-high"
    text: '#E1E2EE', // "on-surface"
    textMuted: 'rgba(225,226,238,0.65)',
    textFaint: 'rgba(225,226,238,0.4)',
    border: '#938F99', // "outline"
    borderMuted: '#48454E', // "outline-variant"
    primary: palette.lavender, // "primary"
    primaryPressed: '#B2A6DC', // "on-primary-container"
    onPrimary: '#332957', // "on-primary"
    accent: palette.gold, // "tertiary"
    onAccent: '#363100', // "on-tertiary"
    danger: '#FFB4AB', // "error"
    overlay: 'rgba(0,0,0,0.75)'
  }
};

export type ColorScheme = 'light' | 'dark';
export type ColorTokens = ColorPalette;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 14,
  xl: 20,
  pill: 999
} as const;

/**
 * Sombras suaves e "glow" colorido, para o efeito glassmorphism,
 * substituem o offset sólido/hard-edge da identidade anterior.
 */
export const shadows = {
  sm: { offsetY: 4, blur: 12, opacity: 0.22 },
  md: { offsetY: 10, blur: 28, opacity: 0.32 },
  glow: { offsetY: 0, blur: 24, opacity: 0.4 }
} as const;

export const fontFamily = {
  regular: 'Raleway_400Regular',
  medium: 'Raleway_500Medium',
  semiBold: 'Raleway_600SemiBold',
  bold: 'Raleway_700Bold',
  extraBold: 'Raleway_800ExtraBold'
} as const;

export const typeScale = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 14, lineHeight: 20 },
  bodyLg: { fontSize: 16, lineHeight: 22 },
  title: { fontSize: 18, lineHeight: 24 },
  headline: { fontSize: 22, lineHeight: 28 },
  display: { fontSize: 28, lineHeight: 34 }
} as const;

export const borderWidth = {
  hairline: 1,
  thin: 1.5,
  bold: 1.5
} as const;
