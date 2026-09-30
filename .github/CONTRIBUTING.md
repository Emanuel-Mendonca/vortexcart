# Contribuindo com o Vortex Cart

Obrigado pelo interesse! Este documento reúne o fluxo de trabalho, as convenções de código
e o que se espera de teste antes de um Pull Request.

## Antes de começar

1. Verifique se já não existe issue ou PR sobre o que você quer fazer.
2. Para mudanças grandes, abra uma issue primeiro para alinhar a abordagem.
3. Leia o [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

Para instalar e rodar o projeto, veja o [GUIA.md](../docs/projeto/GUIA.md).

## Fluxo de branches

Git Flow simplificado:

- `main`, estável, nunca recebe commit direto
- `develop`, integração das features
- `feature/<nome>`, `fix/<nome>`, a partir de `develop`
- `hotfix/<nome>`, a partir de `main`, para correção urgente

```bash
git checkout develop
git pull
git checkout -b feature/minha-mudanca
```

## Padrão de commits

[Conventional Commits](https://www.conventionalcommits.org/), validado pelo Husky +
Commitlint a cada commit:

```
feat(escopo): descrição no imperativo
fix(escopo): descrição no imperativo
docs: descrição
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`.

---

# Convenções de código

## Linguagem: português no domínio, inglês no genérico

- **Domínio do app** (específico deste produto): português, `criarCompra`,
  `useComprasStore`, `ComparativoMercado`.
- **Genérico** (poderia existir em qualquer app React Native): inglês, `Button`,
  `TextField`, `formatBRL`.
- Comentários e documentação: português.
- Branches, commits e arquivos de configuração: inglês, por convenção do ecossistema.

## Camadas

O `src/` é dividido em quatro camadas e **a dependência só desce**:

```
ui/       → data/ → shared/
services/ → data/ → shared/
```

Se algo em `shared/` importar de `ui/`, é erro de camada. Detalhes em
[ARCHITECTURE.md](../docs/projeto/ARCHITECTURE.md).

## TypeScript

- `strict: true` sempre. Evite `any`; se for inevitável, comente o porquê.
- `type` para uniões e formas simples; `interface` para objetos extensíveis.
- Funções exportadas de `data/storage/` e `services/` sempre com tipo de retorno explícito.
- `import type { X }` para importar só tipos (o ESLint avisa).

## Componentes React

- Componentes de `ui/components/` não acessam a store nem os repositórios, recebem tudo
  por props.
- Funções com hooks; sem classes.
- Um componente por arquivo, nome do arquivo igual ao do componente.
- **Nunca** cor, espaçamento ou fonte fixos no componente. Tudo vem de
  `ui/theme/tokens.ts` via `getTheme(scheme)`, é isso que faz o tema claro/escuro
  funcionar de graça. Se o valor não existe nos tokens, adicione-o lá primeiro.

## Nomenclatura de arquivos

| Tipo               | Convenção                | Exemplo                |
| ------------------ | ------------------------ | ---------------------- |
| Componente         | PascalCase               | `MonthPicker.tsx`      |
| Tela               | PascalCase + `Screen`    | `NovaCompraScreen.tsx` |
| Repositório        | camelCase + `Repository` | `comprasRepository.ts` |
| Hook               | `use` + PascalCase       | `useComprasStore.ts`   |
| Utilitário         | camelCase                | `currency.ts`          |
| Rota (Expo Router) | minúsculo, reflete a URL | `historico.tsx`        |

Prettier e ESLint resolvem o resto do estilo (`npm run lint:fix`).

---

# Testes

## Estratégia

**Jest** + **jest-expo**, com React Native Testing Library para componentes.

1. **Unitários** (maior volume), funções puras de `src/shared/`: moeda, datas, texto,
   totais, validação, e os interpretadores de cupom fiscal.
2. **Integração**, a store operando contra SQLite real, cobrindo criar → listar → editar →
   excluir e as agregações refletindo a mudança.
3. **Componente** (menor volume, mais caros de manter), interação de tela.

Não há testes end-to-end previstos por enquanto.

## O que tem prioridade

| Área                                       | Por quê                                       |
| ------------------------------------------ | --------------------------------------------- |
| `calcularTotal` e subtotais                | erro aqui é silencioso e financeiro           |
| `getComparativoMercados`, `getGastoPorMes` | agregação SQL quebra fácil numa migração      |
| `novaCompraFormSchema` (Zod)               | impede dado inválido de chegar ao banco       |
| Importação de backup                       | arquivo malformado não pode corromper o banco |
| Interpretação do cupom fiscal              | depende de HTML de terceiro; quebra sem aviso |
| `monthLabel`, `parseMonthValue`            | bug aqui quebra filtros e exibição em cascata |

## Convenções

- Teste ao lado do código: `arquivo.ts` → `arquivo.test.ts`.
- Testes de banco usam `resetDbInstanceForTests()` no `beforeEach` para isolar cada caso.
- Sem mock do `expo-sqlite`: testamos contra o banco real. Mais lento, porém confiável para
  uma camada de persistência.

---

## Antes de abrir o Pull Request

Rode localmente e confirme que passam:

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

### Checklist

- [ ] Caminho feliz coberto por teste automatizado
- [ ] Pelo menos um caso de borda coberto (valor negativo, campo vazio, arquivo inválido)
- [ ] `lint` e `typecheck` sem aviso novo
- [ ] **Testado em aparelho ou emulador**, compilar não é o mesmo que funcionar
- [ ] Testado nos temas claro e escuro
- [ ] Sem `console.log` esquecido (permitidos `console.warn` e `console.error`)
- [ ] Documentação atualizada quando a mudança afeta estrutura ou comportamento
- [ ] `CHANGELOG.md` atualizado na seção `[Não lançado]`

## Abrindo o Pull Request

Descreva **o que** muda e **por quê**, e inclua captura de tela quando a mudança for visual.
O template de PR já traz a estrutura esperada.

## Reportando bugs ou sugerindo funcionalidades

Use os templates de issue. Para bug, inclua passos para reproduzir, o que esperava e o que
aconteceu. Dúvidas: veja [SUPPORT.md](./SUPPORT.md).
