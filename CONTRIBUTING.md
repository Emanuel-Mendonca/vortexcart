# Contribuindo com o Controle da Compra

Obrigado pelo interesse em contribuir! Este documento explica o fluxo esperado.

## Antes de começar

1. Verifique se já não existe uma issue ou PR sobre o que você quer fazer.
2. Para mudanças grandes, abra uma issue primeiro para alinhar a abordagem antes de codar.
3. Leia o [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Ambiente de desenvolvimento

Siga o [IMPLEMENTACAO.md](./IMPLEMENTACAO.md) para instalar dependências e rodar o projeto localmente.

## Fluxo de branches

Usamos um Git Flow simplificado (detalhado no `IMPLEMENTACAO.md`, seção 8):

- `main` — estável, nunca recebe commit direto.
- `develop` — integração das features.
- `feature/<nome>`, `fix/<nome>` — a partir de `develop`.
- `hotfix/<nome>` — a partir de `main`, para correções urgentes.

```bash
git checkout develop
git pull
git checkout -b feature/minha-mudanca
```

## Padrão de commits

Este repositório usa [Conventional Commits](https://www.conventionalcommits.org/), validado automaticamente pelo Husky + Commitlint a cada commit:

```
feat(escopo): descrição no imperativo
fix(escopo): descrição no imperativo
docs: descrição
chore: descrição
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Antes de abrir o Pull Request

Rode localmente:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
```

O `pre-commit` hook já roda lint + format nos arquivos alterados automaticamente, mas rodar tudo manualmente antes do PR evita surpresas.

### Checklist de qualidade (Definition of Done)

Antes de marcar uma funcionalidade como concluída, confira:

- [ ] O código segue os padrões do [STYLEGUIDE.md](./STYLEGUIDE.md)
- [ ] Tipos TypeScript sem `any` desnecessário (`npm run typecheck` passa)
- [ ] ESLint e Prettier sem erros (`npm run lint` e `npm run format:check` passam)
- [ ] Testes relevantes adicionados/atualizados — veja o [TESTPLAN.md](./TESTPLAN.md)
- [ ] Testado manualmente em pelo menos uma plataforma (Android, iOS ou web)
- [ ] Nenhuma sensação de "quebra" visual nos temas claro e escuro
- [ ] Commits seguem Conventional Commits
- [ ] `CHANGELOG.md` atualizado, se a mudança for visível ao usuário

## Abrindo o Pull Request

- Use o template de PR (preenchido automaticamente).
- Descreva o "porquê", não só o "o quê" — links para a issue relacionada ajudam.
- PRs pequenos e focados são revisados mais rápido que PRs grandes e genéricos.

## Reportando bugs ou sugerindo funcionalidades

Use os templates de issue disponíveis ao clicar em "New Issue" no GitHub (bug report ou feature request).

## Dúvidas

Veja o [SUPPORT.md](./SUPPORT.md) para onde perguntar.
