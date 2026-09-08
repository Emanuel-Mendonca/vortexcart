import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: (value: boolean) => void;
}

export function Checkbox({ checked, onToggle }: CheckboxProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <Pressable
      onPress={() => onToggle(!checked)}
      style={[
        styles.box,
        {
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth.bold,
          borderRadius: 4,
          backgroundColor: checked ? theme.colors.primary : 'transparent'
        }
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
