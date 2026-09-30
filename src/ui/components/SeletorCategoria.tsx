import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';
import { getCategoriaIcon } from '@/utils/categoria';

interface SeletorCategoriaProps {
  label?: string;
  categorias: readonly string[];
  valor: string;
  onChange: (categoria: string) => void;
}

/**
 * Escolha de departamento em um campo só.
 *
 * Mostrar os 15 departamentos como chips ocupava meia tela e competia com o
 * conteúdo. Aqui o campo exibe apenas o escolhido e abre a lista sob demanda
 *, o custo é um toque a mais, e o ganho é a tela respirar.
 */
export function SeletorCategoria({ label, categorias, valor, onChange }: SeletorCategoriaProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const [aberto, setAberto] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
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

      <Pressable
        onPress={() => setAberto(true)}
        style={[
          styles.campo,
          { borderColor: theme.colors.border, borderWidth: theme.borderWidth.bold }
        ]}
      >
        <Ionicons name={getCategoriaIcon(valor)} size={16} color={theme.colors.primary} />
        <Text
          style={{
            flex: 1,
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.text
          }}
        >
          {valor}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textFaint} />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setAberto(false)}>
          <Pressable
            style={[
              styles.lista,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
            ]}
            // Impede que o toque dentro da lista feche o modal.
            onPress={() => undefined}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.title.fontSize,
                color: theme.colors.text,
                padding: 16,
                paddingBottom: 8
              }}
            >
              Departamento
            </Text>
            <ScrollView>
              {categorias.map((cat) => {
                const ativo = cat === valor;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      onChange(cat);
                      setAberto(false);
                    }}
                    style={[
                      styles.opcao,
                      { backgroundColor: ativo ? theme.colors.surfaceAlt : 'transparent' }
                    ]}
                  >
                    <Ionicons
                      name={getCategoriaIcon(cat)}
                      size={18}
                      color={ativo ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: ativo ? theme.fontFamily.bold : theme.fontFamily.medium,
                        fontSize: theme.type.body.fontSize,
                        color: ativo ? theme.colors.text : theme.colors.textMuted
                      }}
                    >
                      {cat}
                    </Text>
                    {ativo ? (
                      <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 11,
    borderRadius: 8
  },
  overlay: { flex: 1, justifyContent: 'center', padding: 24 },
  lista: { borderRadius: 20, borderWidth: 1, maxHeight: '75%', overflow: 'hidden' },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13
  }
});
