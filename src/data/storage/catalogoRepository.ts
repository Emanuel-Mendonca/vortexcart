import { CATEGORIA_PADRAO } from '@/constants';
import type { CatalogoItem, PrecoMedioItem } from '@/types';
import { mesmoNome } from '@/utils/texto';

import { getDb } from './db';

export async function listCatalogo(): Promise<CatalogoItem[]> {
  const db = await getDb();
  return db.getAllAsync<CatalogoItem>(
    'SELECT id, nome, categoria FROM catalogo_itens ORDER BY nome'
  );
}

/**
 * @returns `true` se o item entrou no catálogo, `false` se já existia, o
 * `INSERT OR IGNORE` não falha em nome duplicado, ele simplesmente não grava,
 * e sem esse retorno a tela não teria como diferenciar os dois casos.
 */
export async function addCatalogoItem(
  nomeBruto: string,
  categoria: string = CATEGORIA_PADRAO
): Promise<boolean> {
  const nome = nomeBruto.trim();
  if (!nome) return false;
  const db = await getDb();

  // O UNIQUE da coluna só barra o nome idêntico, "Cafe" e "Café" entrariam os
  // dois. A comparação sem acento/caixa fica aqui, no JS, porque o SQLite não
  // normaliza caracteres acentuados sem extensão ICU.
  const existentes = await db.getAllAsync<{ nome: string }>('SELECT nome FROM catalogo_itens');
  if (existentes.some((linha) => mesmoNome(linha.nome, nome))) return false;

  const resultado = await db.runAsync(
    'INSERT OR IGNORE INTO catalogo_itens (nome, categoria) VALUES (??)',
    [nome, categoria]
  );
  return resultado.changes > 0;
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
    await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome, categoria) VALUES (??)', [
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
