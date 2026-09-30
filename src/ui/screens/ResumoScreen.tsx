import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { AmbientGlow, Badge, Card, EmptyState, Screen, Toast } from '@/components';
import {
  ExportIndisponivelError,
  ImportCanceladoError,
  ImportInvalidoError,
  exportarCsv,
  exportarJson,
  exportarPdf,
  selecionarEImportarBackup
} from '@/services';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import { formatBRL } from '@/utils/currency';
import { monthLabel } from '@/utils/date';

type Operacao = 'json' | 'csv' | 'pdf' | 'importar' | null;

/** Altura útil da área das barras (sem os rótulos dos meses). */
const CHART_HEIGHT = 130;
/**
 * Espaço reservado acima da barra mais alta — cabe o balão com o valor
 * (`tooltip`, top: -22) e a barra não encosta no cabeçalho do card.
 */
const CHART_HEADROOM = 28;
/** Altura mínima para um mês com gasto ínfimo ainda ser tocável. */
const CHART_MIN_BAR = 6;
/** Largura de cada coluna no sistema de coordenadas do SVG. */
const CHART_COL = 48;

/**
 * Altura da barra em px — a MESMA função alimenta a barra e o ponto da linha,
 * para que a linha tracejada toque exatamente o topo de cada barra.
 */
function alturaBarra(total: number, maxMes: number): number {
  if (maxMes <= 0) return CHART_MIN_BAR;
  return Math.max(CHART_MIN_BAR, (total / maxMes) * (CHART_HEIGHT - CHART_HEADROOM));
}

export function ResumoScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const gastoPorMes = useComprasStore((s) => s.gastoPorMes);
  const comparativoMercados = useComprasStore((s) => s.comparativoMercados);
  const compras = useComprasStore((s) => s.compras);
  const catalogo = useComprasStore((s) => s.catalogo);
  const refreshTudo = useComprasStore((s) => s.refreshTudo);

  const [operacaoEmAndamento, setOperacaoEmAndamento] = useState<Operacao>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  const maxMes = Math.max(1, ...gastoPorMes.map((g) => g.total));
  const totalPeriodo = gastoPorMes.reduce((s, g) => s + g.total, 0);
  const mediaMensal = gastoPorMes.length > 0 ? totalPeriodo / gastoPorMes.length : 0;

  const variacao = useMemo(() => {
    if (gastoPorMes.length < 2) return null;
    const atual = gastoPorMes[gastoPorMes.length - 1]!.total;
    const anterior = gastoPorMes[gastoPorMes.length - 2]!.total;
    if (anterior === 0) return null;
    return ((atual - anterior) / anterior) * 100;
  }, [gastoPorMes]);

  const maxMercado = Math.max(1, ...comparativoMercados.map((m) => m.totalGasto));

  async function rodar(operacao: Operacao, acao: () => Promise<void>) {
    setOperacaoEmAndamento(operacao);
    try {
      await acao();
    } catch (erro) {
      if (erro instanceof ImportCanceladoError) return;
      if (erro instanceof ExportIndisponivelError || erro instanceof ImportInvalidoError) {
        setToastMsg(erro.message);
        return;
      }
      console.error(erro);
      setToastMsg('Algo deu errado. Tente novamente.');
    } finally {
      setOperacaoEmAndamento(null);
    }
  }

  async function handleImportar() {
    await rodar('importar', async () => {
      const resultado = await selecionarEImportarBackup();
      await refreshTudo();
      setToastMsg(`${resultado.comprasImportadas} compra(s) importada(s) com sucesso`);
    });
  }

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}
      >
        <AmbientGlow color={theme.colors.primary} size={240} top={-40} right={-90} opacity={0.16} />
        <AmbientGlow color={theme.colors.accent} size={180} top={260} left={-70} opacity={0.1} />

        <View
          style={[
            styles.headerCard,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
          ]}
        >
          <View style={styles.headerTop}>
            <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: 11,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: theme.colors.accent
              }}
            >
              Resumo financeiro
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                Total no período
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.extraBold,
                  fontSize: theme.type.headline.fontSize,
                  color: theme.colors.primary
                }}
              >
                {formatBRL(totalPeriodo)}
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 11,
                  color: theme.colors.textFaint
                }}
              >
                {gastoPorMes.length} {gastoPorMes.length === 1 ? 'mês mapeado' : 'meses mapeados'}
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                Média mensal
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.extraBold,
                  fontSize: theme.type.headline.fontSize,
                  color: theme.colors.text
                }}
              >
                {formatBRL(mediaMensal)}
              </Text>
              {variacao != null ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons
                    name={variacao <= 0 ? 'trending-down' : 'trending-up'}
                    size={12}
                    color={theme.colors.accent}
                  />
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: 11,
                      color: theme.colors.accent
                    }}
                  >
                    {variacao <= 0 ? '' : '+'}
                    {variacao.toFixed(1)}% vs mês anterior
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.type.bodyLg.fontSize,
                  color: theme.colors.text
                }}
              >
                Gasto por mês
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 11,
                  color: theme.colors.textMuted
                }}
              >
                Toque numa barra para ver o valor
              </Text>
            </View>
          </View>

          {gastoPorMes.length === 0 ? (
            <EmptyState icon="bar-chart-outline" message="Ainda sem dados suficientes." />
          ) : (
            <>
              {/* A área das barras e o SVG têm exatamente a mesma altura
                  (CHART_HEIGHT), e os rótulos ficam FORA dela — assim o
                  viewBox não é esticado e a linha cai onde a barra termina. */}
              <View style={styles.chartArea}>
                <Svg
                  style={StyleSheet.absoluteFill}
                  viewBox={`0 0 ${gastoPorMes.length * CHART_COL} ${CHART_HEIGHT}`}
                  preserveAspectRatio="none"
                >
                  <Polyline
                    points={gastoPorMes
                      .map((g, i) => {
                        const x = i * CHART_COL + CHART_COL / 2;
                        const y = CHART_HEIGHT - alturaBarra(g.total, maxMes);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={theme.colors.accent}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    opacity={0.7}
                  />
                </Svg>
                <View style={styles.barsRow}>
                  {gastoPorMes.map((g) => {
                    const selecionado = mesSelecionado === g.mes;
                    return (
                      <Pressable
                        key={g.mes}
                        style={styles.barColumn}
                        onPress={() => setMesSelecionado(selecionado ? null : g.mes)}
                      >
                        <View style={{ alignItems: 'center' }}>
                          {selecionado ? (
                            <View
                              style={[
                                styles.tooltip,
                                {
                                  backgroundColor: theme.colors.surfaceAlt,
                                  borderColor: theme.colors.border
                                }
                              ]}
                            >
                              <Text
                                style={{
                                  fontFamily: theme.fontFamily.bold,
                                  fontSize: 10,
                                  color: theme.colors.primary
                                }}
                              >
                                {formatBRL(g.total)}
                              </Text>
                            </View>
                          ) : null}
                          <LinearGradient
                            colors={[theme.colors.primary, theme.colors.accent]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={[styles.bar, { height: alturaBarra(g.total, maxMes) }]}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.labelsRow}>
                {gastoPorMes.map((g) => (
                  <Text
                    key={g.mes}
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      textTransform: 'capitalize'
                    }}
                  >
                    {monthLabel(g.mes).split(' de ')[0]?.slice(0, 3)}
                  </Text>
                ))}
              </View>
            </>
          )}
        </Card>

        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="storefront" size={18} color={theme.colors.primary} />
            </View>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.bodyLg.fontSize,
                color: theme.colors.text
              }}
            >
              Comparação de supermercados
            </Text>
          </View>

          {comparativoMercados.length === 0 ? (
            <EmptyState icon="storefront-outline" message="Ainda sem dados suficientes." />
          ) : (
            comparativoMercados.map((m, index) => (
              <View key={m.mercadoId} style={styles.marketBlock}>
                <View style={styles.marketTopRow}>
                  {/* Nome e valor na mesma linha, com o nome truncando: nomes
                      longos de mercado empurravam o valor para fora da tela. */}
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flex: 1,
                      fontFamily: theme.fontFamily.extraBold,
                      color: theme.colors.text
                    }}
                  >
                    {m.mercadoNome}
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.extraBold,
                      color: theme.colors.primary,
                      marginLeft: 10
                    }}
                  >
                    {formatBRL(m.mediaPorCompra)}
                  </Text>
                </View>
                {/* O selo ganha linha própria — ao lado do nome, ele competia
                    pelo mesmo espaço e sobrepunha o valor. */}
                {index === 0 && comparativoMercados.length > 1 ? (
                  <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                    <Badge label="Mais econômico" icon="pricetag-outline" />
                  </View>
                ) : null}
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.background }]}>
                  <LinearGradient
                    colors={[theme.colors.accent, theme.colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${(m.totalGasto / maxMercado) * 100}%`,
                      height: '100%',
                      borderRadius: 999
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.medium,
                    fontSize: 11,
                    color: theme.colors.textMuted
                  }}
                >
                  média/compra · {m.quantidadeCompras}{' '}
                  {m.quantidadeCompras === 1 ? 'compra' : 'compras'} · total{' '}
                  {formatBRL(m.totalGasto)}
                </Text>
              </View>
            ))
          )}

          <View style={[styles.insightBox, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="bulb-outline" size={18} color={theme.colors.accent} />
            <Text
              style={{
                flex: 1,
                fontFamily: theme.fontFamily.medium,
                fontSize: 12,
                color: theme.colors.textMuted,
                lineHeight: 17
              }}
            >
              O "valor médio por compra" ajuda a ver onde o carrinho costuma sair mais barato. Como
              os itens variam a cada visita, use como indicativo.
            </Text>
          </View>
        </Card>

        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="swap-vertical" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.type.bodyLg.fontSize,
                  color: theme.colors.text
                }}
              >
                Exportar e importar
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 11,
                  color: theme.colors.textMuted
                }}
              >
                Guarde, compartilhe ou restaure seus dados
              </Text>
            </View>
          </View>

          <View style={styles.exportRow}>
            <ExportButton
              icon="code-slash-outline"
              label="JSON"
              sub="Estruturado"
              loading={operacaoEmAndamento === 'json'}
              disabled={compras.length === 0}
              onPress={() => rodar('json', () => exportarJson(compras, catalogo))}
            />
            <ExportButton
              icon="grid-outline"
              label="CSV"
              sub="Planilhas"
              loading={operacaoEmAndamento === 'csv'}
              disabled={compras.length === 0}
              onPress={() => rodar('csv', () => exportarCsv(compras))}
            />
            <ExportButton
              icon="document-text-outline"
              label="PDF"
              sub="Relatório"
              loading={operacaoEmAndamento === 'pdf'}
              disabled={compras.length === 0}
              onPress={() => rodar('pdf', () => exportarPdf(compras))}
            />
          </View>

          {compras.length === 0 ? (
            <Text
              style={{
                fontFamily: theme.fontFamily.medium,
                fontSize: 12,
                color: theme.colors.textFaint,
                marginTop: 6
              }}
            >
              Registre ao menos uma compra para poder exportar.
            </Text>
          ) : null}

          <Pressable
            onPress={handleImportar}
            style={[
              styles.importZone,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.borderMuted }
            ]}
          >
            <View style={[styles.importIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons
                name={
                  operacaoEmAndamento === 'importar' ? 'hourglass-outline' : 'cloud-upload-outline'
                }
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={{ fontFamily: theme.fontFamily.bold, fontSize: 13, color: theme.colors.text }}
            >
              Toque para importar um backup (.json)
            </Text>
          </Pressable>
          <View style={[styles.safetyPill, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.accent} />
            <Text
              style={{
                fontFamily: theme.fontFamily.medium,
                fontSize: 11,
                color: theme.colors.textMuted,
                flex: 1
              }}
            >
              A importação adiciona os dados sem apagar compras existentes.
            </Text>
          </View>
        </Card>
      </ScrollView>

      <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
    </Screen>
  );
}

function ExportButton({
  icon,
  label,
  sub,
  onPress,
  loading,
  disabled
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.exportButton,
        {
          backgroundColor: theme.colors.background,
          opacity: disabled ? 0.4 : 1
        }
      ]}
    >
      <Ionicons
        name={loading ? 'hourglass-outline' : icon}
        size={20}
        color={theme.colors.primary}
      />
      <Text
        style={{ fontFamily: theme.fontFamily.extraBold, fontSize: 13, color: theme.colors.text }}
      >
        {label}
      </Text>
      <Text
        style={{ fontFamily: theme.fontFamily.medium, fontSize: 10, color: theme.colors.textMuted }}
      >
        {sub}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBlock: { flex: 1, gap: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartArea: { height: CHART_HEIGHT, marginTop: 8 },
  barsRow: { flexDirection: 'row', height: CHART_HEIGHT, alignItems: 'flex-end' },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  labelsRow: { flexDirection: 'row', marginTop: 6 },
  bar: { width: 18, borderRadius: 6 },
  tooltip: {
    position: 'absolute',
    top: -22,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  marketBlock: { marginBottom: 16, gap: 6 },
  marketTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  insightBox: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, marginTop: 4 },
  exportRow: { flexDirection: 'row', gap: 8 },
  exportButton: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 14 },
  importZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16
  },
  importIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  safetyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 10
  }
});
