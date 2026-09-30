import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { getTheme } from '@/theme';

/**
 * Etapa final: onde os dados ficam e como sair com eles.
 *
 * O mockup de referência anunciava sincronização em nuvem, múltiplos
 * aparelhos, tempo real e criptografia AES-256 ponta a ponta. Nada disso
 * existe, e "sincronização em nuvem própria" está em *Won't have* no
 * BACKLOG.md, por contrariar a proposta local-first do projeto.
 *
 * Curiosamente os próprios comentários daquele HTML diziam "Tag Topo: 100%
 * Offline" e "Tag Base: Zero rastreadores": a intenção original era esta, e
 * é também o diferencial real do app. A barra de exportação (JSON/CSV/PDF)
 * veio do mockup sem alteração, porque essa parte o app faz de verdade.
 */
export function PassoDados() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const giro = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anel = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    const brilho = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: 1300,
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

  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.area}>
      <View style={styles.orbe}>
        {/* Anel com os quatro satélites, girando */}
        <Animated.View style={[styles.anel, { transform: [{ rotate: rotacao }] }]}>
          <Svg height={148} width={148} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={theme.colors.primary}
              strokeOpacity={0.3}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Circle cx="50" cy="8" r="2.5" fill={theme.colors.primary} />
            <Circle cx="92" cy="50" r="2.5" fill={theme.colors.accent} />
            <Circle cx="50" cy="92" r="2.5" fill={theme.colors.primary} />
            <Circle cx="8" cy="50" r="2.5" fill={theme.colors.accent} />
          </Svg>
        </Animated.View>

        {/* Núcleo: o aparelho guardando os dados */}
        <View
          style={[
            styles.nucleo,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.primary }
          ]}
        >
          <Ionicons name="phone-portrait" size={30} color={theme.colors.primary} />
          <View
            style={[
              styles.cadeado,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.accent }
            ]}
          >
            <Ionicons name="lock-closed" size={10} color={theme.colors.accent} />
          </View>
        </View>

        {/* Etiqueta superior */}
        <View
          style={[
            styles.tagTopo,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
          ]}
        >
          <Animated.View
            style={[
              styles.pontinho,
              {
                backgroundColor: theme.colors.accent,
                opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] })
              }
            ]}
          />
          <Text style={[styles.tagTexto, { color: theme.colors.accent }]}>100% OFFLINE</Text>
        </View>

        {/* Etiqueta inferior */}
        <View
          style={[
            styles.tagBase,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
          ]}
        >
          <Ionicons name="eye-off-outline" size={11} color={theme.colors.textMuted} />
          <Text style={[styles.tagTexto, { color: theme.colors.textMuted }]}>
            Zero rastreadores
          </Text>
        </View>
      </View>

      {/* Selo do armazenamento */}
      <View
        style={[
          styles.selo,
          { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
        ]}
      >
        <Ionicons name="server-outline" size={13} color={theme.colors.primary} />
        <Text
          style={{
            fontFamily: theme.fontFamily.semiBold,
            fontSize: 11,
            color: theme.colors.text
          }}
        >
          Banco de dados local, no seu aparelho
        </Text>
      </View>

      {/* Barra de exportação, os três formatos existem de verdade */}
      <View
        style={[
          styles.barraExport,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
        ]}
      >
        <View style={styles.exportEsquerda}>
          <Ionicons name="download-outline" size={14} color={theme.colors.primary} />
          <Text
            style={{
              fontFamily: theme.fontFamily.semiBold,
              fontSize: 10.5,
              letterSpacing: 0.8,
              color: theme.colors.textMuted
            }}
          >
            EXPORTAÇÃO LIVRE:
          </Text>
        </View>
        <View style={styles.formatos}>
          {['JSON', 'CSV', 'PDF'].map((formato) => (
            <View
              key={formato}
              style={[
                styles.formato,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
              ]}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 9.5,
                  color: theme.colors.text
                }}
              >
                {formato}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { width: '100%', alignItems: 'center', gap: 12 },
  orbe: { width: 148, height: 148, alignItems: 'center', justifyContent: 'center' },
  anel: { position: 'absolute', width: 148, height: 148 },
  nucleo: {
    width: 74,
    height: 74,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cadeado: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagTopo: {
    position: 'absolute',
    top: -6,
    right: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1
  },
  tagBase: {
    position: 'absolute',
    bottom: -6,
    left: -18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1
  },
  tagTexto: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6 },
  pontinho: { width: 6, height: 6, borderRadius: 999 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  barraExport: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1,
    gap: 8
  },
  exportEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  formatos: { flexDirection: 'row', gap: 5 },
  formato: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, borderWidth: 1 }
});
