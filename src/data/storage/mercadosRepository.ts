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

/**
 * Só mercados que têm pelo menos uma compra.
 *
 * Corrigir o nome de um mercado (editando uma compra) cria um registro novo e
 * deixa o antigo sem nenhuma compra apontando para ele. Listar a tabela
 * inteira faria o filtro do Histórico oferecer um mercado que, na prática,
 * não existe mais — e que não devolve resultado nenhum ao ser selecionado.
 */
export async function listMercadosNomes(): Promise<string[]> {
  const db = await getDb();
  const linhas = await db.getAllAsync<{ nome: string }>(
    `SELECT m.nome
       FROM mercados m
       JOIN compras c ON c.mercado_id = m.id
      GROUP BY m.id, m.nome
      ORDER BY m.nome`
  );
  return linhas.map((l) => l.nome);
}

/**
 * Remove mercados que ficaram sem nenhuma compra. Chamado após gravar ou
 * excluir uma compra, para a tabela não acumular nomes abandonados por
 * correções de digitação.
 */
export async function limparMercadosOrfaos(): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM mercados WHERE id NOT IN (SELECT DISTINCT mercado_id FROM compras)'
  );
}
