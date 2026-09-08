# Guia de Publicação — Git, GitHub, App Instalável e Site

Este guia assume que a pasta do projeto já tem todos os arquivos das 6 fases (o
`IMPLEMENTACAO.md` cobre a instalação/execução local — comece por ele se ainda não rodou o
projeto). Aqui o foco é: **subir para o Git em commits organizados**, publicar a landing page,
e gerar um build instalável de verdade.

Todos os comandos abaixo são pra você rodar — a autoria de cada commit é sua.

---

## 1. Configurar sua identidade no Git (se ainda não tiver)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## 2. Inicializar o repositório

```bash
cd vortex-cart      # ou o nome da pasta onde você extraiu o projeto
git init
git branch -M main
```

O Husky vai tentar instalar os hooks automaticamente na próxima vez que você rodar
`npm install` (script `prepare`). Se quiser ativar agora que o `.git` já existe:

```bash
npm run prepare
```

---

## 3. Commits em etapas (histórico organizado por assunto)

A ideia aqui não é reconstruir a ordem cronológica exata em que cada arquivo foi criado, e
sim deixar um histórico **legível**, onde cada commit representa um assunto fechado. Rode os
blocos abaixo na ordem — cada `git add` seleciona só os arquivos daquele assunto.

### 3.1 — Scaffold e ferramentas

```bash
git add package.json package-lock.json tsconfig.json babel.config.js app.config.ts eas.json \
  .eslintrc.js .prettierrc .prettierignore .editorconfig .gitignore commitlint.config.js \
  jest.config.js .husky .vscode
git commit -m "chore: scaffold inicial do projeto (Expo + TypeScript + ferramentas de qualidade)"
```

### 3.2 — Identidade visual

```bash
git add src/theme src/constants src/assets BRANDING.md
git commit -m "feat(branding): design tokens, paleta e identidade visual do Vortex Cart"
```

### 3.3 — Tipos, utilitários e banco de dados

```bash
git add src/types src/utils src/storage
git commit -m "feat(storage): tipos de dominio, utilitarios e schema SQLite"
```

### 3.4 — Estado global

```bash
git add src/store
git commit -m "feat(store): estado global com Zustand"
```

### 3.5 — Interface e navegação

```bash
git add src/components src/screens app
git commit -m "feat(ui): componentes, telas e navegacao com Expo Router"
```

### 3.6 — Exportação e importação de dados

```bash
git add src/services
git commit -m "feat(export): exportacao e importacao de dados em JSON, CSV e PDF"
```

### 3.7 — Documentação open source

```bash
git add README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md CHANGELOG.md \
  ROADMAP.md BACKLOG.md TESTPLAN.md ARCHITECTURE.md STYLEGUIDE.md SUPPORT.md \
  IMPLEMENTACAO.md .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md \
  .github/CODEOWNERS .github/FUNDING.yml
git commit -m "docs: documentacao open source completa"
```

### 3.8 — CI/CD e qualidade contínua

```bash
git add .github/workflows/ci.yml .github/workflows/release.yml .github/workflows/codeql.yml \
  .github/dependabot.yml
git commit -m "ci: pipelines de lint, testes, release e analise de seguranca"
```

### 3.9 — Landing page e publicação web

```bash
git add docs .github/workflows/deploy-landing.yml PUBLICACAO.md
git commit -m "feat(web): landing page e publicacao automatica no GitHub Pages"
```

### Conferir o histórico

```bash
git log --oneline
```

Você deve ver 9 commits, cada um com um assunto claro.

---

## 4. Conectar ao repositório já criado e enviar

Seu repositório já existe e está vazio — não precisa criar nada no site, só conectar:

```bash
git remote add origin https://github.com/Emanuel-Mendonca/vortexcart.git
git push -u origin main
```

### Branch de integração (opcional, mas recomendado — ver IMPLEMENTACAO.md seção 8)
```bash
git checkout -b develop
git push -u origin develop
git checkout main
```

---

## 5. Publicar a landing page (GitHub Pages)

1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions** (não "Deploy from a
   branch" — o workflow `.github/workflows/deploy-landing.yml` já cuida disso).
3. Faça um push que toque a pasta `docs/` (o próprio commit da seção 3.9 já dispara) — ou
   rode manualmente em **Actions → Deploy da landing page → Run workflow**.
4. Em alguns minutos, o site fica disponível em
   `https://emanuel-mendonca.github.io/vortexcart/`.

> Os links do repositório (`README.md`, `docs/index.html`, `CHANGELOG.md`,
> `.github/ISSUE_TEMPLATE/config.yml`, `.github/CODEOWNERS`) já apontam para
> `github.com/Emanuel-Mendonca/vortexcart` — nada a trocar aqui.

---

## 6. Gerar um app instalável de verdade (sem depender do Expo Go)

O `eas.json` já está configurado com 3 perfis. Isso usa o **EAS Build**, serviço gratuito
(com limites) da própria Expo — precisa de uma conta.

```bash
npm install -g eas-cli   # ou use "npx eas-cli" sem instalar global
eas login                # cria conta em expo.dev se ainda não tiver
eas build:configure      # associa este projeto a um projectId da Expo
```

Depois, gere um APK Android instalável direto (mais rápido pra testar, não passa pela loja):

```bash
npm run build:preview:android
```

O terminal mostra um link quando o build termina — baixe o `.apk` direto no celular Android
e instale (pode precisar permitir "instalar de fontes desconhecidas" nas configurações do
Android). Para iOS, `npm run build:preview:ios` gera uma build de simulador (instalar num
iPhone físico exige conta paga da Apple Developer e um perfil de distribuição — fora do
escopo gratuito do EAS).

Quando quiser gerar a versão "de loja" (Google Play / App Store):

```bash
npm run build:production
```

> Isso ainda não *publica* nas lojas — só gera o artefato (`.aab`/`.ipa`). Publicar nas lojas
> exige contas de desenvolvedor pagas (Google Play: taxa única; Apple: anual) e está fora do
> escopo deste guia gratuito.

---

## 7. Tag e release da versão atual

Depois que tudo estiver no GitHub:

```bash
npm version minor   # 0.1.0 -> 0.2.0, já que esta entrega vai além do que o CHANGELOG 0.1.0 cobria
git push --follow-tags
```

Depois, transforme a tag em Release (site do GitHub, **Releases → Draft a new release**, ou
`gh release create v0.2.0 --generate-notes`).

---

## Checklist final

- [ ] `git log --oneline` mostra os 9 commits organizados por assunto
- [ ] Repositório conectado (`git remote add origin ...`) e `git push` concluído
- [ ] GitHub Pages configurado (Settings → Pages → Source: GitHub Actions)
- [ ] Landing page acessível em `https://emanuel-mendonca.github.io/vortexcart/`
- [ ] Conta Expo criada e `eas build:configure` rodado
- [ ] Primeiro build de preview gerado e instalado no celular
- [ ] Tag e Release publicados
