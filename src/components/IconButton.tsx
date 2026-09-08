import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  name: IoniconName;
  onPress: () => void;
  color: string;
  size?: number;
}

export function IconButton({ name, onPress, color, size = 18 }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.base}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { padding: 6 }
});
