import { useColorScheme } from 'react-native';

import { useComprasStore } from '@/store/useComprasStore';

import { getTheme } from './theme';
import type { Theme } from './theme';

/**
 * Tema efetivo da interface.
 *
 * Único ponto que decide entre claro e escuro. Antes cada tela chamava
 * `useColorScheme()` direto, o que amarrava o app à preferência do sistema e
 * tornava impossível oferecer uma troca manual: não havia onde intervir.
 *
 * Com a preferência na store, mudar o modo re-renderiza todas as telas de
 * uma vez, porque todas leem daqui.
 */
export function useTema(): Theme {
  const preferencia = useComprasStore((s) => s.preferenciaTema);
  const sistema = useColorScheme();

  if (preferencia === 'claro') return getTheme('light');
  if (preferencia === 'escuro') return getTheme('dark');
  return getTheme(sistema === 'dark' ? 'dark' : 'light');
}
