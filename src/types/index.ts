/**
 * Tipos de domínio
 * -----------------------------------------------------------------------
 * Modelo normalizado (mercados / compras / itens_compra / catalogo_itens),
 * pensado para consultas SQL de agregação (SUM, AVG, GROUP BY) usadas nas
 * telas de Resumo e Histórico. Difere do modelo "um JSON só" da versão web
 * porque agora há um banco relacional de verdade por trás.
 */

export interface Mercado {
  id: number;
  nome: string;
}

export interface CatalogoItem {
  id: number;
  nome: string;
}

export interface ItemCompra {
  id: number;
  compraId: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  extra: boolean;
}

/** Payload usado ao criar/editar um item, antes de existir no banco. */
export type NovoItemCompra = Omit<ItemCompra, 'id' | 'compraId'>;

export interface Compra {
  id: number;
  mes: string; // formato "YYYY-MM"
  mercadoId: number;
  total: number;
  createdAt: number;
  updatedAt: number | null;
}

/** Compra "achatada" para exibição em tela, já com nome do mercado e itens. */
export interface CompraComItens extends Compra {
  mercadoNome: string;
  itens: ItemCompra[];
}

/** Payload usado pelo formulário de Nova Compra / Edição. */
export interface NovaCompraInput {
  mes: string;
  mercadoNome: string;
  itens: NovoItemCompra[];
}

export interface GastoPorMes {
  mes: string;
  total: number;
}

export interface ComparativoMercado {
  mercadoId: number;
  mercadoNome: string;
  totalGasto: number;
  quantidadeCompras: number;
  mediaPorCompra: number;
}

export type ColorSchemePreference = 'light' | 'dark' | 'system';

/** Formato de arquivo usado pela exportação/importação de backup (JSON). */
export interface ExportedItem {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  extra: boolean;
}

export interface ExportedCompra {
  mes: string;
  mercadoNome: string;
  createdAt: number;
  updatedAt: number | null;
  itens: ExportedItem[];
}

export interface ExportPayload {
  versao: 1;
  exportadoEm: number;
  catalogo: string[];
  compras: ExportedCompra[];
}
