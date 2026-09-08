# Guia de Implementação — do scaffold ao GitHub

Este documento assume que você já tem os arquivos da **Fase 1** (config + design tokens + tipos) e o entry point mínimo (`app/_layout.tsx`, `app/index.tsx`) que permite o projeto rodar. Ele cobre: preparar o ambiente, rodar o app localmente, e todo o fluxo de Git/GitHub até a primeira release.

---

## 1. Pré-requisitos

Instale antes de começar:

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| Node.js (LTS) | 18.x | `node -v` |
| npm | 9.x (vem com o Node) | `npm -v` |
| Git | qualquer recente | `git --version` |
| Expo Go (app no celular) | — | App Store / Play Store |
| Watchman (só macOS) | recente | `watchman -v` |

Android Studio (emulador Android) e Xcode (simulador iOS, só macOS) são opcionais — rodar no Expo Go pelo celular já é suficiente para desenvolver.

---

## 2. Organizar os arquivos do projeto

Crie a pasta do projeto e coloque dentro dela todos os arquivos entregues até agora, respeitando os caminhos (estrutura já com a Fase 2 — banco, store e telas):

```
vortex-cart/
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx        (Nova Compra)
│       ├── historico.tsx
│       ├── resumo.tsx
│       └── itens.tsx
├── src/
│   ├── assets/
│   │   ├── icon.png
│   │   ├── adaptive-icon.png
│   │   ├── splash.png
│   │   └── favicon.png
│   ├── components/
│   │   ├── Button.tsx, Card.tsx, TextField.tsx, Checkbox.tsx,
│   │   │   IconButton.tsx, Badge.tsx, EmptyState.tsx,
│   │   │   ConfirmModal.tsx, MonthPicker.tsx, index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── screens/
│   │   ├── NovaCompraScreen.tsx, HistoricoScreen.tsx,
│   │   │   ResumoScreen.tsx, ItensScreen.tsx, index.ts
│   ├── storage/
│   │   ├── db.ts, mercadosRepository.ts, catalogoRepository.ts,
│   │   │   comprasRepository.ts, resumoRepository.ts, index.ts
│   ├── store/
│   │   └── useComprasStore.ts
│   ├── theme/
│   │   ├── index.ts, theme.ts, tokens.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── currency.ts, date.ts, validation.ts
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── .prettierignore
├── .prettierrc
├── app.config.ts
├── babel.config.js
├── commitlint.config.js
├── package.json
└── tsconfig.json
```

> `components/`, `screens/`, `storage/`, `store/` e `utils/` já vêm preenchidos com a Fase 2. As pastas ainda vazias (`hooks/`, `contexts/`, `services/`, `navigation/`, `features/`) são reservadas para funcionalidades futuras (Fase 3 em diante) — mantenha o `.gitkeep` até usá-las.

---

## 3. Instalar dependências

Dentro da pasta do projeto:

```bash
npm install
```

Isso também dispara o script `prepare` do `package.json`, que ativa o Husky (`husky` sem argumentos, no Husky v9+). Se por algum motivo os hooks não ficarem executáveis, rode:

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

---

## 4. Rodar o projeto

```bash
npx expo start
```

Isso abre o Metro Bundler no terminal com um QR code. Opções:

- **Celular físico**: abra o app **Expo Go** e escaneie o QR code (Android) ou use a câmera nativa (iOS).
- **Emulador Android**: com o Android Studio configurado, pressione `a` no terminal do Expo.
- **Simulador iOS** (só macOS): pressione `i`.
- **Web**: pressione `w`, ou rode `npm run web`.

Se tudo estiver certo, você verá a tela provisória "Controle da Compra — Scaffold da Fase 1 rodando" com a fonte Raleway e as cores da marca (roxo/lima/preto).

### Scripts úteis já configurados

```bash
npm run lint          # ESLint
npm run lint:fix       # ESLint com correção automática
npm run format         # Prettier (escreve)
npm run format:check   # Prettier (só verifica)
npm run typecheck      # tsc --noEmit
npm test               # Jest (a partir da Fase 2, quando houver testes)
```

---

## 5. Git — inicializar o repositório local

```bash
git init
git add .
git commit -m "chore: scaffold inicial do projeto (fase 1)"
```

O `.gitignore` já está configurado para ignorar `node_modules/`, `.expo/`, builds nativos e arquivos de ambiente — não precisa mexer nele agora.

> A partir deste primeiro commit, o Husky já está ativo: toda vez que você commitar, `lint-staged` roda ESLint + Prettier nos arquivos alterados, e o `commitlint` valida se a mensagem segue Conventional Commits (mais sobre isso na seção 8).

---

## 6. Criar o repositório no GitHub

### Opção A — pelo site
1. Acesse [github.com/new](https://github.com/new).
2. Defina o nome do repositório (pode usar o placeholder por enquanto, ex.: `vortex-cart`, e renomear depois na Fase 6).
3. Deixe **Add a README**, **.gitignore** e **License** desmarcados — já temos tudo isso localmente.
4. Clique em **Create repository** e copie a URL exibida (HTTPS ou SSH).

### Opção B — pelo GitHub CLI
```bash
gh repo create vortex-cart --private --source=. --remote=origin
```
(troque `--private` por `--public` se quiser o repositório público desde já; o `--source=.` já conecta o remoto automaticamente, então pode pular a seção 7).

---

## 7. Conectar o remoto e enviar o primeiro push

```bash
git remote add origin https://github.com/Emanuel-Mendonca/vortexcart.git
git branch -M main
git push -u origin main
```

A partir daqui, `git push` sozinho já sabe para onde mandar.

---

## 8. Estratégia de branches (Git Flow simplificado)

Para um projeto de portfólio open source, um Git Flow enxuto funciona bem:

- **`main`** — sempre estável, reflete o que está "lançado". Nunca commitar direto aqui.
- **`develop`** — branch de integração, onde as features se juntam antes de ir pra `main`.
- **`feature/<nome>`** — uma branch por funcionalidade, criada a partir de `develop`.
- **`fix/<nome>`** — correções que não são urgentes, também a partir de `develop`.
- **`hotfix/<nome>`** — correção urgente direto em cima de `main`, depois mesclada em `main` **e** `develop`.
- **`release/x.y.z`** — opcional; usada só se quiser estabilizar uma versão antes de publicar (congelar features, só bugfix).

Fluxo típico de uma feature:

```bash
git checkout develop
git pull
git checkout -b feature/tela-nova-compra
# ... trabalha, commita ...
git push -u origin feature/tela-nova-compra
# abre Pull Request feature/tela-nova-compra -> develop no GitHub
```

Quando `develop` estiver estável e pronta para lançar:

```bash
git checkout main
git merge --no-ff develop
git push
```

Crie a branch `develop` agora, já que `main` sozinha também é um fluxo válido para o começo do projeto — mas com `develop` você já deixa o repositório com a estrutura certa para quando outros colaboradores entrarem:

```bash
git checkout -b develop
git push -u origin develop
```

> Dica: no GitHub, em **Settings → Branches**, configure `main` (e `develop`, se usar) como branches protegidas, exigindo Pull Request e status checks (isso vai valer a partir da Fase 5, quando o CI existir).

---

## 9. Conventional Commits

O `commitlint.config.js` já força esse padrão em todo commit (via hook `commit-msg`). Formato:

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>
```

Tipos aceitos (definidos em `commitlint.config.js`): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Exemplos:

```bash
git commit -m "feat(compras): adiciona tela de nova compra"
git commit -m "fix(storage): corrige soma de itens extras"
git commit -m "docs: atualiza guia de implementação"
git commit -m "chore: configura eslint e prettier"
```

Se a mensagem não seguir o padrão, o commit é rejeitado automaticamente pelo hook — é assim que o histórico fica limpo o suficiente para gerar changelog automático depois.

---

## 10. Versionamento Semântico (SemVer)

O projeto já nasce em `0.1.0` (`package.json`). A partir daí:

- **PATCH** (`0.1.1`) — correção de bug, sem mudar comportamento esperado.
- **MINOR** (`0.2.0`) — nova funcionalidade compatível com o que já existia.
- **MAJOR** (`1.0.0`) — mudança que quebra compatibilidade, ou o marco de "primeira versão estável/publicável".

Regra prática para este projeto: enquanto estiver em fase de scaffold/MVP (Fases 1 a 5 deste plano), fica em `0.x.y`. `1.0.0` só quando o app tiver as 4 telas, exportação de dados e estiver publicável nas lojas (ou pelo menos estável o bastante pra portfólio).

Atualize a versão com:

```bash
npm version patch   # ou minor / major
```

Isso já cria o commit e a tag `vX.Y.Z` automaticamente (o `npm version` faz `git commit` + `git tag` por padrão).

---

## 11. Tags e Releases no GitHub

Se preferir criar a tag manualmente (sem `npm version`):

```bash
git tag -a v0.1.0 -m "Fase 1: scaffold inicial (config, design tokens, tipos)"
git push origin v0.1.0
```

Depois, transforme a tag numa Release:

### Pelo site
**Releases → Draft a new release** → selecione a tag `v0.1.0` → escreva o resumo (o que entrou nessa versão) → **Publish release**.

### Pelo GitHub CLI
```bash
gh release create v0.1.0 --title "v0.1.0 — Scaffold inicial" \
  --notes "Config do projeto (Expo + TypeScript + ESLint/Prettier/Husky), design tokens e tipos de domínio."
```

Repita esse ciclo (branch → PR → merge → `npm version` → tag → release) a cada fase entregue.

---

## 12. Próximos passos

- **Fase 2**: banco SQLite, store Zustand, navegação real e as 4 telas — vai substituir `app/index.tsx` pela navegação em tabs de verdade.
- **Fase 5**: GitHub Actions (lint, typecheck, testes e build automáticos a cada push/PR) — quando existir, as branch protection rules da seção 8 passam a exigir esses checks passando antes do merge.

## Checklist rápido desta etapa

- [ ] Node, npm e Git instalados
- [ ] `npm install` rodou sem erro
- [ ] `npx expo start` abre o Metro e o app carrega no Expo Go
- [ ] `git init` + primeiro commit feito
- [ ] Repositório criado no GitHub
- [ ] `git push -u origin main` concluído
- [ ] Branch `develop` criada e enviada
- [ ] Primeiro commit segue Conventional Commits (o hook já garante isso)
- [ ] Tag `v0.1.0` criada e Release publicada
