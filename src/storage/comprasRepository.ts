import type { CompraComItens, ExportedCompra, ItemCompra, NovaCompraInput } from '@/types';
import { calcularTotal } from '@/utils/totals';

import { ensureCatalogoContem } from './catalogoRepository';
import { getDb } from './db';
import { getOrCreateMercado } from './mercadosRepository';

export { calcularTotal };

interface CompraRow {
  id: number;
  mes: string;
  mercado_id: number;
  mercado_nome: string;
  total: number;
  created_at: number;
  updated_at: number | null;
}

interface ItemRow {
  id: number;
  compra_id: number;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  extra: number;
}

function mapItemRow(row: ItemRow): ItemCompra {
  return {
    id: row.id,
    compraId: row.compra_id,
    nome: row.nome,
    quantidade: row.quantidade,
    valorUnitario: row.valor_unitario,
    extra: row.extra === 1
  };
}

export interface FiltroCompras {
  mes?: string | null;
  mercadoNome?: string | null;
}

export async function listComprasComItens(filtro: FiltroCompras = {}): Promise<CompraComItens[]> {
  const db = await getDb();

  const condicoes: string[] = [];
  const params: (string | number)[] = [];

  if (filtro.mes) {
    condicoes.push('c.mes = ?');
    params.push(filtro.mes);
  }
  if (filtro.mercadoNome) {
    condicoes.push('m.nome = ?');
    params.push(filtro.mercadoNome);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

  const compraRows = await db.getAllAsync<CompraRow>(
    `SELECT c.id, c.mes, c.mercado_id, m.nome as mercado_nome, c.total, c.created_at, c.updated_at
     FROM compras c
     JOIN mercados m ON m.id = c.mercado_id
     ${where}
     ORDER BY c.created_at DESC`,
    params
  );

  if (compraRows.length === 0) return [];

  const ids = compraRows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');
  const itemRows = await db.getAllAsync<ItemRow>(
    `SELECT id, compra_id, nome, quantidade, valor_unitario, extra
     FROM itens_compra
     WHERE compra_id IN (${placeholders})`,
    ids
  );

  const itensPorCompra = new Map<number, ItemCompra[]>();
  for (const row of itemRows) {
    const item = mapItemRow(row);
    const lista = itensPorCompra.get(item.compraId) ?? [];
    lista.push(item);
    itensPorCompra.set(item.compraId, lista);
  }

  return compraRows.map((row) => ({
    id: row.id,
    mes: row.mes,
    mercadoId: row.mercado_id,
    mercadoNome: row.mercado_nome,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itens: itensPorCompra.get(row.id) ?? []
  }));
}

export async function criarCompra(input: NovaCompraInput): Promise<number> {
  const db = await getDb();
  const mercadoId = await getOrCreateMercado(input.mercadoNome);
  const total = calcularTotal(input.itens);
  const agora = Date.now();

  const resultado = await db.runAsync(
    'INSERT INTO compras (mes, mercado_id, total, created_at, updated_at) VALUES (?, ?, ?, ?, NULL)',
    [input.mes, mercadoId, total, agora]
  );
  const compraId = resultado.lastInsertRowId;

  for (const item of input.itens) {
    await db.runAsync(
      'INSERT INTO itens_compra (compra_id, nome, quantidade, valor_unitario, extra) VALUES (?, ?, ?, ?, ?)',
      [compraId, item.nome, item.quantidade, item.valorUnitario, item.extra ? 1 : 0]
    );
  }

  await ensureCatalogoContem(input.itens.map((i) => i.nome));

  return compraId;
}

export async function atualizarCompra(id: number, input: NovaCompraInput): Promise<void> {
  const db = await getDb();
  const mercadoId = await getOrCreateMercado(input.mercadoNome);
  const total = calcularTotal(input.itens);

  await db.runAsync(
    'UPDATE compras SET mes = ?, mercado_id = ?, total = ?, updated_at = ? WHERE id = ?',
    [input.mes, mercadoId, total, Date.now(), id]
  );

  await db.runAsync('DELETE FROM itens_compra WHERE compra_id = ?', [id]);
  for (const item of input.itens) {
    await db.runAsync(
      'INSERT INTO itens_compra (compra_id, nome, quantidade, valor_unitario, extra) VALUES (?, ?, ?, ?, ?)',
      [id, item.nome, item.quantidade, item.valorUnitario, item.extra ? 1 : 0]
    );
  }

  await ensureCatalogoContem(input.itens.map((i) => i.nome));
}

export async function excluirCompra(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM itens_compra WHERE compra_id = ?', [id]);
  await db.runAsync('DELETE FROM compras WHERE id = ?', [id]);
}

export async function listMesesComCompras(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ mes: string }>(
    'SELECT DISTINCT mes FROM compras ORDER BY mes DESC'
  );
  return rows.map((r) => r.mes);
}

/**
 * Insere uma compra vinda de um backup importado, preservando as datas
 * originais (createdAt/updatedAt) em vez de usar Date.now(). O total é
 * sempre recalculado a partir dos itens, para não confiar em um valor
 * potencialmente adulterado no arquivo.
 */
export async function inserirCompraImportada(compra: ExportedCompra): Promise<void> {
  const db = await getDb();
  const mercadoId = await getOrCreateMercado(compra.mercadoNome);
  const total = compra.itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);

  const resultado = await db.runAsync(
    'INSERT INTO compras (mes, mercado_id, total, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [compra.mes, mercadoId, total, compra.createdAt, compra.updatedAt]
  );
  const compraId = resultado.lastInsertRowId;

  for (const item of compra.itens) {
    await db.runAsync(
      'INSERT INTO itens_compra (compra_id, nome, quantidade, valor_unitario, extra) VALUES (?, ?, ?, ?, ?)',
      [compraId, item.nome, item.quantidade, item.valorUnitario, item.extra ? 1 : 0]
    );
  }

  await ensureCatalogoContem(compra.itens.map((i) => i.nome));
}
