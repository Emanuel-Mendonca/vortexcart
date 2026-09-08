import type { ComparativoMercado, GastoPorMes } from '@/types';

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
