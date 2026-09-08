# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto
segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Planejado
- Naming definitivo, logo e refinamento de tema (Fase 6)

### Adicionado (Fase 4 — Documentação)
- README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, ROADMAP, BACKLOG (MoSCoW),
  TESTPLAN, ARCHITECTURE, STYLEGUIDE, SUPPORT
- Templates de issue/PR, CODEOWNERS e FUNDING.yml

### Adicionado (Fase 5 — CI/CD e qualidade)
- GitHub Actions: `ci.yml` (lint, typecheck, testes), `release.yml` (releases automáticas
  por tag), `codeql.yml` (análise de segurança semanal)
- Dependabot para npm e GitHub Actions
- Configuração do VS Code (`settings`, `tasks`, `launch`, `extensions`)
- `jest.config.js` e primeiros testes unitários reais (moeda, datas, cálculo de total)

### Corrigido (encontrado ao instalar e rodar de verdade — não só checagem estática)
- `src/theme/theme.ts` e `tokens.ts`: tipo `Theme.colors` estava travado nos valores literais
  do tema claro, rejeitando o tema escuro no `tsc`; corrigido com uma interface `ColorPalette`
  explícita
- `src/services/importService.ts`: acesso a `resultado.assets[0]` sem checar `undefined`
- `calcularTotal` extraído de `storage/comprasRepository.ts` para `utils/totals.ts`, uma
  função pura, para poder ser testada sem depender do `expo-sqlite`
- `eslint-import-resolver-typescript` fixado na versão `3.6.1` — versões mais novas conflitam
  de peer dependency com o restante do ecossistema Expo/typescript-eslint 7.x
- `@types/jest` adicionado (faltava para o `tsc` reconhecer `describe`/`it`/`expect`)

## [0.1.0] — Fase 1 a 3

### Adicionado
- Scaffold do projeto: Expo + TypeScript + Expo Router, ESLint/Prettier/Husky/Commitlint
- Design tokens e tema claro/escuro (paleta roxo `#4F1FFF` / lima `#D8F33D` / preto,
  tipografia Raleway)
- Banco de dados SQLite local com schema relacional (mercados, compras, itens, catálogo)
- Store Zustand orquestrando toda a persistência
- 4 telas: Nova Compra, Histórico, Resumo, Itens — com navegação em abas
- Formulário de nova compra com React Hook Form + validação Zod
- Comparação de supermercados pelo valor médio por compra, com selo de "mais econômico"
- Exportação de dados em JSON, CSV e PDF, com compartilhamento nativo
- Importação de backup JSON (aditiva, não destrutiva)
- Guia de implementação e publicação no GitHub (`IMPLEMENTACAO.md`)

[Não lançado]: https://github.com/Emanuel-Mendonca/vortexcart/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Emanuel-Mendonca/vortexcart/releases/tag/v0.1.0
