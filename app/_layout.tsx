import {
  useFonts,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold
} from '@expo-google-fonts/raleway';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Onboarding, TelaAbertura } from '@/components';
import type { EtapaAbertura } from '@/components';
import { CHAVE_ONBOARDING, gravarPreferencia, lerPreferencia } from '@/storage';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop: ok se já estiver escondida */
});

/**
 * Tempo mínimo da tela de abertura. Sem isso ela apareceria por poucos
 * quadros num aparelho rápido, o banco abre em milissegundos, e o efeito
 * seria só um flash desagradável. É a única espera artificial do app.
 */
const TEMPO_MINIMO_ABERTURA_MS = 1400;

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const theme = getTheme(systemScheme === 'dark' ? 'dark' : 'light');
  const initStore = useComprasStore((s) => s.init);

  const [fontsLoaded, fontError] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Raleway_800ExtraBold
  });

  const [dbPronto, setDbPronto] = useState(false);
  // `null` enquanto ainda não sabemos, evita o onboarding piscar na tela
  // de quem já passou por ele.
  const [mostrarOnboarding, setMostrarOnboarding] = useState<boolean | null>(null);
  const [dbErro, setDbErro] = useState<string | null>(null);
  const [tempoMinimoCumprido, setTempoMinimoCumprido] = useState(false);

  // O relógio começa quando a splash nativa sai de cena, contar a partir da
  // montagem fazia a tela animada aparecer só no último instante, já em
  // "Tudo pronto", sem nunca mostrar as etapas intermediárias.
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    const timer = setTimeout(() => setTempoMinimoCumprido(true), TEMPO_MINIMO_ABERTURA_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    initStore()
      .then(async () => {
        setDbPronto(true);
        const visto = await lerPreferencia(CHAVE_ONBOARDING).catch(() => null);
        setMostrarOnboarding(visto !== '1');
      })
      .catch((err: unknown) => {
        console.error('Falha ao inicializar o banco de dados', err);
        setDbErro('Não foi possível abrir o banco de dados local.');
        // Sem isto o app ficaria preso na tela de abertura quando o banco
        // falha; é melhor entrar vazio do que não entrar.
        setMostrarOnboarding(false);
      });
  }, [initStore]);

  const fontesOk = fontsLoaded || fontError;
  const dadosOk = dbPronto || dbErro != null;
  const pronto = fontesOk && dadosOk && mostrarOnboarding !== null && tempoMinimoCumprido;

  /** Etapa mostrada na tela de abertura, reflete o que está acontecendo. */
  const etapa: EtapaAbertura = !fontesOk
    ? 'fontes'
    : !dadosOk
      ? 'banco'
      : mostrarOnboarding === null
        ? 'dados'
        : 'pronto';

  async function concluirOnboarding() {
    setMostrarOnboarding(false);
    // Falha ao gravar só faz a apresentação reaparecer depois, não vale
    // travar a entrada no app por causa disso.
    await gravarPreferencia(CHAVE_ONBOARDING, '1').catch(() => undefined);
  }

  useEffect(() => {
    // A splash nativa some assim que a tela animada pode assumir, para não
    // haver dois "carregando" empilhados.
    if (fontesOk) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontesOk]);

  if (!pronto) {
    return (
      <SafeAreaProvider>
        <TelaAbertura etapa={etapa} versao={Constants.expoConfig?.version ?? '0.1.0'} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Onboarding visible={mostrarOnboarding === true} onConcluir={concluirOnboarding} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontFamily: theme.fontFamily.bold },
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
