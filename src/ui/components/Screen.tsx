import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /**
   * Desative quando a tela já reserva o espaço inferior por conta própria
   * (por exemplo, com `contentContainerStyle.paddingBottom` em uma lista).
   */
  respeitarBase?: boolean;
}

/**
 * Raiz das telas, resolve duas coisas que, sem elas, o conteúdo fica
 * inacessível no Android moderno:
 *
 * 1. **Áreas do sistema.** A partir do Android 15 o app desenha de ponta a
 *    ponta (`edgeToEdgeEnabled`), então sem os insets o conteúdo fica por
 *    baixo da barra de status e da barra de navegação.
 *
 * 2. **Teclado.** Nesse mesmo modo o `windowSoftInputMode=adjustResize` do
 *    manifesto deixa de encolher a janela, e o teclado passa a cobrir o campo
 *    em foco e os botões abaixo dele, o usuário digita às cegas e toca no
 *    teclado achando que está tocando no botão. O `KeyboardAvoidingView`
 *    devolve esse espaço.
 *
 * O `SafeAreaProvider` que alimenta o hook está em `app/_layout.tsx`.
 */
export function Screen({ children, respeitarBase = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = getTheme(useColorScheme() === 'dark' ? 'dark' : 'light');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: respeitarBase ? insets.bottom : 0
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}
