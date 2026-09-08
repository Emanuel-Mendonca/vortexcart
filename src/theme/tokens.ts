/**
 * Design Tokens
 * -----------------------------------------------------------------------
 * Fonte única de verdade para cores, tipografia, espaçamento e raios.
 * A paleta reaproveita a identidade já criada para a versão web do
 * "Controle da Compra": roxo elétrico + lima + preto sobre branco,
 * com bordas grossas e sombras "hard" (offset sólido, sem blur).
 */

export const palette = {
  purple: '#4F1FFF',
  purpleDark: '#3F19CC',
  lime: '#D8F33D',
  black: '#000000',
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
    surfaceAlt: '#F4F4F4',
    text: palette.black,
    textMuted: 'rgba(0,0,0,0.55)',
    textFaint: 'rgba(0,0,0,0.35)',
    border: palette.black,
    borderMuted: 'rgba(0,0,0,0.14)',
    primary: palette.purple,
    primaryPressed: palette.purpleDark,
    onPrimary: palette.white,
    accent: palette.lime,
    onAccent: palette.black,
    danger: palette.black,
    overlay: 'rgba(0,0,0,0.6)'
  },
  dark: {
    background: palette.black,
    surface: '#111111',
    surfaceAlt: '#1B1B1B',
    text: palette.white,
    textMuted: 'rgba(255,255,255,0.6)',
    textFaint: 'rgba(255,255,255,0.4)',
    border: palette.white,
    borderMuted: 'rgba(255,255,255,0.16)',
    primary: '#7B5CFF',
    primaryPressed: palette.purple,
    onPrimary: palette.white,
    accent: palette.lime,
    onAccent: palette.black,
    danger: '#FF6B6B',
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

// offset sólido (sem blur) para o efeito de "sombra dura" da identidade visual
export const shadows = {
  sm: { offset: 3 },
  md: { offset: 6 }
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
  bold: 2
} as const;
