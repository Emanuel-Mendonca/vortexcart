import { Modal, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';

import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onDismiss: () => void;
}

export function ConfirmModal({
  visible,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onDismiss
}: ConfirmModalProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: theme.borderWidth.bold,
              borderRadius: theme.radii.lg
            }
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fontFamily.semiBold,
              fontSize: theme.type.bodyLg.fontSize,
              color: theme.colors.text,
              marginBottom: 18
            }}
          >
            {message}
          </Text>
          <View style={styles.actions}>
            {onConfirm ? (
              <>
                <View style={styles.actionItem}>
                  <Button label="Cancelar" variant="secondary" onPress={onDismiss} />
                </View>
                <View style={styles.actionItem}>
                  <Button
                    label={confirmLabel}
                    variant="primary"
                    onPress={() => {
                      onConfirm();
                      onDismiss();
                    }}
                  />
                </View>
              </>
            ) : (
              <View style={styles.actionItem}>
                <Button label="Ok" variant="primary" onPress={onDismiss} />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 360, padding: 22 },
  actions: { flexDirection: 'row', gap: 10 },
  actionItem: { flex: 1 }
});
