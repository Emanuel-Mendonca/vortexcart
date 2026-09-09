import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

interface ToastProps {
  message: string | null;
  onHide: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Feedback rápido e não-bloqueante (ex.: "exportação concluída"), some sozinho. */
export function Toast({ message, onHide, icon = 'checkmark-circle' }: ToastProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        onHide();
      });
    }, 2600);
    return () => clearTimeout(timer);
  }, [message, opacity, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          opacity,
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.borderMuted,
          borderWidth: theme.borderWidth.hairline,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10
        }
      ]}
    >
      <Ionicons name={icon} size={16} color={theme.colors.accent} />
      <Text
        style={{
          fontFamily: theme.fontFamily.semiBold,
          fontSize: theme.type.caption.fontSize,
          color: theme.colors.text
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  }
});
