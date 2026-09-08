import type { ReactNode } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth.bold,
          borderRadius: theme.radii.lg,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  }
});
