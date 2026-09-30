import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getTheme } from '@/theme';
import { formatBRL } from '@/utils/currency';

/**
 * Ilustração da tela de Resumo, usada no onboarding.
 *
 * Os números são um **exemplo** e estão marcados como tal: na primeira
 * abertura o banco está vazio, então não há dado real a exibir. O que a
 * ilustração mostra — média por compra e selo de mais econômico — é
 * exatamente o que o app calcula de verdade (`getComparativoMercados`).
 *
 * O mockup de referência trazia "economia de ~18.4%", "-24%" por produto,
 * distância em km e "monitorando 14 redes da sua região". Nada disso existe:
 * o app não tem geolocalização, não consulta outras redes e não compara
 * preço entre mercados item a item. Prometer isso na abertura criaria uma
 * expectativa que a primeira tela já frustraria.
 */

interface MercadoExemplo {
  nome: string;
  mediaPorCompra: number;
  compras: number;
  totalGasto: number;
}

const VENCEDOR: MercadoExemplo = {
  nome: 'Atacadão Vortex',
  mediaPorCompra: 169.22,
  compras: 6,
  totalGasto: 1015.32
};

const COMPARADO: MercadoExemplo = {
  nome: 'Hipermercado Silva',
  mediaPorCompra: 271.87,
  compras: 4,
  totalGasto: 1087.48
};

/** Preço médio por item, calculado do histórico — o que o catálogo exibe. */
const ITENS_EXEMPLO = [
  { nome: 'Café', preco: 18.9 },
  { nome: 'Arroz', preco: 27.9 },
  { nome: 'Sabão', preco: 17.9 }
];

export function PassoComparacao() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <View style={styles.area}>
      <View
        style={[
          styles.haloIcone,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.primary }
        ]}
      >
        <Ionicons name="stats-chart" size={22} color={theme.colors.primary} />
        <View
          style={[
            styles.marcador,
            { backgroundColor: theme.colors.accent, borderColor: theme.colors.background }
          ]}
        />
      </View>

      {/* Mercado mais econômico */}
      <View
        style={[
          styles.cardVencedor,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }
        ]}
      >
        <View style={styles.linhaTopo}>
          <View style={styles.identidade}>
            <View style={[styles.iconeLoja, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="storefront" size={17} color={theme.colors.primary} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <View style={styles.nomeLinha}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: 13.5,
                    color: theme.colors.text,
                    flexShrink: 1
                  }}
                >
                  {VENCEDOR.nome}
                </Text>
                <Ionicons name="checkmark-circle" size={13} color={theme.colors.accent} />
              </View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 11,
                  color: theme.colors.textMuted
                }}
              >
                {VENCEDOR.compras} compras · total {formatBRL(VENCEDOR.totalGasto)}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontFamily: theme.fontFamily.extraBold,
                fontSize: 15,
                color: theme.colors.primary
              }}
            >
              {formatBRL(VENCEDOR.mediaPorCompra)}
            </Text>
            <View style={[styles.selo, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 9,
                  color: theme.colors.accent
                }}
              >
                MAIS ECONÔMICO
              </Text>
            </View>
          </View>
        </View>

        {/* Preço médio por item, vindo do próprio histórico */}
        <View style={[styles.chips, { borderTopColor: theme.colors.borderMuted }]}>
          {ITENS_EXEMPLO.map((item) => (
            <View
              key={item.nome}
              style={[styles.chip, { backgroundColor: theme.colors.background }]}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 9.5,
                  color: theme.colors.textMuted
                }}
              >
                {item.nome}
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 10.5,
                  color: theme.colors.primary
                }}
              >
                {formatBRL(item.preco)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Mercado comparado */}
      <View
        style={[
          styles.cardComparado,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
        ]}
      >
        <View style={styles.identidade}>
          <View style={[styles.iconeLoja, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="storefront-outline" size={17} color={theme.colors.textMuted} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: 13.5,
                color: theme.colors.text
              }}
            >
              {COMPARADO.nome}
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.medium,
                fontSize: 11,
                color: theme.colors.textMuted
              }}
            >
              {COMPARADO.compras} compras · total {formatBRL(COMPARADO.totalGasto)}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: 13.5,
            color: theme.colors.text
          }}
        >
          {formatBRL(COMPARADO.mediaPorCompra)}
        </Text>
      </View>

      {/* Ilustração: os valores são de mostruário, e a legenda diz de quem
          serão os dados de verdade assim que houver compras registradas. */}
      <View
        style={[
          styles.avisoExemplo,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
        ]}
      >
        <View style={[styles.pontinho, { backgroundColor: theme.colors.accent }]} />
        <Text
          style={{
            fontFamily: theme.fontFamily.semiBold,
            fontSize: 10.5,
            color: theme.colors.textMuted
          }}
        >
          Aqui aparecem os seus mercados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { width: '100%', alignItems: 'center', gap: 8 },
  haloIcone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  marcador: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2
  },
  cardVencedor: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 12, gap: 9 },
  cardComparado: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  identidade: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  iconeLoja: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selo: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginTop: 3 },
  chips: { flexDirection: 'row', gap: 6, paddingTop: 8, borderTopWidth: 1 },
  chip: { flex: 1, alignItems: 'center', gap: 1, paddingVertical: 5, borderRadius: 9 },
  avisoExemplo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 2
  },
  pontinho: { width: 5, height: 5, borderRadius: 999 }
});
