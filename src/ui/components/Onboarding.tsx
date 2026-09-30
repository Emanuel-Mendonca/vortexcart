import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { getTheme } from '@/theme';

import { AmbientGlow } from './AmbientGlow';
import { PassoComparacao } from './onboarding/PassoComparacao';
import { PassoDados } from './onboarding/PassoDados';

/**
 * Apresentação da primeira abertura, em 3 etapas.
 *
 * Toda afirmação aqui descreve algo que o app realmente faz. O mockup de
 * referência trazia "Inteligência Preditiva", "Órbita Quântica · Previsão em
 * tempo real" e valores de economia — recursos que não existem no código.
 * Além de serem falsos, no primeiro uso o banco está vazio: não haveria
 * número real nenhum para exibir. Isso segue a mesma regra registrada no
 * CHANGELOG desde o redesign: nenhuma métrica fabricada.
 */

interface Beneficio {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  texto: string;
  cor: 'primary' | 'accent';
}

interface Passo {
  /** Selo acima do título. */
  selo: { icone: keyof typeof Ionicons.glyphMap; texto: string };
  titulo: string;
  texto: string;
  /** Ícone dentro do orbe central. */
  iconeCentral: keyof typeof Ionicons.glyphMap;
  /** Rótulo pequeno dentro do orbe. */
  rotuloCentral: string;
  /** Etiquetas flutuantes ao redor do orbe. */
  badges: readonly [Beneficio, Beneficio];
  beneficios: readonly [Beneficio, Beneficio];
}

const PASSOS: readonly Passo[] = [
  {
    selo: { icone: 'phone-portrait-outline', texto: 'Tudo no seu aparelho' },
    titulo: 'Boas-vindas ao Vortex Cart',
    texto:
      'Registre o que você compra no mercado e descubra onde seu dinheiro rende mais, mês a mês.',
    iconeCentral: 'cart',
    rotuloCentral: 'Suas compras',
    badges: [
      {
        icone: 'qr-code-outline',
        titulo: 'Leitura por QR Code',
        texto: 'Direto do cupom fiscal',
        cor: 'accent'
      },
      {
        icone: 'storefront-outline',
        titulo: 'Comparação real',
        texto: 'Entre os seus mercados',
        cor: 'primary'
      }
    ],
    beneficios: [
      {
        icone: 'qr-code-outline',
        titulo: 'Leitor de cupom MG',
        texto: 'Leia o QR Code da nota e os itens entram sozinhos na compra.',
        cor: 'primary'
      },
      {
        icone: 'stats-chart-outline',
        titulo: 'Comparação de mercados',
        texto: 'Veja em qual supermercado o seu carrinho sai mais em conta.',
        cor: 'accent'
      }
    ]
  },
  {
    selo: { icone: 'options-outline', texto: 'Comparação de mercados' },
    titulo: 'Descubra onde seu dinheiro rende mais',
    texto:
      'O Resumo compara os mercados onde você comprou pelo valor médio por compra, e o catálogo guarda o preço médio de cada item do seu histórico.',
    iconeCentral: 'add-circle',
    rotuloCentral: 'Nova compra',
    badges: [
      {
        icone: 'search-outline',
        titulo: 'Sugestão automática',
        texto: 'A partir do catálogo',
        cor: 'primary'
      },
      {
        icone: 'card-outline',
        titulo: 'Forma de pagamento',
        texto: 'Débito, crédito ou vale',
        cor: 'accent'
      }
    ],
    beneficios: [
      {
        icone: 'pricetags-outline',
        titulo: 'Catálogo por departamento',
        texto: 'Padaria, Hortifruti, Limpeza e mais 12 seções.',
        cor: 'primary'
      },
      {
        icone: 'trending-up-outline',
        titulo: 'Preço médio por item',
        texto: 'Calculado do seu próprio histórico de compras.',
        cor: 'accent'
      }
    ]
  },
  {
    selo: { icone: 'shield-checkmark-outline', texto: 'Privacidade por padrão' },
    titulo: 'Seus dados ficam com você',
    texto:
      'Tudo é gravado num banco local no próprio aparelho — sem conta, sem servidor, sem rastreador. Quando quiser, exporte um backup em JSON, CSV ou PDF.',
    iconeCentral: 'analytics',
    rotuloCentral: 'Resumo',
    badges: [
      {
        icone: 'calendar-outline',
        titulo: 'Gasto por mês',
        texto: 'Com o total do período',
        cor: 'primary'
      },
      {
        icone: 'cloud-download-outline',
        titulo: 'Backup seu',
        texto: 'JSON, CSV ou PDF',
        cor: 'accent'
      }
    ],
    beneficios: [
      {
        icone: 'ribbon-outline',
        titulo: 'Selo de mais econômico',
        texto: 'Pelo valor médio por compra em cada mercado.',
        cor: 'accent'
      },
      {
        icone: 'lock-closed-outline',
        titulo: 'Nada sai do aparelho',
        texto: 'Seus dados ficam no celular. Exportar é escolha sua.',
        cor: 'primary'
      }
    ]
  }
];

interface OnboardingProps {
  visible: boolean;
  onConcluir: () => void;
}

export function Onboarding({ visible, onConcluir }: OnboardingProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const [indice, setIndice] = useState(0);

  const giro = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anel = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    const brilho = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    anel.start();
    brilho.start();
    return () => {
      anel.stop();
      brilho.stop();
    };
  }, [giro, pulso]);

  const passo = PASSOS[indice];
  if (!passo) return null;
  const ultimo = indice === PASSOS.length - 1;
  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const corDe = (c: Beneficio['cor']) =>
    c === 'accent' ? theme.colors.accent : theme.colors.primary;

  function renderBadge(b: Beneficio, posicao: object) {
    return (
      <View
        style={[
          styles.badge,
          posicao,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
        ]}
      >
        <View style={[styles.badgeIcone, { backgroundColor: theme.colors.background }]}>
          <Ionicons name={b.icone} size={13} color={corDe(b.cor)} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text
            style={{ fontFamily: theme.fontFamily.bold, fontSize: 10.5, color: corDe(b.cor) }}
            numberOfLines={1}
          >
            {b.titulo}
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: 9,
              color: theme.colors.textMuted
            }}
            numberOfLines={1}
          >
            {b.texto}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onConcluir}>
      <View style={[styles.fundo, { backgroundColor: theme.colors.background }]}>
        <AmbientGlow color={theme.colors.primary} size={300} top={-90} left={-80} opacity={0.22} />
        <AmbientGlow color={theme.colors.accent} size={280} top={260} right={-100} opacity={0.14} />
        <AmbientGlow color={theme.colors.primary} size={240} bottom={-40} left={40} opacity={0.1} />

        {/* Cabeçalho: voltar (a partir da 2ª), barras de etapa e pular */}
        <View style={styles.cabecalho}>
          {indice === 0 ? (
            <View
              style={[
                styles.pilulaMarca,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
              ]}
            >
              <Animated.View
                style={[
                  styles.pontoVivo,
                  {
                    backgroundColor: theme.colors.accent,
                    opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] })
                  }
                ]}
              />
              <Text style={[styles.textoMarca, { color: theme.colors.primary }]}>VORTEX</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => setIndice((i) => Math.max(0, i - 1))}
              hitSlop={8}
              style={[
                styles.botaoRedondo,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
              ]}
            >
              <Ionicons name="chevron-back" size={17} color={theme.colors.textMuted} />
            </Pressable>
          )}

          {/* Barras de progresso: mais legíveis que os pontos sozinhos */}
          <View style={styles.barras}>
            {PASSOS.map((p, i) => (
              <View
                key={p.titulo}
                style={[
                  styles.barra,
                  {
                    backgroundColor: i <= indice ? theme.colors.primary : theme.colors.surfaceAlt
                  }
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={onConcluir}
            hitSlop={8}
            style={[
              styles.botaoPular,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.semiBold,
                fontSize: 12,
                color: theme.colors.textMuted
              }}
            >
              Pular
            </Text>
          </Pressable>
        </View>

        {/* Corpo da etapa: cada uma tem a sua própria ilustração */}
        {indice === 1 ? (
          <PassoComparacao />
        ) : indice === 2 ? (
          <PassoDados />
        ) : (
          <View style={styles.nucleo}>
            <Animated.View style={[styles.aneis, { transform: [{ rotate: rotacao }] }]}>
              <Svg height={230} width={230} viewBox="0 0 340 340">
                <Circle
                  cx="170"
                  cy="170"
                  r="150"
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeOpacity={0.35}
                  strokeDasharray="6 8"
                  strokeWidth={1.5}
                />
                <Circle
                  cx="170"
                  cy="170"
                  r="115"
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeOpacity={0.55}
                  strokeDasharray="4 6"
                  strokeWidth={1.5}
                />
                <Circle
                  cx="170"
                  cy="170"
                  r="80"
                  fill="none"
                  stroke={theme.colors.border}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                />
                {/* A espiral que atravessa o centro é o "vórtice" do símbolo */}
                <Path
                  d="M170 20 C 220 75, 245 125, 170 170 C 95 215, 120 280, 170 320"
                  fill="none"
                  stroke={theme.colors.accent}
                  strokeOpacity={0.35}
                  strokeLinecap="round"
                  strokeWidth={1.5}
                />
              </Svg>
            </Animated.View>

            <View
              style={[
                styles.orbe,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
              ]}
            >
              <View style={[styles.orbeIcone, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Ionicons name={passo.iconeCentral} size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.orbeRotulo, { color: theme.colors.textMuted }]}>
                {passo.rotuloCentral.toUpperCase()}
              </Text>
            </View>

            {renderBadge(passo.badges[0], styles.badgeTopo)}
            {renderBadge(passo.badges[1], styles.badgeBase)}
          </View>
        )}

        {/* Narrativa */}
        <View style={styles.narrativa}>
          <View
            style={[
              styles.seloTopo,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
            ]}
          >
            <Ionicons name={passo.selo.icone} size={12} color={theme.colors.primary} />
            <Text
              style={{
                fontFamily: theme.fontFamily.semiBold,
                fontSize: 11,
                color: theme.colors.primary
              }}
            >
              {passo.selo.texto}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: theme.fontFamily.extraBold,
              fontSize: 23,
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: 6
            }}
          >
            {passo.titulo}
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: 13,
              lineHeight: 19,
              color: theme.colors.textMuted,
              textAlign: 'center'
            }}
          >
            {passo.texto}
          </Text>
        </View>

        {/* Dois cards de benefício */}
        <View style={styles.cards}>
          {passo.beneficios.map((b) => (
            <View
              key={b.titulo}
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
              ]}
            >
              <View style={[styles.cardIcone, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Ionicons name={b.icone} size={16} color={corDe(b.cor)} />
              </View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 12,
                  color: theme.colors.text,
                  marginBottom: 2
                }}
              >
                {b.titulo}
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 11,
                  lineHeight: 15,
                  color: theme.colors.textMuted
                }}
              >
                {b.texto}
              </Text>
            </View>
          ))}
        </View>

        {/* Rodapé: indicador e ação */}
        <View style={styles.rodape}>
          <Pressable
            onPress={() => (ultimo ? onConcluir() : setIndice((i) => i + 1))}
            style={({ pressed }) => [
              styles.botaoPrincipal,
              {
                backgroundColor: theme.colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }]
              }
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: 14,
                color: theme.colors.onPrimary
              }}
            >
              {ultimo ? 'Começar a usar o Vortex Cart' : 'Continuar'}
            </Text>
            <Ionicons name="arrow-forward" size={17} color={theme.colors.onPrimary} />
          </Pressable>

          {indice > 0 ? (
            <Pressable
              onPress={() => setIndice((i) => Math.max(0, i - 1))}
              hitSlop={8}
              style={styles.botaoVoltar}
            >
              <Ionicons name="arrow-back" size={14} color={theme.colors.textMuted} />
              <Text
                style={{
                  fontFamily: theme.fontFamily.semiBold,
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                Voltar
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.etapaTexto, { color: theme.colors.textFaint }]}>
              ETAPA {indice + 1} DE {PASSOS.length}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'space-between' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pilulaMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  pontoVivo: { width: 8, height: 8, borderRadius: 999 },
  textoMarca: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  botaoPular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  nucleo: {
    width: 230,
    height: 230,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aneis: { position: 'absolute', width: 230, height: 230 },
  orbe: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  orbeIcone: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  orbeRotulo: { fontSize: 8.5, letterSpacing: 1, fontWeight: '600' },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 13,
    borderWidth: 1,
    maxWidth: 168
  },
  badgeTopo: { top: 2, left: -12 },
  badgeBase: { bottom: 2, right: -12 },
  badgeIcone: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  narrativa: { alignItems: 'center', paddingHorizontal: 4 },
  seloTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12
  },
  cards: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 13 },
  cardIcone: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9
  },
  rodape: { alignItems: 'center', gap: 12 },
  barras: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10 },
  barra: { flex: 1, height: 5, borderRadius: 999 },
  botaoRedondo: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  pontos: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { height: 6, borderRadius: 999 },
  botaoPrincipal: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 18
  },
  etapaTexto: { fontSize: 10, letterSpacing: 2, fontWeight: '600' }
});
