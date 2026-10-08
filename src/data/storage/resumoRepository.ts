import type { ComparativoMercado, GastoPorMes, GastoPorMetodoPagamento } from '@/types';

import { getDb } from './db';

export async function getGastoPorMes(): Promise<GastoPorMes[]> {
  const db = await getDb();
  return db.getAllAsync<GastoPorMes>(
    `SELECT mes, SUM(total) as total
     FROM compras
     GROUP BY mes
     ORDER BY mes ASC`
  );
}

interface MetodoRow {
  metodo_nome: string | null;
  total_gasto: number;
  quantidade_compras: number;
}

/**
 * Quanto foi gasto em cada forma de pagamento.
 *
 * `LEFT JOIN` de propósito: compras registradas antes de existir forma de
 * pagamento (ou gravadas sem informar) entram agrupadas em `metodoNome:
 * null`. Omiti-las faria a soma das formas não bater com o total do período,
 * e quem olha o resumo não entenderia a diferença.
 */
export async function getGastoPorMetodoPagamento(): Promise<GastoPorMetodoPagamento[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MetodoRow>(
    `SELECT mp.nome as metodo_nome,
            SUM(c.total) as total_gasto,
            COUNT(c.id) as quantidade_compras
       FROM compras c
       LEFT JOIN metodos_pagamento mp ON mp.id = c.metodo_pagamento_id
      GROUP BY c.metodo_pagamento_id, mp.nome
      ORDER BY total_gasto DESC`
  );
  return rows.map((r) => ({
    metodoNome: r.metodo_nome,
    totalGasto: r.total_gasto,
    quantidadeCompras: r.quantidade_compras
  }));
}

interface ComparativoRow {
  mercado_id: number;
  mercado_nome: string;
  total_gasto: number;
  quantidade_compras: number;
}

export async function getComparativoMercados(): Promise<ComparativoMercado[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ComparativoRow>(
    `SELECT m.id as mercado_id, m.nome as mercado_nome,
            SUM(c.total) as total_gasto,
            COUNT(*) as quantidade_compras
     FROM compras c
     JOIN mercados m ON m.id = c.mercado_id
     GROUP BY m.id`
  );

  return rows
    .map((row) => ({
      mercadoId: row.mercado_id,
      mercadoNome: row.mercado_nome,
      totalGasto: row.total_gasto,
      quantidadeCompras: row.quantidade_compras,
      mediaPorCompra: row.total_gasto / row.quantidade_compras
    }))
    .sort((a, b) => a.mediaPorCompra - b.mediaPorCompra);
}
