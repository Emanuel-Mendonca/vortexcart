import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICONE_POR_CATEGORIA: Record<string, IoniconName> = {
  Padaria: 'pizza-outline',
  Mercearia: 'basket-outline',
  Hortifruti: 'nutrition-outline',
  Congelados: 'snow-outline',
  'Frios e Laticínios': 'water-outline',
  Carnes: 'restaurant-outline',
  Bebidas: 'wine-outline',
  Matinais: 'cafe-outline',
  Sobremesas: 'ice-cream-outline',
  'Cereais e Farináceos': 'leaf-outline',
  'Biscoitos e Chocolates': 'gift-outline',
  Limpeza: 'sparkles-outline',
  'Perfumaria e Higiene': 'flower-outline',
  Animais: 'paw-outline',
  'Bazar e Utilidades': 'construct-outline'
};

export function getCategoriaIcon(categoria: string | undefined): IoniconName {
  if (!categoria) return 'pricetag-outline';
  return ICONE_POR_CATEGORIA[categoria] ?? 'pricetag-outline';
}
