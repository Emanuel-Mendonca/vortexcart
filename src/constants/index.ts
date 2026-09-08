export const DATABASE_NAME = 'controle_compras.db';

export const MESES_PT: readonly string[] = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
] as const;

export const CATALOGO_INICIAL: readonly string[] = [
  'Arroz',
  'Feijão',
  'Óleo',
  'Sal',
  'Açúcar',
  'Café',
  'Leite',
  'Ovos',
  'Pão',
  'Macarrão',
  'Farinha',
  'Detergente',
  'Sabão em pó',
  'Papel higiênico',
  'Papel toalha'
] as const;

export const SECURE_STORE_THEME_KEY = 'preferencia_tema';

export const EXPORT_MIME_TYPES = {
  json: 'application/json',
  csv: 'text/csv',
  pdf: 'application/pdf'
} as const;
