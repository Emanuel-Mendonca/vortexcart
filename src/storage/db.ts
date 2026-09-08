import * as SQLite from 'expo-sqlite';

import { CATALOGO_INICIAL, DATABASE_NAME } from '@/constants';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS mercados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS compras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mes TEXT NOT NULL,
  mercado_id INTEGER NOT NULL REFERENCES mercados(id),
  total REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS itens_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade REAL NOT NULL DEFAULT 0,
  valor_unitario REAL NOT NULL DEFAULT 0,
  extra INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalogo_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_compras_mes ON compras(mes);
CREATE INDEX IF NOT EXISTS idx_compras_mercado ON compras(mercado_id);
CREATE INDEX IF NOT EXISTS idx_itens_compra ON itens_compra(compra_id);
`;

async function seedCatalogoInicial(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM catalogo_itens'
  );
  if (row && row.total > 0) return;

  for (const nome of CATALOGO_INICIAL) {
    await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome) VALUES (?)', [nome]);
  }
}

/**
 * Abre (ou cria) o banco e garante que o schema e os dados iniciais
 * existam. Chamado uma vez, no início do app (ver app/_layout.tsx).
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(SCHEMA_SQL);
  await seedCatalogoInicial(db);

  dbInstance = db;
  return dbInstance;
}

/** Usado só em testes, para forçar reabertura do banco entre casos. */
export function resetDbInstanceForTests(): void {
  dbInstance = null;
}
