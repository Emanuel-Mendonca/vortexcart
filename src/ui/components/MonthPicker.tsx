import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { MESES_PT } from '@/constants';
import { getTheme } from '@/theme';
import { buildMonthValue, monthLabel, parseMonthValue } from '@/utils/date';

import { Button } from './Button';

interface MonthPickerProps {
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const [open, setOpen] = useState(false);

  const { ano, mesIndex } = parseMonthValue(value);
  const [anoRascunho, setAnoRascunho] = useState(ano);
  const [mesRascunho, setMesRascunho] = useState(mesIndex);

  function abrir() {
    const atual = parseMonthValue(value);
    setAnoRascunho(atual.ano);
    setMesRascunho(atual.mesIndex);
    setOpen(true);
  }

  function confirmar() {
    onChange(buildMonthValue(anoRascunho, mesRascunho));
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={abrir}
        style={[
          styles.trigger,
          {
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.bold,
            borderRadius: theme.radii.sm
          }
        ]}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.text
          }}
        >
          {monthLabel(value)}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
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
            <View style={styles.yearRow}>
              <IconStep
                icon="chevron-back"
                color={theme.colors.text}
                onPress={() => setAnoRascunho((a) => a - 1)}
              />
              <Text
                style={{
                  fontFamily: theme.fontFamily.extraBold,
                  fontSize: theme.type.headline.fontSize,
                  color: theme.colors.text
                }}
              >
                {anoRascunho}
              </Text>
              <IconStep
                icon="chevron-forward"
                color={theme.colors.text}
                onPress={() => setAnoRascunho((a) => a + 1)}
              />
            </View>

            <FlatList
              data={MESES_PT}
              numColumns={3}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: 8 }}
              columnWrapperStyle={{ gap: 8 }}
              renderItem={({ item, index }) => {
                const selecionado = index === mesRascunho;
                return (
                  <Pressable
                    onPress={() => setMesRascunho(index)}
                    style={[
                      styles.monthCell,
                      {
                        borderColor: theme.colors.border,
                        borderWidth: theme.borderWidth.thin,
                        borderRadius: theme.radii.sm,
                        backgroundColor: selecionado ? theme.colors.primary : 'transparent'
                      }
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.semiBold,
                        fontSize: theme.type.caption.fontSize,
                        color: selecionado ? theme.colors.onPrimary : theme.colors.text,
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={{ marginTop: 18 }}>
              <Button label="Confirmar" onPress={confirmar} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function IconStep({
  icon,
  color,
  onPress
}: {
  icon: 'chevron-back' | 'chevron-forward';
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={{ padding: 8 }}>
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 11
  },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 360, padding: 22 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 16
  },
  monthCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
