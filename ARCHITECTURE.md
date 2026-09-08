# Arquitetura

## Visão geral

```
┌─────────────────────────────────────────────┐
│  app/  (Expo Router — rotas, sem lógica)      │
│  cada arquivo só renderiza uma tela de src/   │
└───────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│  src/screens/  (telas — composição de UI)        │
│  usam componentes + a store, sem acessar SQL     │
│  diretamente                                     │
└───────┬─────────────────────────────┬────────────┘
        │                             │
┌───────▼────────────┐   ┌────────────▼─────────────┐
│ src/components/     │   │ src/store/                │
│ UI pura, sem regra   │   │ useComprasStore (Zustand) │
│ de negócio           │   │ — única fonte de verdade  │
└─────────────────────┘   │   do estado da UI          │
                           └──────────┬─────────────────┘
                                      │
                     ┌────────────────▼─────────────────┐
                     │ src/storage/ (repositórios)        │
                     │ uma função por operação de dados,  │
                     │ SQL isolado aqui                   │
                     └────────────────┬─────────────────┘
                                      │
                          ┌───────────▼───────────┐
                          │ SQLite (expo-sqlite)    │
                          │ arquivo local no device │
                          └─────────────────────────┘

src/services/  → exportação/importação (lê da store/storage, não é chamado pelas telas
                 diretamente para regras de negócio, só para I/O de arquivo)
src/theme/     → tokens de design, consumidos por components/ e screens/
src/types/     → contratos de dados, usados em todas as camadas acima
src/utils/     → funções puras (formatação, datas, validação) sem dependência de estado
```

## Por que essa separação

**Telas não sabem que existe SQLite.** `src/screens/*.tsx` só conhece a store
(`useComprasStore`). Se um dia trocarmos SQLite por outra coisa, a mudança fica contida em
`src/storage/`, sem tocar em nenhuma tela.

**Repositórios, não um "banco de dados genérico".** Cada arquivo em `src/storage/` (
`comprasRepository.ts`, `mercadosRepository.ts` etc.) expõe funções com nomes de domínio
(`criarCompra`, `getComparativoMercados`) em vez de expor `query()` cru — quem usa não
precisa saber SQL.

**Uma store só.** Cogitamos dividir em várias stores por feature, mas como todo o app gira
em torno de "compras" (histórico, resumo e catálogo são todos derivados dela), uma única
`useComprasStore` evita sincronização manual entre stores para manter os dados consistentes.

**`services/` é sobre I/O de arquivo, não sobre regra de negócio.** Exportar/importar mexe
com o sistema de arquivos e o seletor de documentos do SO — isso é uma preocupação diferente
de "como calcular o total de uma compra", por isso fica separado de `storage/`.

## Fluxo de dados: registrar uma compra

1. `NovaCompraScreen` coleta os dados via `react-hook-form`, validados por
   `novaCompraFormSchema` (Zod) a cada submit.
2. No submit, chama `useComprasStore().salvarCompra(input)`.
3. A store decide, internamente, entre `criarCompra` ou `atualizarCompra`
   (`src/storage/comprasRepository.ts`), dependendo de haver ou não um `editingId`.
4. O repositório abre uma transação implícita (uma chamada `runAsync` por instrução),
   grava em `compras` e `itens_compra`, e garante que os nomes usados existam em
   `catalogo_itens` (`ensureCatalogoContem`).
5. A store chama `refreshTudo()`, que relê compras, catálogo, meses e as duas agregações
   (`getGastoPorMes`, `getComparativoMercados`) de uma vez.
6. As telas que consomem esses seletores da store (Histórico, Resumo, Itens) re-renderizam
   automaticamente — não há necessidade de invalidação manual de cache.

## Por que SQLite em vez de AsyncStorage

Ver a justificativa completa na conversa de decisão do projeto — resumo: as telas de Resumo
precisam de `SUM`/`AVG`/`GROUP BY` sobre o histórico de compras. Fazer isso em JS sobre um
blob JSON carregado inteiro na memória piora conforme o histórico cresce; no SQLite, isso é
uma query. O custo é ter que gerenciar schema (`src/storage/db.ts`), o que consideramos um
trade-off aceitável dado o ganho de escalabilidade e a naturalidade das consultas.

## Por que sem React Query

O app é 100% offline — não há cache de servidor para gerenciar, invalidação de rede, nem
refetch em background. O Zustand sozinho, chamando os repositórios diretamente e re-buscando
tudo após cada mutação (`refreshTudo`), é suficiente e mais simples de entender. Se o volume
de dados um dia justificar buscas parciais/paginadas, essa decisão deve ser revisitada.

## Convenção de nomes: português nos domínios, inglês no genérico

Funções e tipos que representam o **domínio do app** (compras, mercados, itens) usam nomes em
português (`criarCompra`, `ComparativoMercado`) porque são conceitos específicos deste
produto. Componentes e utilitários **genéricos**, que poderiam existir em qualquer app
(`Button`, `TextField`, `formatBRL`), seguem convenção em inglês, como é comum no ecossistema
React/React Native. Veja mais em [STYLEGUIDE.md](./STYLEGUIDE.md).
