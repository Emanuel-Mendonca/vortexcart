import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Badge, Button, Card, ConfirmModal, EmptyState } from '@/components';
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

export function ResumoScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const gastoPorMes = useComprasStore((s) => s.gastoPorMes);
  const comparativoMercados = useComprasStore((s) => s.comparativoMercados);
  const compras = useComprasStore((s) => s.compras);
  const catalogo = useComprasStore((s) => s.catalogo);
  const refreshTudo = useComprasStore((s) => s.refreshTudo);

  const [operacaoEmAndamento, setOperacaoEmAndamento] = useState<Operacao>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const maxMes = Math.max(1, ...gastoPorMes.map((g) => g.total));

  async function rodar(operacao: Operacao, acao: () => Promise<void>, sucesso?: string) {
    setOperacaoEmAndamento(operacao);
    try {
      await acao();
      if (sucesso) setMensagem(sucesso);
    } catch (erro) {
      if (erro instanceof ImportCanceladoError) {
        // usuário cancelou o seletor de arquivo — não é um erro a mostrar
        return;
      }
      if (erro instanceof ExportIndisponivelError || erro instanceof ImportInvalidoError) {
        setMensagem(erro.message);
        return;
      }
      console.error(erro);
      setMensagem('Algo deu errado. Tente novamente.');
    } finally {
      setOperacaoEmAndamento(null);
    }
  }

  async function handleImportar() {
    await rodar('importar', async () => {
      const resultado = await selecionarEImportarBackup();
      await refreshTudo();
      setMensagem(`Importação concluída: ${resultado.comprasImportadas} compra(s) adicionada(s).`);
    });
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
    >
      <Card>
        <Text
          style={{
            fontFamily: theme.fontFamily.extraBold,
            fontSize: theme.type.title.fontSize,
            color: theme.colors.text,
            marginBottom: 16
          }}
        >
          Gasto por mês
        </Text>

        {gastoPorMes.length === 0 ? (
          <EmptyState icon="bar-chart-outline" message="Ainda sem dados suficientes." />
        ) : (
          gastoPorMes.map((g) => (
            <View key={g.mes} style={{ marginBottom: 14 }}>
              <View style={styles.barLabelRow}>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.semiBold,
                    fontSize: theme.type.body.fontSize,
                    color: theme.colors.text,
                    textTransform: 'capitalize'
                  }}
                >
                  {monthLabel(g.mes)}
                </Text>
                <Text style={{ fontFamily: theme.fontFamily.extraBold, color: theme.colors.text }}>
                  {formatBRL(g.total)}
                </Text>
              </View>
              <View
                style={[
                  styles.barTrack,
                  {
                    borderColor: theme.colors.border,
                    borderWidth: theme.borderWidth.bold,
                    backgroundColor: theme.colors.borderMuted
                  }
                ]}
              >
                <View
                  style={{
                    width: `${(g.total / maxMes) * 100}%`,
                    backgroundColor: theme.colors.primary,
                    height: '100%'
                  }}
                />
              </View>
            </View>
          ))
        )}
      </Card>

      <Card>
        <Text
          style={{
            fontFamily: theme.fontFamily.extraBold,
            fontSize: theme.type.title.fontSize,
            color: theme.colors.text,
            marginBottom: 16
          }}
        >
          Comparação de supermercados
        </Text>

        {comparativoMercados.length === 0 ? (
          <EmptyState icon="storefront-outline" message="Ainda sem dados suficientes." />
        ) : (
          comparativoMercados.map((m, index) => (
            <View
              key={m.mercadoId}
              style={[
                styles.marketRow,
                index < comparativoMercados.length - 1
                  ? {
                      borderBottomColor: theme.colors.borderMuted,
                      borderBottomWidth: theme.borderWidth.hairline
                    }
                  : null
              ]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                >
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.extraBold,
                      fontSize: theme.type.body.fontSize,
                      color: theme.colors.text
                    }}
                  >
                    {m.mercadoNome}
                  </Text>
                  {index === 0 && comparativoMercados.length > 1 ? (
                    <Badge label="Mais econômico" icon="pricetag-outline" />
                  ) : null}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: theme.fontFamily.extraBold, color: theme.colors.text }}>
                  {formatBRL(m.mediaPorCompra)}
                </Text>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.medium,
                    fontSize: theme.type.caption.fontSize,
                    color: theme.colors.textMuted
                  }}
                >
                  média/compra · {m.quantidadeCompras}{' '}
                  {m.quantidadeCompras === 1 ? 'compra' : 'compras'}
                </Text>
              </View>
            </View>
          ))
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
          O "valor médio por compra" ajuda a ver onde o carrinho costuma sair mais barato. Como os
          itens variam a cada visita, use como indicativo, não comparação exata de preço por
          produto.
        </Text>
      </Card>

      <Card>
        <Text
          style={{
            fontFamily: theme.fontFamily.extraBold,
            fontSize: theme.type.title.fontSize,
            color: theme.colors.text,
            marginBottom: 6
          }}
        >
          Exportar e importar dados
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.caption.fontSize,
            color: theme.colors.textMuted,
            marginBottom: 16,
            lineHeight: 18
          }}
        >
          Gere um arquivo com todo o histórico de compras para guardar, compartilhar ou abrir em
          outro dispositivo.
        </Text>

        <View style={styles.exportRow}>
          <View style={styles.exportButton}>
            <Button
              label="JSON"
              variant="secondary"
              loading={operacaoEmAndamento === 'json'}
              disabled={compras.length === 0}
              onPress={() => rodar('json', () => exportarJson(compras, catalogo))}
            />
          </View>
          <View style={styles.exportButton}>
            <Button
              label="CSV"
              variant="secondary"
              loading={operacaoEmAndamento === 'csv'}
              disabled={compras.length === 0}
              onPress={() => rodar('csv', () => exportarCsv(compras))}
            />
          </View>
          <View style={styles.exportButton}>
            <Button
              label="PDF"
              variant="secondary"
              loading={operacaoEmAndamento === 'pdf'}
              disabled={compras.length === 0}
              onPress={() => rodar('pdf', () => exportarPdf(compras))}
            />
          </View>
        </View>

        {compras.length === 0 ? (
          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: theme.type.caption.fontSize,
              color: theme.colors.textFaint,
              marginTop: 6
            }}
          >
            Registre ao menos uma compra para poder exportar.
          </Text>
        ) : null}

        <View style={{ marginTop: 14 }}>
          <Button
            label="Importar backup (JSON)"
            variant="ghost"
            loading={operacaoEmAndamento === 'importar'}
            onPress={handleImportar}
          />
        </View>
        <Text
          style={{
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.caption.fontSize,
            color: theme.colors.textFaint,
            marginTop: 4,
            lineHeight: 16
          }}
        >
          A importação adiciona os dados do arquivo aos que já existem — não substitui nem apaga
          nada.
        </Text>
      </Card>

      <ConfirmModal
        visible={mensagem != null}
        message={mensagem ?? ''}
        onDismiss={() => setMensagem(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barTrack: { height: 14, borderRadius: 6, overflow: 'hidden' },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  exportRow: { flexDirection: 'row', gap: 8 },
  exportButton: { flex: 1 }
});
