import * as SQLite from 'expo-sqlite';

import {
  CATALOGO_INICIAL,
  CATEGORIA_PADRAO,
  DATABASE_NAME,
  METODOS_PAGAMENTO_INICIAIS
} from '@/constants';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Abertura em andamento. A store dispara várias consultas em paralelo
 * (`Promise.all` em `refreshTudo`) e todas chamam `getDb()` ao mesmo tempo.
 * Sem compartilhar a mesma promessa, cada uma roda o schema e as migrações
 * por conta própria — e duas que passem juntas pelo `PRAGMA table_info`
 * tentam o mesmo `ALTER TABLE`, derrubando a inicialização do banco com
 * "duplicate column name".
 */
let aberturaEmCurso: Promise<SQLite.SQLiteDatabase> | null = null;

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

CREATE TABLE IF NOT EXISTS preferencias (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metodos_pagamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS catalogo_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL DEFAULT 'Outros'
);

CREATE INDEX IF NOT EXISTS idx_compras_mes ON compras(mes);
CREATE INDEX IF NOT EXISTS idx_compras_mercado ON compras(mercado_id);
CREATE INDEX IF NOT EXISTS idx_itens_compra ON itens_compra(compra_id);
CREATE INDEX IF NOT EXISTS idx_itens_compra_nome ON itens_compra(nome);
`;

/**
 * Migrations idempotentes para bancos criados antes de uma coluna existir.
 * `CREATE TABLE IF NOT EXISTS` não adiciona colunas novas a uma tabela já
 * existente, então checamos via PRAGMA table_info antes de rodar ALTER TABLE.
 */
async function migrarColunasNovas(db: SQLite.SQLiteDatabase): Promise<void> {
  await adicionarColunaSeAusente(
    db,
    'catalogo_itens',
    'categoria',
    `categoria TEXT NOT NULL DEFAULT '${CATEGORIA_PADRAO}'`
  );
  await migrarCategoriasAntigas(db);
  await migrarMetodoPagamento(db);
}

/**
 * Compras gravadas antes de existir forma de pagamento ficam com a coluna
 * nula — e é assim que devem ficar: inventar um método para elas seria
 * fabricar um dado que o usuário nunca informou.
 */
async function migrarMetodoPagamento(db: SQLite.SQLiteDatabase): Promise<void> {
  await adicionarColunaSeAusente(
    db,
    'compras',
    'metodo_pagamento_id',
    'metodo_pagamento_id INTEGER REFERENCES metodos_pagamento(id)'
  );
}

/**
 * O catálogo começou com 6 categorias genéricas e passou a usar os
 * departamentos reais de supermercado. Itens gravados antes dessa mudança
 * ficariam apontando para um departamento que não existe mais (e sumiriam do
 * filtro), então reescrevemos os nomes antigos para os novos.
 *
 * Idempotente: depois da primeira execução nenhuma linha casa mais com os
 * nomes antigos, e o UPDATE não afeta nada.
 */
async function migrarCategoriasAntigas(db: SQLite.SQLiteDatabase): Promise<void> {
  const renomeacoes: readonly [string, string][] = [
    ['Laticínios', 'Frios e Laticínios'],
    ['Outros', CATEGORIA_PADRAO]
  ];

  for (const [antiga, nova] of renomeacoes) {
    await db.runAsync('UPDATE catalogo_itens SET categoria = ? WHERE categoria = ?', [
      nova,
      antiga
    ]);
  }
}

/**
 * Semeia as formas de pagamento padrão apenas uma vez. Se o usuário apagar
 * todas de propósito, não queremos ressuscitá-las a cada abertura — por isso
 * a checagem é feita sobre a existência de qualquer linha, e não item a item.
 */
async function seedMetodosPagamento(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM metodos_pagamento'
  );
  if (row && row.total > 0) return;

  for (const nome of METODOS_PAGAMENTO_INICIAIS) {
    await db.runAsync('INSERT OR IGNORE INTO metodos_pagamento (nome) VALUES (?)', [nome]);
  }
}

async function seedCatalogoInicial(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM catalogo_itens'
  );
  if (row && row.total > 0) return;

  for (const { nome, categoria } of CATALOGO_INICIAL) {
    await db.runAsync('INSERT OR IGNORE INTO catalogo_itens (nome, categoria) VALUES (?, ?)', [
      nome,
      categoria
    ]);
  }
}

/**
 * Confere se a conexão guardada ainda está viva.
 *
 * O objeto nativo do SQLite pode ser destruído por baixo do JS — quando o app
 * fica um tempo em background e o Android recupera memória, por exemplo. O
 * singleton continua apontando para um handle morto, e a próxima escrita
 * falha com `NativeDatabase.prepareAsync has been rejected` /
 * `NullPointerException`. Uma consulta trivial detecta isso antes que uma
 * gravação real do usuário se perca.
 */
async function conexaoViva(db: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    await db.getFirstAsync('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Abre (ou cria) o banco e garante que o schema e os dados iniciais
 * existam. Chamado no início do app (ver app/_layout.tsx) e, depois disso,
 * por cada repositório antes de qualquer operação — se a conexão em cache
 * tiver morrido, reabre de forma transparente.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  let reabrindo = false;

  if (dbInstance) {
    if (await conexaoViva(dbInstance)) return dbInstance;
    console.warn('Conexão com o SQLite perdida — reabrindo o banco.');
    // Tira o handle morto do cache nativo. Pode falhar (o objeto já está
    // inválido) — é esperado, e não impede a reabertura.
    await dbInstance.closeAsync().catch(() => undefined);
    dbInstance = null;
    reabrindo = true;
  }

  // Quem chegar enquanto a abertura roda espera a mesma promessa, em vez de
  // iniciar uma segunda inicialização concorrente.
  if (aberturaEmCurso) return aberturaEmCurso;

  aberturaEmCurso = abrirEInicializar(reabrindo).finally(() => {
    aberturaEmCurso = null;
  });
  return aberturaEmCurso;
}

async function abrirEInicializar(reabrindo: boolean): Promise<SQLite.SQLiteDatabase> {
  // O módulo nativo mantém um cache por caminho de arquivo e, sem
  // `useNewConnection`, `openDatabaseAsync` devolve o MESMO objeto que já
  // estava lá — inclusive quando ele está morto. Ao reabrir, forçamos uma
  // conexão realmente nova; na primeira abertura o cache está vazio e o
  // comportamento padrão basta.
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME, { useNewConnection: reabrindo });
  await db.execAsync(SCHEMA_SQL);
  await migrarColunasNovas(db);
  await seedCatalogoInicial(db);
  await seedMetodosPagamento(db);

  dbInstance = db;
  return db;
}

/**
 * Adiciona uma coluna só se ela ainda não existir.
 *
 * O `PRAGMA` sozinho não basta: o SQLite não tem `ADD COLUMN IF NOT EXISTS`,
 * e entre a checagem e o `ALTER` existe uma janela. O erro de coluna
 * duplicada significa que outra rotina já fez o trabalho — o resultado
 * desejado — então ele é absorvido em vez de derrubar a abertura do banco.
 */
async function adicionarColunaSeAusente(
  db: SQLite.SQLiteDatabase,
  tabela: string,
  coluna: string,
  definicao: string
): Promise<void> {
  const colunas = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tabela})`);
  if (colunas.some((c) => c.name === coluna)) return;
  try {
    await db.execAsync(`ALTER TABLE ${tabela} ADD COLUMN ${definicao}`);
  } catch (erro) {
    if (!String(erro).includes('duplicate column name')) throw erro;
  }
}

/** Usado só em testes, para forçar reabertura do banco entre casos. */
export function resetDbInstanceForTests(): void {
  dbInstance = null;
}
