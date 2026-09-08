import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Badge, Card, ConfirmModal, EmptyState, IconButton } from '@/components';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import type { CompraComItens } from '@/types';
import { formatBRL } from '@/utils/currency';
import { monthLabel } from '@/utils/date';

interface GrupoMes {
  mes: string;
  compras: CompraComItens[];
}

export function HistoricoScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const router = useRouter();

  const compras = useComprasStore((s) => s.compras);
  const mesesDisponiveis = useComprasStore((s) => s.mesesDisponiveis);
  const mercadosSugeridos = useComprasStore((s) => s.mercadosSugeridos);
  const filtroMes = useComprasStore((s) => s.filtroMes);
  const filtroMercado = useComprasStore((s) => s.filtroMercado);
  const setFiltroMes = useComprasStore((s) => s.setFiltroMes);
  const setFiltroMercado = useComprasStore((s) => s.setFiltroMercado);
  const iniciarEdicao = useComprasStore((s) => s.iniciarEdicao);
  const excluirCompra = useComprasStore((s) => s.excluirCompra);

  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<number | null>(null);

  const grupos = useMemo<GrupoMes[]>(() => {
    const mapa = new Map<string, CompraComItens[]>();
    for (const compra of compras) {
      const lista = mapa.get(compra.mes) ?? [];
      lista.push(compra);
      mapa.set(compra.mes, lista);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([mes, comprasDoMes]) => ({ mes, compras: comprasDoMes }));
  }, [compras]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.filtros}>
        <FiltroChip
          label={filtroMes ? monthLabel(filtroMes) : 'Todos os meses'}
          ativo={filtroMes != null}
          onPress={() => setFiltroMes(null)}
        />
        <FiltroChip
          label={filtroMercado ?? 'Todos os mercados'}
          ativo={filtroMercado != null}
          onPress={() => setFiltroMercado(null)}
        />
      </View>

      {mesesDisponiveis.length > 0 ? (
        <View style={styles.chipsRow}>
          {mesesDisponiveis.map((mes) => (
            <FiltroChip
              key={mes}
              label={monthLabel(mes)}
              ativo={filtroMes === mes}
              onPress={() => setFiltroMes(filtroMes === mes ? null : mes)}
              compact
            />
          ))}
        </View>
      ) : null}

      {mercadosSugeridos.length > 0 ? (
        <View style={styles.chipsRow}>
          {mercadosSugeridos.map((mercado) => (
            <FiltroChip
              key={mercado}
              label={mercado}
              ativo={filtroMercado === mercado}
              onPress={() => setFiltroMercado(filtroMercado === mercado ? null : mercado)}
              compact
            />
          ))}
        </View>
      ) : null}

      {grupos.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          message={'Nenhuma compra registrada ainda.\nVá em "Nova Compra" para começar.'}
        />
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(g) => g.mes}
          contentContainerStyle={{ padding: theme.spacing.lg }}
          renderItem={({ item: grupo }) => (
            <View style={{ marginBottom: 20 }}>
              <View
                style={[styles.mesBadge, { backgroundColor: theme.colors.text, borderRadius: 20 }]}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.extraBold,
                    fontSize: theme.type.caption.fontSize,
                    color: theme.colors.background,
                    textTransform: 'capitalize'
                  }}
                >
                  {monthLabel(grupo.mes)}
                </Text>
              </View>

              {grupo.compras.map((compra) => (
                <Card key={compra.id}>
                  <View style={styles.receiptHeader}>
                    <View>
                      <Text
                        style={{
                          fontFamily: theme.fontFamily.extraBold,
                          fontSize: theme.type.bodyLg.fontSize,
                          color: theme.colors.text
                        }}
                      >
                        {compra.mercadoNome}
                      </Text>
                      <Text
                        style={{
                          fontFamily: theme.fontFamily.medium,
                          fontSize: theme.type.caption.fontSize,
                          color: theme.colors.textMuted
                        }}
                      >
                        {compra.itens.length} {compra.itens.length === 1 ? 'item' : 'itens'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <IconButton
                        name="pencil-outline"
                        color={theme.colors.textFaint}
                        onPress={() => {
                          iniciarEdicao(compra.id);
                          router.push('/');
                        }}
                      />
                      <IconButton
                        name="close-outline"
                        color={theme.colors.textFaint}
                        onPress={() => setConfirmarExclusaoId(compra.id)}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.itemsBlock,
                      {
                        borderTopColor: theme.colors.borderMuted,
                        borderTopWidth: theme.borderWidth.hairline
                      }
                    ]}
                  >
                    {compra.itens.map((item) => (
                      <View key={item.id} style={styles.itemLine}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}
                        >
                          <Text
                            style={{
                              fontFamily: theme.fontFamily.semiBold,
                              fontSize: theme.type.body.fontSize,
                              color: theme.colors.text
                            }}
                          >
                            {item.nome} ×{item.quantidade}
                          </Text>
                          {item.extra ? <Badge label="Extra" variant="primary" /> : null}
                        </View>
                        <Text
                          style={{
                            fontFamily: theme.fontFamily.semiBold,
                            fontSize: theme.type.body.fontSize,
                            color: theme.colors.text
                          }}
                        >
                          {formatBRL(item.quantidade * item.valorUnitario)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.totalLine,
                      {
                        borderTopColor: theme.colors.border,
                        borderTopWidth: theme.borderWidth.bold
                      }
                    ]}
                  >
                    <Text style={{ fontFamily: theme.fontFamily.extraBold }}>Total</Text>
                    <Text style={{ fontFamily: theme.fontFamily.extraBold }}>
                      {formatBRL(compra.total)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        />
      )}

      <ConfirmModal
        visible={confirmarExclusaoId != null}
        message="Excluir esta compra? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmarExclusaoId != null) void excluirCompra(confirmarExclusaoId);
        }}
        onDismiss={() => setConfirmarExclusaoId(null)}
      />
    </View>
  );
}

function FiltroChip({
  label,
  ativo,
  onPress,
  compact
}: {
  label: string;
  ativo: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth.bold,
          backgroundColor: ativo ? theme.colors.primary : theme.colors.background,
          paddingVertical: compact ? 6 : 9
        }
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.type.caption.fontSize,
          color: ativo ? theme.colors.onPrimary : theme.colors.text,
          textTransform: 'capitalize'
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  chip: { paddingHorizontal: 14, borderRadius: 20, maxWidth: 200 },
  mesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  itemsBlock: { marginTop: 10, paddingTop: 8 },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8
  }
});
