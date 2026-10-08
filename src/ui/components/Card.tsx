import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTema } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  const theme = useTema();
  const glow = theme.shadows.md;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.borderMuted,
          borderWidth: theme.borderWidth.hairline,
          borderRadius: theme.radii.lg,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: glow.offsetY },
          shadowOpacity: glow.opacity,
          shadowRadius: glow.blur,
          elevation: 6
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {}
});
