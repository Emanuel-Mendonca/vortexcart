import {
  useFonts,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold
} from '@expo-google-fonts/raleway';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop: ok se já estiver escondida */
});

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
  const [dbErro, setDbErro] = useState<string | null>(null);

  useEffect(() => {
    initStore()
      .then(() => setDbPronto(true))
      .catch((err: unknown) => {
        console.error('Falha ao inicializar o banco de dados', err);
        setDbErro('Não foi possível abrir o banco de dados local.');
      });
  }, [initStore]);

  const pronto = (fontsLoaded || fontError) && (dbPronto || dbErro != null);

  useEffect(() => {
    if (pronto) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [pronto]);

  if (!pronto) {
    return null;
  }

  return (
    <SafeAreaProvider>
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
