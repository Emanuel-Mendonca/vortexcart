import type { MetodoPagamento } from '@/types';

import { getDb } from './db';

export async function listMetodosPagamento(): Promise<MetodoPagamento[]> {
  const db = await getDb();
  return db.getAllAsync<MetodoPagamento>('SELECT id, nome FROM metodos_pagamento ORDER BY nome');
}

/**
 * @returns `true` se a forma de pagamento entrou, `false` se já existia — o
 * `INSERT OR IGNORE` não falha em nome duplicado, apenas não grava, e sem
 * esse retorno a tela não teria como diferenciar os dois casos.
 */
export async function addMetodoPagamento(nomeBruto: string): Promise<boolean> {
  const nome = nomeBruto.trim();
  if (!nome) return false;
  const db = await getDb();
  const resultado = await db.runAsync('INSERT OR IGNORE INTO metodos_pagamento (nome) VALUES (?)', [
    nome
  ]);
  return resultado.changes > 0;
}

export async function renameMetodoPagamento(id: number, novoNomeBruto: string): Promise<void> {
  const novoNome = novoNomeBruto.trim();
  if (!novoNome) return;
  const db = await getDb();
  await db.runAsync('UPDATE metodos_pagamento SET nome = ? WHERE id = ?', [novoNome, id]);
}

/**
 * As compras que usavam esta forma de pagamento continuam existindo: só
 * perdem a referência (a coluna volta a ser nula). Apagar as compras junto
 * seria destruir histórico financeiro por causa de uma mudança de cadastro.
 */
export async function removeMetodoPagamento(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE compras SET metodo_pagamento_id = NULL WHERE metodo_pagamento_id = ?', [
    id
  ]);
  await db.runAsync('DELETE FROM metodos_pagamento WHERE id = ?', [id]);
}

/** Retorna o id da forma de pagamento, criando-a se ainda não existir. */
export async function getOrCreateMetodoPagamento(nomeBruto: string): Promise<number | null> {
  const nome = nomeBruto.trim();
  if (!nome) return null;
  const db = await getDb();

  const existente = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM metodos_pagamento WHERE nome = ?',
    [nome]
  );
  if (existente) return existente.id;

  const resultado = await db.runAsync('INSERT INTO metodos_pagamento (nome) VALUES (?)', [nome]);
  return resultado.lastInsertRowId;
}
