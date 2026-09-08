# Guia de Estilo

## Linguagem: português no domínio, inglês no genérico

- **Domínio do app** (o que é específico do "Controle da Compra"): português.
  `criarCompra`, `useComprasStore`, `ComparativoMercado`, `mesLabel`.
- **Genérico/reutilizável** (poderia estar em qualquer app React Native): inglês.
  `Button`, `TextField`, `formatBRL`, `EmptyState`.
- Comentários e documentação: português, para quem for manter este projeto no Brasil.
- Nomes de branches, commits e arquivos de config: inglês, por convenção do ecossistema
  (Conventional Commits, nomes de arquivo padrão como `README.md`).

## TypeScript

- `strict: true` sempre. Evite `any`; se for realmente necessário, comente o porquê.
- Prefira `type` para uniões/formas simples, `interface` para formas de objeto que podem ser
  estendidas (padrão já usado em `src/types/index.ts`).
- Funções exportadas de `storage/` e `services/` sempre com tipo de retorno explícito
  (`Promise<X>`) — facilita ver o contrato sem abrir a implementação.
- Use `import type { X } from '...'` para importar só tipos (o ESLint já avisa via
  `@typescript-eslint/consistent-type-imports`).

## Componentes React

- Componentes de UI pura (`src/components/`) não acessam a store nem os repositórios —
  recebem tudo via props.
- Prefira componentes de função com hooks; sem classes.
- Um componente por arquivo, nome do arquivo = nome do componente (`Button.tsx` exporta
  `Button`).
- Estilos com `StyleSheet.create`, valores de cor/espaçamento sempre via `theme` (nunca cor
  hexadecimal solta no meio do componente) — isso é o que permite o tema claro/escuro
  funcionar em todo o app de graça.

## Formatação e lint

Prettier e ESLint já aplicam a maior parte disso automaticamente (`npm run format`,
`npm run lint:fix`) — não gaste tempo debatendo estilo que a ferramenta resolve:

- Aspas simples, sem ponto e vírgula ausente, sem vírgula à direita (ver `.prettierrc`).
- Ordem de imports: builtin → external → internal → parent/sibling, com linha em branco
  entre grupos (regra `import/order` no `.eslintrc.js`).
- Sem `console.log` esquecido (permitido apenas `console.warn`/`console.error`).

## Nomenclatura de arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `MonthPicker.tsx` |
| Tela | PascalCase + sufixo `Screen` | `NovaCompraScreen.tsx` |
| Repositório | camelCase + sufixo `Repository` | `comprasRepository.ts` |
| Hook customizado | `use` + PascalCase | `useComprasStore.ts` |
| Utilitário | camelCase | `currency.ts`, `date.ts` |
| Rota (Expo Router) | minúsculo, reflete a URL | `historico.tsx` |

## Commits e branches

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) — Conventional Commits, Git Flow simplificado.

## Design tokens

Nunca hardcode cor, espaçamento ou fonte em um componente. Tudo vem de `src/theme/tokens.ts`
via `getTheme(scheme)`. Se um valor que você precisa não existe nos tokens, adicione-o lá
primeiro — não crie um valor "só desta vez" dentro do componente.
