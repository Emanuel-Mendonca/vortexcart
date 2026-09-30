import { getDb } from './db';

/**
 * Preferências simples do app, em formato chave/valor.
 *
 * Usa a tabela `preferencias` do próprio SQLite em vez de trazer mais uma
 * dependência de armazenamento: o banco já existe, já é aberto na inicial-
 * ização e já é incluído no backup do aparelho.
 */

export const CHAVE_ONBOARDING = 'onboarding_concluido';

export async function lerPreferencia(chave: string): Promise<string | null> {
  const db = await getDb();
  const linha = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM preferencias WHERE chave = ?',
    [chave]
  );
  return linha?.valor ?? null;
}

export async function gravarPreferencia(chave: string, valor: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO preferencias (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
    [chave, valor]
  );
}
