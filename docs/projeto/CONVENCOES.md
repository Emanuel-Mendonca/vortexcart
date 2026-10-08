# Convenções do projeto

As regras que este projeto segue. Servem para o código continuar coerente ao longo do
tempo, mesmo com meses de intervalo entre uma sessão de trabalho e outra.

Para instalar e rodar, veja o [GUIA.md](./GUIA.md).

## Fluxo de trabalho

Projeto de um desenvolvedor só, então sem cerimônia de Pull Request:

- `main`, o que funciona
- `feature/<nome>`, para mudança grande o bastante que valha poder abandonar

Mudança pequena vai direto na `main`. Mudança que mexe em schema de banco, dependência ou
estrutura de pastas merece branch, porque voltar atrás fica fácil.

Antes de qualquer alteração em schema ou dependência: **exporte um backup em JSON pelo
app**. O banco fica no aparelho, e migração malfeita não tem desfazer.

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

## Versões de dependência

Quem manda nas versões é o **Expo**, não o Dependabot. Para atualizar:

```bash
npx expo install --fix
```

```bash
npx expo install --check
```

Subir `react`, `react-native`, `reanimated` ou similares por fora rompe a combinação que o
SDK valida. O Dependabot está configurado para não propor atualização de npm por isso.

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
[ARCHITECTURE.md](./ARCHITECTURE.md).

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

## Antes de dar por pronto

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
- [ ] **Testado no aparelho** com o APK instalado. Compilar não é o mesmo que funcionar:
      quase todo defeito encontrado neste projeto passou pelo lint e pelo typecheck antes
      de aparecer na tela.
- [ ] Testado nos temas claro e escuro
- [ ] Sem `console.log` esquecido (permitidos `console.warn` e `console.error`)
- [ ] Documentação atualizada quando a mudança afeta estrutura ou comportamento
- [ ] `CHANGELOG.md` atualizado na seção `[Não lançado]`
