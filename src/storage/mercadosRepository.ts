import { getDb } from './db';

/** Retorna o id do mercado, criando-o se ainda não existir. */
export async function getOrCreateMercado(nomeBruto: string): Promise<number> {
  const nome = nomeBruto.trim();
  const db = await getDb();

  const existente = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM mercados WHERE nome = ?',
    [nome]
  );
  if (existente) return existente.id;

  const resultado = await db.runAsync('INSERT INTO mercados (nome) VALUES (?)', [nome]);
  return resultado.lastInsertRowId;
}

export async function listMercadosNomes(): Promise<string[]> {
  const db = await getDb();
  const linhas = await db.getAllAsync<{ nome: string }>('SELECT nome FROM mercados ORDER BY nome');
  return linhas.map((l) => l.nome);
}
