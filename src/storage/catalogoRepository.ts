import type { CatalogoItem } from '@/types';

import { getDb } from './db';

export async function listCatalogo(): Promise<CatalogoItem[]> {
  const db = await getDb();
  return db.getAllAsync<CatalogoItem>('SELECT id, nome FROM catalogo_itens ORDER BY nome');
}

export async function addCatalogoItem(nomeBruto: string): Promise<void> {
  const nome = nomeBruto.trim();
  if (!nome) return;
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome) VALUES (?)', [nome]);
}

export async function renameCatalogoItem(id: number, novoNomeBruto: string): Promise<void> {
  const novoNome = novoNomeBruto.trim();
  if (!novoNome) return;
  const db = await getDb();
  await db.runAsync('UPDATE catalogo_itens SET nome = ? WHERE id = ?', [novoNome, id]);
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
    await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome) VALUES (?)', [nome]);
  }
}
