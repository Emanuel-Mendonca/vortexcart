import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon: IoniconName;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <View style={styles.wrapper}>
      <Ionicons name={icon} size={32} color={theme.colors.textFaint} />
      <Text
        style={{
          fontFamily: theme.fontFamily.semiBold,
          fontSize: theme.type.body.fontSize,
          color: theme.colors.textMuted,
          textAlign: 'center',
          marginTop: 10
        }}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }
});
