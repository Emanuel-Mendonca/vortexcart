import { StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';

import { getTheme } from '@/theme';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  textAlign?: 'left' | 'right';
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  textAlign = 'left'
}: TextFieldProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={{
            fontFamily: theme.fontFamily.semiBold,
            fontSize: theme.type.caption.fontSize,
            color: theme.colors.textMuted,
            textTransform: 'uppercase',
            marginBottom: 4
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textFaint}
        keyboardType={keyboardType}
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderWidth: theme.borderWidth.bold,
            borderRadius: theme.radii.sm,
            color: theme.colors.text,
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            textAlign
          }
        ]}
      />
      {error ? (
        <Text
          style={{
            color: theme.colors.danger,
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.caption.fontSize,
            marginTop: 4
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  input: { paddingVertical: 10, paddingHorizontal: 11 }
});
