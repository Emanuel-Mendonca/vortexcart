import { useState } from 'react';
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Button, Card, ConfirmModal, EmptyState, IconButton, TextField } from '@/components';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import type { CatalogoItem } from '@/types';

export function ItensScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const catalogo = useComprasStore((s) => s.catalogo);
  const adicionarItemCatalogo = useComprasStore((s) => s.adicionarItemCatalogo);
  const renomearItemCatalogo = useComprasStore((s) => s.renomearItemCatalogo);
  const removerItemCatalogo = useComprasStore((s) => s.removerItemCatalogo);

  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [confirmarRemocao, setConfirmarRemocao] = useState<CatalogoItem | null>(null);

  async function handleAdicionar() {
    if (!novoNome.trim()) return;
    await adicionarItemCatalogo(novoNome.trim());
    setNovoNome('');
  }

  function iniciarEdicao(item: CatalogoItem) {
    setEditandoId(item.id);
    setNomeEdicao(item.nome);
  }

  async function salvarEdicao(id: number) {
    if (!nomeEdicao.trim()) return;
    await renomearItemCatalogo(id, nomeEdicao.trim());
    setEditandoId(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg }}>
        <Card style={{ marginBottom: 0 }}>
          <Text
            style={{
              fontFamily: theme.fontFamily.extraBold,
              fontSize: theme.type.title.fontSize,
              color: theme.colors.text,
              marginBottom: 16
            }}
          >
            Catálogo de itens
          </Text>

          <View style={styles.addRow}>
            <View style={{ flex: 1 }}>
              <TextField
                placeholder="Nome do novo item, ex: Arroz"
                value={novoNome}
                onChangeText={setNovoNome}
              />
            </View>
            <Button label="Adicionar" onPress={handleAdicionar} />
          </View>

          {catalogo.length === 0 ? (
            <EmptyState icon="list-outline" message="Nenhum item no catálogo ainda." />
          ) : (
            <FlatList
              data={catalogo}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: theme.borderWidth.hairline,
                    backgroundColor: theme.colors.borderMuted
                  }}
                />
              )}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  {editandoId === item.id ? (
                    <View style={{ flex: 1 }}>
                      <TextField value={nomeEdicao} onChangeText={setNomeEdicao} />
                    </View>
                  ) : (
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: theme.fontFamily.semiBold,
                        fontSize: theme.type.body.fontSize,
                        color: theme.colors.text
                      }}
                    >
                      {item.nome}
                    </Text>
                  )}

                  {editandoId === item.id ? (
                    <IconButton
                      name="checkmark-outline"
                      color={theme.colors.primary}
                      onPress={() => salvarEdicao(item.id)}
                    />
                  ) : (
                    <IconButton
                      name="pencil-outline"
                      color={theme.colors.textFaint}
                      onPress={() => iniciarEdicao(item)}
                    />
                  )}
                  <IconButton
                    name="trash-outline"
                    color={theme.colors.textFaint}
                    onPress={() => setConfirmarRemocao(item)}
                  />
                </View>
              )}
            />
          )}

          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: theme.type.caption.fontSize,
              color: theme.colors.textMuted,
              marginTop: 14,
              lineHeight: 18
            }}
          >
            Esses itens aparecem como sugestão ao registrar uma compra. Editar ou remover um item
            aqui não altera compras já salvas.
          </Text>
        </Card>
      </View>

      <ConfirmModal
        visible={confirmarRemocao != null}
        message={`Remover "${confirmarRemocao?.nome ?? ''}" do catálogo?`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmarRemocao) void removerItemCatalogo(confirmarRemocao.id);
        }}
        onDismiss={() => setConfirmarRemocao(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }
});
