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

export const CATEGORIA_PADRAO = 'Outros';

/** Categorias fixas do catálogo de itens. */
export const CATEGORIAS: readonly string[] = [
  'Mercearia',
  'Hortifruti',
  'Laticínios',
  'Bebidas',
  'Limpeza',
  CATEGORIA_PADRAO
] as const;

export const CATALOGO_INICIAL: readonly { nome: string; categoria: string }[] = [
  { nome: 'Arroz', categoria: 'Mercearia' },
  { nome: 'Feijão', categoria: 'Mercearia' },
  { nome: 'Óleo', categoria: 'Mercearia' },
  { nome: 'Sal', categoria: 'Mercearia' },
  { nome: 'Açúcar', categoria: 'Mercearia' },
  { nome: 'Café', categoria: 'Mercearia' },
  { nome: 'Macarrão', categoria: 'Mercearia' },
  { nome: 'Farinha', categoria: 'Mercearia' },
  { nome: 'Leite', categoria: 'Laticínios' },
  { nome: 'Ovos', categoria: 'Laticínios' },
  { nome: 'Pão', categoria: 'Mercearia' },
  { nome: 'Detergente', categoria: 'Limpeza' },
  { nome: 'Sabão em pó', categoria: 'Limpeza' },
  { nome: 'Papel higiênico', categoria: 'Limpeza' },
  { nome: 'Papel toalha', categoria: 'Limpeza' }
] as const;

export const EXPORT_MIME_TYPES = {
  json: 'application/json',
  csv: 'text/csv',
  pdf: 'application/pdf'
} as const;
