import { create } from 'zustand';

import {
  addCatalogoItem,
  atualizarCompra,
  criarCompra,
  excluirCompra as excluirCompraDb,
  getComparativoMercados,
  getGastoPorMes,
  listCatalogo,
  listComprasComItens,
  listMercadosNomes,
  listMesesComCompras,
  removeCatalogoItem,
  renameCatalogoItem
} from '@/storage';
import type {
  CatalogoItem,
  ComparativoMercado,
  CompraComItens,
  GastoPorMes,
  NovaCompraInput
} from '@/types';

interface ComprasState {
  carregando: boolean;
  inicializado: boolean;
  compras: CompraComItens[];
  catalogo: CatalogoItem[];
  mercadosSugeridos: string[];
  mesesDisponiveis: string[];
  gastoPorMes: GastoPorMes[];
  comparativoMercados: ComparativoMercado[];
  editingId: number | null;
  filtroMes: string | null;
  filtroMercado: string | null;

  init: () => Promise<void>;
  refreshTudo: () => Promise<void>;
  salvarCompra: (input: NovaCompraInput) => Promise<void>;
  excluirCompra: (id: number) => Promise<void>;
  iniciarEdicao: (id: number) => void;
  cancelarEdicao: () => void;
  setFiltroMes: (mes: string | null) => void;
  setFiltroMercado: (mercado: string | null) => void;
  adicionarItemCatalogo: (nome: string) => Promise<void>;
  renomearItemCatalogo: (id: number, novoNome: string) => Promise<void>;
  removerItemCatalogo: (id: number) => Promise<void>;
}

export const useComprasStore = create<ComprasState>((set, get) => ({
  carregando: false,
  inicializado: false,
  compras: [],
  catalogo: [],
  mercadosSugeridos: [],
  mesesDisponiveis: [],
  gastoPorMes: [],
  comparativoMercados: [],
  editingId: null,
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
      const { filtroMes, filtroMercado } = get();
      const [
        compras,
        catalogo,
        mercadosSugeridos,
        mesesDisponiveis,
        gastoPorMes,
        comparativoMercados
      ] = await Promise.all([
        listComprasComItens({ mes: filtroMes, mercadoNome: filtroMercado }),
        listCatalogo(),
        listMercadosNomes(),
        listMesesComCompras(),
        getGastoPorMes(),
        getComparativoMercados()
      ]);
      set({
        compras,
        catalogo,
        mercadosSugeridos,
        mesesDisponiveis,
        gastoPorMes,
        comparativoMercados
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
  cancelarEdicao: () => set({ editingId: null }),

  setFiltroMes: (mes: string | null) => {
    set({ filtroMes: mes });
    void get().refreshTudo();
  },
  setFiltroMercado: (mercado: string | null) => {
    set({ filtroMercado: mercado });
    void get().refreshTudo();
  },

  adicionarItemCatalogo: async (nome: string) => {
    await addCatalogoItem(nome);
    await get().refreshTudo();
  },
  renomearItemCatalogo: async (id: number, novoNome: string) => {
    await renameCatalogoItem(id, novoNome);
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
