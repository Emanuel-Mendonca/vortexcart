import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICONE_POR_CATEGORIA: Record<string, IoniconName> = {
  Mercearia: 'basket-outline',
  Hortifruti: 'nutrition-outline',
  Laticínios: 'water-outline',
  Bebidas: 'wine-outline',
  Limpeza: 'sparkles-outline',
  Outros: 'pricetag-outline'
};

export function getCategoriaIcon(categoria: string | undefined): IoniconName {
  if (!categoria) return 'pricetag-outline';
  return ICONE_POR_CATEGORIA[categoria] ?? 'pricetag-outline';
}
