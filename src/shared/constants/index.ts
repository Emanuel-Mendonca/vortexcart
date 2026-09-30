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

export const CATEGORIA_PADRAO = 'Bazar e Utilidades';

/**
 * Departamentos fixos do catálogo, na ordem em que costumam aparecer em um
 * supermercado, a lista segue o trajeto da loja, não a ordem alfabética,
 * para que montar a lista de compras acompanhe o caminho pelos corredores.
 */
export const CATEGORIAS: readonly string[] = [
  'Padaria',
  'Mercearia',
  'Hortifruti',
  'Congelados',
  'Frios e Laticínios',
  'Carnes',
  'Bebidas',
  'Matinais',
  'Sobremesas',
  'Cereais e Farináceos',
  'Biscoitos e Chocolates',
  'Limpeza',
  'Perfumaria e Higiene',
  'Animais',
  CATEGORIA_PADRAO
] as const;

export const CATALOGO_INICIAL: readonly { nome: string; categoria: string }[] = [
  { nome: 'Pão francês', categoria: 'Padaria' },
  { nome: 'Pão de forma', categoria: 'Padaria' },
  { nome: 'Bolo', categoria: 'Padaria' },
  { nome: 'Óleo', categoria: 'Mercearia' },
  { nome: 'Sal', categoria: 'Mercearia' },
  { nome: 'Açúcar', categoria: 'Mercearia' },
  { nome: 'Macarrão', categoria: 'Mercearia' },
  { nome: 'Molho de tomate', categoria: 'Mercearia' },
  { nome: 'Banana', categoria: 'Hortifruti' },
  { nome: 'Tomate', categoria: 'Hortifruti' },
  { nome: 'Batata', categoria: 'Hortifruti' },
  { nome: 'Cebola', categoria: 'Hortifruti' },
  { nome: 'Alface', categoria: 'Hortifruti' },
  { nome: 'Maçã', categoria: 'Hortifruti' },
  { nome: 'Batata frita congelada', categoria: 'Congelados' },
  { nome: 'Pizza congelada', categoria: 'Congelados' },
  { nome: 'Leite', categoria: 'Frios e Laticínios' },
  { nome: 'Queijo mussarela', categoria: 'Frios e Laticínios' },
  { nome: 'Presunto', categoria: 'Frios e Laticínios' },
  { nome: 'Manteiga', categoria: 'Frios e Laticínios' },
  { nome: 'Iogurte', categoria: 'Frios e Laticínios' },
  { nome: 'Ovos', categoria: 'Frios e Laticínios' },
  { nome: 'Frango', categoria: 'Carnes' },
  { nome: 'Carne moída', categoria: 'Carnes' },
  { nome: 'Linguiça', categoria: 'Carnes' },
  { nome: 'Água mineral', categoria: 'Bebidas' },
  { nome: 'Refrigerante', categoria: 'Bebidas' },
  { nome: 'Suco de laranja', categoria: 'Bebidas' },
  { nome: 'Cerveja', categoria: 'Bebidas' },
  { nome: 'Café', categoria: 'Matinais' },
  { nome: 'Achocolatado', categoria: 'Matinais' },
  { nome: 'Sorvete', categoria: 'Sobremesas' },
  { nome: 'Gelatina', categoria: 'Sobremesas' },
  { nome: 'Arroz', categoria: 'Cereais e Farináceos' },
  { nome: 'Feijão', categoria: 'Cereais e Farináceos' },
  { nome: 'Farinha', categoria: 'Cereais e Farináceos' },
  { nome: 'Aveia', categoria: 'Cereais e Farináceos' },
  { nome: 'Biscoito', categoria: 'Biscoitos e Chocolates' },
  { nome: 'Chocolate', categoria: 'Biscoitos e Chocolates' },
  { nome: 'Detergente', categoria: 'Limpeza' },
  { nome: 'Sabão em pó', categoria: 'Limpeza' },
  { nome: 'Amaciante', categoria: 'Limpeza' },
  { nome: 'Desinfetante', categoria: 'Limpeza' },
  { nome: 'Papel higiênico', categoria: 'Perfumaria e Higiene' },
  { nome: 'Sabonete', categoria: 'Perfumaria e Higiene' },
  { nome: 'Shampoo', categoria: 'Perfumaria e Higiene' },
  { nome: 'Creme dental', categoria: 'Perfumaria e Higiene' },
  { nome: 'Ração', categoria: 'Animais' },
  { nome: 'Areia sanitária', categoria: 'Animais' },
  { nome: 'Papel toalha', categoria: 'Bazar e Utilidades' },
  { nome: 'Pilha', categoria: 'Bazar e Utilidades' }
] as const;

/**
 * Formas de pagamento que já vêm cadastradas. A lista é editável pelo
 * usuário (ver tela de Itens), então isto é só o ponto de partida, quem
 * paga com um cartão específico pode cadastrar "Nubank", "Alelo" etc.
 */
export const METODOS_PAGAMENTO_INICIAIS: readonly string[] = [
  'Cartão de débito',
  'Cartão de crédito',
  'Vale refeição'
] as const;

export const EXPORT_MIME_TYPES = {
  json: 'application/json',
  csv: 'text/csv',
  pdf: 'application/pdf'
} as const;
