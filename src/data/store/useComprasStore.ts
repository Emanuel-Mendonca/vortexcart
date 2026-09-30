import { create } from 'zustand';

import {
  addCatalogoItem,
  addMetodoPagamento,
  atualizarCompra,
  criarCompra,
  excluirCompra as excluirCompraDb,
  getComparativoMercados,
  getGastoPorMes,
  getPrecoMedioPorItem,
  listCatalogo,
  listMetodosPagamento,
  listComprasComItens,
  listMercadosNomes,
  listMesesComCompras,
  removeCatalogoItem,
  removeMetodoPagamento,
  renameCatalogoItem,
  renameMetodoPagamento
} from '@/storage';
import type {
  CatalogoItem,
  NovoItemCompra,
  MetodoPagamento,
  ComparativoMercado,
  CompraComItens,
  GastoPorMes,
  NovaCompraInput,
  PrecoMedioItem
} from '@/types';

interface ComprasState {
  carregando: boolean;
  inicializado: boolean;
  compras: CompraComItens[];
  catalogo: CatalogoItem[];
  metodosPagamento: MetodoPagamento[];
  precoMedioPorItem: Record<string, PrecoMedioItem>;
  mercadosSugeridos: string[];
  mesesDisponiveis: string[];
  gastoPorMes: GastoPorMes[];
  comparativoMercados: ComparativoMercado[];
  editingId: number | null;
  /**
   * Compra lida de um cupom fiscal, aguardando revisão na tela de Nova
   * Compra. Fica na store (e não em parâmetro de rota) porque a lista de
   * itens pode ser longa demais para trafegar numa URL.
   */
  rascunhoCupom: RascunhoCupom | null;
  filtroMes: string | null;
  filtroMercado: string | null;

  init: () => Promise<void>;
  refreshTudo: () => Promise<void>;
  salvarCompra: (input: NovaCompraInput) => Promise<void>;
  excluirCompra: (id: number) => Promise<void>;
  iniciarEdicao: (id: number) => void;
  definirRascunhoCupom: (rascunho: RascunhoCupom | null) => void;
  cancelarEdicao: () => void;
  setFiltroMes: (mes: string | null) => void;
  setFiltroMercado: (mercado: string | null) => void;
  /** Resolve para `false` quando já existia um item com esse nome. */
  adicionarItemCatalogo: (nome: string, categoria?: string) => Promise<boolean>;
  /** Resolve para `false` quando já existia uma forma de pagamento com esse nome. */
  adicionarMetodoPagamento: (nome: string) => Promise<boolean>;
  renomearMetodoPagamento: (id: number, novoNome: string) => Promise<void>;
  removerMetodoPagamento: (id: number) => Promise<void>;
  renomearItemCatalogo: (id: number, novoNome: string, categoria?: string) => Promise<void>;
  removerItemCatalogo: (id: number) => Promise<void>;
}

export interface RascunhoCupom {
  mes: string | null;
  mercadoNome: string | null;
  itens: NovoItemCompra[];
  /** Quantos itens do cupom foram reconhecidos no catálogo já cadastrado. */
  reconhecidos: number;
}

export const useComprasStore = create<ComprasState>((set, get) => ({
  carregando: false,
  inicializado: false,
  compras: [],
  catalogo: [],
  metodosPagamento: [],
  precoMedioPorItem: {},
  mercadosSugeridos: [],
  mesesDisponiveis: [],
  gastoPorMes: [],
  comparativoMercados: [],
  editingId: null,
  rascunhoCupom: null,
  filtroMes: null,
  filtroMercado: null,

  init: async () => {
    if (get().inicializado) return;
    await get().refreshTudo();
    set({ inicializado: true });
  },

  refreshTudo: async () => {
    set({ carregando: true });
    try {
      // Os filtros são validados ANTES de consultar as compras. Corrigir o
      // nome de um mercado (ou excluir a última compra de um mês) pode deixar
      // o filtro ativo apontando para algo que não existe mais — e aí a lista
      // viria vazia sem explicação nenhuma para quem está olhando.
      const [mercadosSugeridos, mesesDisponiveis] = await Promise.all([
        listMercadosNomes(),
        listMesesComCompras()
      ]);

      const { filtroMes: mesAtual, filtroMercado: mercadoAtual } = get();
      const filtroMes = mesAtual && mesesDisponiveis.includes(mesAtual) ? mesAtual : null;
      const filtroMercado =
        mercadoAtual && mercadosSugeridos.includes(mercadoAtual) ? mercadoAtual : null;

      const [
        compras,
        catalogo,
        metodosPagamento,
        precoMedioPorItem,
        gastoPorMes,
        comparativoMercados
      ] = await Promise.all([
        listComprasComItens({ mes: filtroMes, mercadoNome: filtroMercado }),
        listCatalogo(),
        listMetodosPagamento(),
        getPrecoMedioPorItem(),
        getGastoPorMes(),
        getComparativoMercados()
      ]);
      set({
        compras,
        catalogo,
        metodosPagamento,
        precoMedioPorItem,
        mercadosSugeridos,
        mesesDisponiveis,
        gastoPorMes,
        comparativoMercados,
        filtroMes,
        filtroMercado
      });
    } finally {
      set({ carregando: false });
    }
  },

  salvarCompra: async (input: NovaCompraInput) => {
    const { editingId } = get();
    if (editingId != null) {
      await atualizarCompra(editingId, input);
    } else {
      await criarCompra(input);
    }
    set({ editingId: null });
    await get().refreshTudo();
  },

  excluirCompra: async (id: number) => {
    await excluirCompraDb(id);
    await get().refreshTudo();
  },

  iniciarEdicao: (id: number) => set({ editingId: id }),
  definirRascunhoCupom: (rascunho: RascunhoCupom | null) => set({ rascunhoCupom: rascunho }),
  cancelarEdicao: () => set({ editingId: null }),

  setFiltroMes: (mes: string | null) => {
    set({ filtroMes: mes });
    void get().refreshTudo();
  },
  setFiltroMercado: (mercado: string | null) => {
    set({ filtroMercado: mercado });
    void get().refreshTudo();
  },

  adicionarItemCatalogo: async (nome: string, categoria?: string) => {
    const inserido = await addCatalogoItem(nome, categoria);
    await get().refreshTudo();
    return inserido;
  },
  renomearItemCatalogo: async (id: number, novoNome: string, categoria?: string) => {
    await renameCatalogoItem(id, novoNome, categoria);
    await get().refreshTudo();
  },
  adicionarMetodoPagamento: async (nome: string) => {
    const inserido = await addMetodoPagamento(nome);
    await get().refreshTudo();
    return inserido;
  },
  renomearMetodoPagamento: async (id: number, novoNome: string) => {
    await renameMetodoPagamento(id, novoNome);
    await get().refreshTudo();
  },
  removerMetodoPagamento: async (id: number) => {
    await removeMetodoPagamento(id);
    await get().refreshTudo();
  },

  removerItemCatalogo: async (id: number) => {
    await removeCatalogoItem(id);
    await get().refreshTudo();
  }
}));

/** Seletor de conveniência: a compra atualmente em edição, se houver. */
export function useCompraEmEdicao(): CompraComItens | null {
  return useComprasStore((state) => {
    if (state.editingId == null) return null;
    return state.compras.find((c) => c.id === state.editingId) ?? null;
  });
}
