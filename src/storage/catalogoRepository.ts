import { CATEGORIA_PADRAO } from '@/constants';
import type { CatalogoItem, PrecoMedioItem } from '@/types';

import { getDb } from './db';

export async function listCatalogo(): Promise<CatalogoItem[]> {
  const db = await getDb();
  return db.getAllAsync<CatalogoItem>(
    'SELECT id, nome, categoria FROM catalogo_itens ORDER BY nome'
  );
}

export async function addCatalogoItem(
  nomeBruto: string,
  categoria: string = CATEGORIA_PADRAO
): Promise<void> {
  const nome = nomeBruto.trim();
  if (!nome) return;
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome, categoria) VALUES (?, ?)', [
    nome,
    categoria
  ]);
}

export async function renameCatalogoItem(
  id: number,
  novoNomeBruto: string,
  categoria?: string
): Promise<void> {
  const novoNome = novoNomeBruto.trim();
  if (!novoNome) return;
  const db = await getDb();
  if (categoria) {
    await db.runAsync('UPDATE catalogo_itens SET nome = ?, categoria = ? WHERE id = ?', [
      novoNome,
      categoria,
      id
    ]);
  } else {
    await db.runAsync('UPDATE catalogo_itens SET nome = ? WHERE id = ?', [novoNome, id]);
  }
}

export async function removeCatalogoItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM catalogo_itens WHERE id = ?', [id]);
}

/** Garante que os nomes usados numa compra também existam no catálogo. */
export async function ensureCatalogoContem(nomes: readonly string[]): Promise<void> {
  const db = await getDb();
  for (const nomeBruto of nomes) {
    const nome = nomeBruto.trim();
    if (!nome) continue;
    await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome, categoria) VALUES (?, ?)', [
      nome,
      CATEGORIA_PADRAO
    ]);
  }
}

/**
 * Preço médio pago por item, calculado a partir do histórico real de compras
 * (itens_compra). Usado para mostrar "último preço médio" no catálogo.
 */
export async function getPrecoMedioPorItem(): Promise<Record<string, PrecoMedioItem>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ nome: string; preco_medio: number; qtd: number }>(
    `SELECT nome, AVG(valor_unitario) as preco_medio, COUNT(*) as qtd
     FROM itens_compra
     GROUP BY nome`
  );
  const mapa: Record<string, PrecoMedioItem> = {};
  for (const row of rows) {
    mapa[row.nome] = {
      nome: row.nome,
      precoMedio: row.preco_medio,
      quantidadeCompras: row.qtd
    };
  }
  return mapa;
}
