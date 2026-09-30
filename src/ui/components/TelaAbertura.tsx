import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { getTheme } from '@/theme';

import { AmbientGlow } from './AmbientGlow';

/**
 * Etapas reais da inicialização do app. Cada uma corresponde a algo que de
 * fato acontece em `app/_layout.tsx` — não são mensagens decorativas.
 */
export type EtapaAbertura = 'fontes' | 'banco' | 'dados' | 'pronto';

const ROTULOS: Record<EtapaAbertura, { texto: string; progresso: number }> = {
  fontes: { texto: 'Preparando a interface', progresso: 25 },
  banco: { texto: 'Abrindo seu banco local', progresso: 55 },
  dados: { texto: 'Carregando suas compras', progresso: 85 },
  pronto: { texto: 'Tudo pronto', progresso: 100 }
};

interface TelaAberturaProps {
  etapa: EtapaAbertura;
  /** Versão do app, exibida no rodapé. */
  versao: string;
}

/**
 * Tela de abertura animada, exibida enquanto fontes e banco carregam.
 *
 * O anel orbital girando é o próprio símbolo da marca (ver BRANDING.md) — a
 * animação existe para reforçar a identidade, não como enfeite solto.
 *
 * O rodapé mostra **estado real de carregamento** e a versão vinda do
 * `app.config.ts`. A referência de design trazia um console fictício
 * ("QUANTUM CORE", "verificando chaves de cofre quântico", "atualizando
 * taxas de câmbio") — o app não faz nada disso, e exibir número inventado
 * contraria a regra que o projeto segue desde o redesign: toda métrica
 * mostrada vem de dado real.
 */
export function TelaAbertura({ etapa, versao }: TelaAberturaProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const giro = useRef(new Animated.Value(0)).current;
  const giroInverso = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (valor: Animated.Value, duracao: number) =>
      Animated.loop(
        Animated.timing(valor, {
          toValue: 1,
          duration: duracao,
          easing: Easing.linear,
          useNativeDriver: true
        })
      );

    const anelExterno = loop(giro, 40000);
    const anelInterno = loop(giroInverso, 25000);
    const brilho = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    anelExterno.start();
    anelInterno.start();
    brilho.start();
    return () => {
      anelExterno.stop();
      anelInterno.stop();
      brilho.stop();
    };
  }, [giro, giroInverso, pulso]);

  const { texto, progresso: alvo } = ROTULOS[etapa];

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: alvo,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      // Largura não é animável pelo driver nativo.
      useNativeDriver: false
    }).start();
  }, [alvo, progresso]);

  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotacaoInversa = giroInverso.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg']
  });

  return (
    <View style={[styles.fundo, { backgroundColor: theme.colors.background }]}>
      <AmbientGlow color={theme.colors.primary} size={340} top={-90} left={-70} opacity={0.22} />
      <AmbientGlow color={theme.colors.accent} size={280} bottom={40} right={-90} opacity={0.12} />

      <View style={styles.centro}>
        <View style={styles.orbita}>
          {/* Halo suave atrás do emblema */}
          <Animated.View
            style={[
              styles.halo,
              {
                backgroundColor: theme.colors.primary,
                opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.26] }),
                transform: [
                  { scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }
                ]
              }
            ]}
          />

          {/* Anel externo, no sentido horário */}
          <Animated.View style={[styles.anel, { transform: [{ rotate: rotacao }] }]}>
            <Svg height={230} width={230} viewBox="0 0 260 260">
              <Defs>
                <RadialGradient cx="50%" cy="50%" id="vortice" r="60%">
                  <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.28" />
                  <Stop offset="100%" stopColor={theme.colors.background} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="130" cy="130" fill="url(#vortice)" r="120" />
              <Circle
                cx="130"
                cy="130"
                fill="none"
                r="118"
                stroke={theme.colors.primary}
                strokeDasharray="6 9"
                strokeOpacity={0.55}
                strokeWidth={1.2}
              />
            </Svg>
          </Animated.View>

          {/* Anel interno, em sentido contrário — reforça a ideia de vórtice */}
          <Animated.View style={[styles.anel, { transform: [{ rotate: rotacaoInversa }] }]}>
            <Svg height={230} width={230} viewBox="0 0 260 260">
              <Circle
                cx="130"
                cy="130"
                fill="none"
                r="96"
                stroke={theme.colors.accent}
                strokeDasharray="2 13"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            </Svg>
          </Animated.View>

          {/* Emblema da marca */}
          <View
            style={[
              styles.moldura,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
            ]}
          >
            <Image
              source={require('../assets/adaptive-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.wordmark,
            { fontFamily: theme.fontFamily.extraBold, color: theme.colors.text }
          ]}
        >
          VORTEX CART
        </Text>

        <LinearGradient
          colors={['transparent', theme.colors.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divisor}
        />

        <Text
          numberOfLines={2}
          style={{
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.textMuted,
            textAlign: 'center',
            paddingHorizontal: 16,
            lineHeight: 21
          }}
        >
          Suas compras de mercado, organizadas
        </Text>
      </View>

      <View style={styles.rodape}>
        <View
          style={[
            styles.console,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
          ]}
        >
          <View style={styles.consoleTopo}>
            <View style={styles.statusEsquerda}>
              <Animated.View
                style={[
                  styles.pontoStatus,
                  {
                    backgroundColor:
                      etapa === 'pronto' ? theme.colors.accent : theme.colors.primary,
                    opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] })
                  }
                ]}
              />
              <Text
                style={{
                  fontFamily: theme.fontFamily.semiBold,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.text
                }}
              >
                {texto}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.caption.fontSize,
                color: theme.colors.primary
              }}
            >
              {alvo}%
            </Text>
          </View>

          <View style={[styles.trilho, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 999,
                width: progresso.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })
              }}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.preenchimento}
              />
            </Animated.View>
          </View>
        </View>

        <View style={[styles.selo, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={{
              fontFamily: theme.fontFamily.semiBold,
              fontSize: 11,
              letterSpacing: 1.5,
              color: theme.colors.textFaint
            }}
          >
            v{versao}
          </Text>
          <View style={[styles.separador, { backgroundColor: theme.colors.borderMuted }]} />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: theme.fontFamily.semiBold,
              fontSize: 11,
              letterSpacing: 1.2,
              color: theme.colors.accent
            }}
          >
            100% OFFLINE
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 48 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbita: { width: 230, height: 230, alignItems: 'center', justifyContent: 'center' },
  anel: { position: 'absolute', width: 230, height: 230 },
  halo: { position: 'absolute', width: 168, height: 168, borderRadius: 84 },
  moldura: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  logo: { width: 92, height: 92 },
  wordmark: { fontSize: 22, letterSpacing: 4, marginTop: 30, paddingHorizontal: 8 },
  divisor: { height: 2, width: 64, borderRadius: 999, marginVertical: 12 },
  rodape: { alignItems: 'center' },
  console: { width: '100%', borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  consoleTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pontoStatus: { width: 9, height: 9, borderRadius: 999 },
  trilho: { width: '100%', height: 6, borderRadius: 999, overflow: 'hidden' },
  preenchimento: { flex: 1, borderRadius: 999 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999
  },
  separador: { width: 3, height: 3, borderRadius: 999 }
});
