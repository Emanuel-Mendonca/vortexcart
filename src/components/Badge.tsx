import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface BadgeProps {
  label: string;
  icon?: IoniconName;
  variant?: 'accent' | 'primary';
}

export function Badge({ label, icon, variant = 'accent' }: BadgeProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const backgroundColor = variant === 'accent' ? theme.colors.accent : theme.colors.primary;
  const textColor = variant === 'accent' ? theme.colors.onAccent : theme.colors.onPrimary;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth.bold
        }
      ]}
    >
      {icon ? <Ionicons name={icon} size={11} color={textColor} /> : null}
      <Text style={{ fontFamily: theme.fontFamily.extraBold, fontSize: 10, color: textColor }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start'
  }
});
