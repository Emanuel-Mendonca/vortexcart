import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme
} from 'react-native';

import {
  AmbientGlow,
  Badge,
  Card,
  ConfirmModal,
  EmptyState,
  IconButton,
  Screen
} from '@/components';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import type { CompraComItens } from '@/types';
import { formatBRL } from '@/utils/currency';
import { currentMonthValue, monthLabel } from '@/utils/date';

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
  const [busca, setBusca] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const temFiltro = filtroMes != null || filtroMercado != null;

  function limparFiltros() {
    setFiltroMes(null);
    setFiltroMercado(null);
  }

  /**
   * Atalhos para os períodos mais consultados. Só aparecem quando existe
   * compra no período — oferecer "Mês passado" sem dado nenhum leva a uma
   * lista vazia e à impressão de que o filtro quebrou.
   */
  const atalhosPeriodo = useMemo(() => {
    const agora = new Date();
    const candidatos = [
      { rotulo: 'Este mês', mes: currentMonthValue(agora) },
      {
        rotulo: 'Mês passado',
        mes: currentMonthValue(new Date(agora.getFullYear(), agora.getMonth() - 1, 1))
      }
    ];
    return candidatos.filter((c) => mesesDisponiveis.includes(c.mes));
  }, [mesesDisponiveis]);

  /** Meses agrupados por ano — uma lista corrida vira um paredão de chips. */
  const mesesPorAno = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const mes of mesesDisponiveis) {
      const ano = mes.slice(0, 4);
      const lista = mapa.get(ano) ?? [];
      lista.push(mes);
      mapa.set(ano, lista);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([ano, meses]) => ({ ano, meses }));
  }, [mesesDisponiveis]);

  const comprasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return compras;
    return compras.filter(
      (c) =>
        c.mercadoNome.toLowerCase().includes(termo) ||
        c.itens.some((i) => i.nome.toLowerCase().includes(termo))
    );
  }, [compras, busca]);

  const grupos = useMemo<GrupoMes[]>(() => {
    const mapa = new Map<string, CompraComItens[]>();
    for (const compra of comprasFiltradas) {
      const lista = mapa.get(compra.mes) ?? [];
      lista.push(compra);
      mapa.set(compra.mes, lista);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([mes, comprasDoMes]) => ({ mes, compras: comprasDoMes }));
  }, [comprasFiltradas]);

  const totalPeriodo = comprasFiltradas.reduce((soma, c) => soma + c.total, 0);
  const rotuloPeriodo = filtroMes ? monthLabel(filtroMes) : 'Todo o período';

  return (
    <Screen>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={grupos}
        keyExtractor={(g) => g.mes}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <AmbientGlow
              color={theme.colors.primary}
              size={240}
              top={-40}
              left={-90}
              opacity={0.16}
            />
            <AmbientGlow
              color={theme.colors.accent}
              size={200}
              top={160}
              right={-80}
              opacity={0.1}
            />

            <View
              style={[
                styles.searchWrap,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
              ]}
            >
              <Ionicons name="search-outline" size={18} color={theme.colors.textFaint} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar por mercado ou produto..."
                placeholderTextColor={theme.colors.textFaint}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
              {busca.length > 0 ? (
                <Pressable onPress={() => setBusca('')} hitSlop={8}>
                  <Ionicons name="close" size={18} color={theme.colors.textFaint} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filtros}>
              <FiltroChip
                label={filtroMes ? monthLabel(filtroMes) : 'Todos os meses'}
                ativo={filtroMes != null}
                onPress={() => setFiltrosAbertos((v) => !v)}
                icon="calendar-outline"
              />
              <FiltroChip
                label={filtroMercado ?? 'Todos os mercados'}
                ativo={filtroMercado != null}
                onPress={() => setFiltrosAbertos((v) => !v)}
                icon="storefront-outline"
              />
              {temFiltro ? (
                <Pressable onPress={limparFiltros} hitSlop={8} style={styles.limparFiltros}>
                  <Ionicons name="close-circle" size={14} color={theme.colors.textMuted} />
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: theme.type.caption.fontSize,
                      color: theme.colors.textMuted
                    }}
                  >
                    limpar
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {filtrosAbertos ? (
              <View>
                {atalhosPeriodo.length > 0 ? (
                  <View style={styles.chipsRow}>
                    {atalhosPeriodo.map((atalho) => (
                      <FiltroChip
                        key={atalho.rotulo}
                        label={atalho.rotulo}
                        ativo={filtroMes === atalho.mes}
                        onPress={() => setFiltroMes(filtroMes === atalho.mes ? null : atalho.mes)}
                        compact
                      />
                    ))}
                  </View>
                ) : null}

                {mesesPorAno.map(({ ano, meses }) => (
                  <View key={ano}>
                    <Text style={[styles.grupoFiltroLabel, { color: theme.colors.textFaint }]}>
                      {ano}
                    </Text>
                    <View style={styles.chipsRow}>
                      {meses.map((mes) => (
                        <FiltroChip
                          key={mes}
                          label={rotuloMesCurto(mes)}
                          ativo={filtroMes === mes}
                          onPress={() => setFiltroMes(filtroMes === mes ? null : mes)}
                          compact
                        />
                      ))}
                    </View>
                  </View>
                ))}

                {mercadosSugeridos.length > 0 ? (
                  <View>
                    <Text style={[styles.grupoFiltroLabel, { color: theme.colors.textFaint }]}>
                      Comércios
                    </Text>
                    <View style={styles.chipsRow}>
                      {mercadosSugeridos.map((mercado) => (
                        <FiltroChip
                          key={mercado}
                          label={mercado}
                          ativo={filtroMercado === mercado}
                          onPress={() =>
                            setFiltroMercado(filtroMercado === mercado ? null : mercado)
                          }
                          compact
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {comprasFiltradas.length > 0 ? (
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderColor: theme.colors.borderMuted
                  }
                ]}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.bold,
                      fontSize: 11,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: theme.colors.primary
                    }}
                  >
                    {rotuloPeriodo}
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.extraBold,
                      fontSize: theme.type.headline.fontSize,
                      color: theme.colors.text,
                      marginTop: 2
                    }}
                  >
                    {formatBRL(totalPeriodo)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.medium,
                      fontSize: theme.type.caption.fontSize,
                      color: theme.colors.textMuted
                    }}
                  >
                    {comprasFiltradas.length}{' '}
                    {comprasFiltradas.length === 1 ? 'compra registrada' : 'compras registradas'}
                  </Text>
                </View>
                <View style={[styles.summaryIcon, { backgroundColor: theme.colors.background }]}>
                  <Ionicons name="receipt-outline" size={22} color={theme.colors.accent} />
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            message={
              busca
                ? 'Nenhuma compra encontrada para essa busca.'
                : 'Nenhuma compra registrada ainda.\nVá em "Nova Compra" para começar.'
            }
          />
        }
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
                  <View style={[styles.marketIcon, { backgroundColor: theme.colors.background }]}>
                    <Ionicons name="storefront" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
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
                      {compra.metodoPagamentoNome ? ` · ${compra.metodoPagamentoNome}` : ''}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
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
                  <Text
                    style={{ fontFamily: theme.fontFamily.extraBold, color: theme.colors.text }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{ fontFamily: theme.fontFamily.extraBold, color: theme.colors.text }}
                  >
                    {formatBRL(compra.total)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      />

      <ConfirmModal
        visible={confirmarExclusaoId != null}
        message="Excluir esta compra? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmarExclusaoId != null) void excluirCompra(confirmarExclusaoId);
        }}
        onDismiss={() => setConfirmarExclusaoId(null)}
      />
    </Screen>
  );
}

/** "setembro de 2026" -> "Set" — dentro do grupo do ano, o ano é redundante. */
function rotuloMesCurto(mes: string): string {
  const completo = monthLabel(mes);
  const nome = completo.split(' de ')[0] ?? completo;
  return nome.charAt(0).toUpperCase() + nome.slice(1, 3);
}

function FiltroChip({
  label,
  ativo,
  onPress,
  compact,
  icon
}: {
  label: string;
  ativo: boolean;
  onPress: () => void;
  compact?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: theme.colors.borderMuted,
          borderWidth: theme.borderWidth.hairline,
          backgroundColor: ativo ? theme.colors.primary : theme.colors.surfaceAlt,
          paddingVertical: compact ? 6 : 9
        }
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={ativo ? theme.colors.onPrimary : theme.colors.textMuted}
        />
      ) : null}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12
  },
  searchInput: { flex: 1, fontSize: 14 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  limparFiltros: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  grupoFiltroLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 6
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    borderRadius: 20,
    maxWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    marginBottom: 18
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10
  },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  marketIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemsBlock: { marginTop: 10, paddingTop: 8 },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3
  },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8 }
});
