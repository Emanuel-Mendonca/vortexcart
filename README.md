# Vortex Cart

<p align="center">
  <em>App mobile para registrar suas compras de mercado, item por item, e descobrir em qual supermercado o seu dinheiro rende mais.</em>
</p>

<p align="center">
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo-SDK%2051-000020?logo=expo&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-4F1FFF">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-D8F33D">
</p>

---

## Sobre

O Vortex Cart nasceu de uma planilha Excel usada para acompanhar os gastos do mercado de casa (o mesmo conceito por trás do "Controle da Compra", a versão web deste projeto). Este app é a versão mobile nativa dessa ideia: registra o que foi comprado, em qual mercado, por quanto — e ajuda a enxergar em qual supermercado o dinheiro rende mais, mês a mês.

100% offline: os dados ficam no seu aparelho, em um banco SQLite local. Nada é enviado para servidor nenhum.

## Capturas de tela

> _Screenshots reais entram aqui assim que o app rodar em um dispositivo/emulador — por enquanto, os placeholders abaixo marcam onde cada uma vai._

| Nova Compra | Histórico |
|---|---|
| `docs/screenshots/nova-compra.png` | `docs/screenshots/historico.png` |

| Resumo | Itens |
|---|---|
| `docs/screenshots/resumo.png` | `docs/screenshots/itens.png` |

## Funcionalidades

- **Nova Compra** — registra mês, supermercado e itens (nome, quantidade, valor unitário), com subtotal e total calculados automaticamente.
- **Histórico** — compras agrupadas por mês, com filtro por mês/mercado, edição e exclusão.
- **Resumo** — gasto total por mês (gráfico de barras) e ranking de supermercados pelo valor médio por compra, com selo de "mais econômico".
- **Itens** — catálogo de produtos usados como sugestão automática ao registrar uma compra.
- **Exportação** — JSON (backup completo), CSV (para planilhas) e PDF (relatório), todos com compartilhamento nativo do sistema.
- **Importação** — restaura um backup JSON, somando aos dados existentes (não substitui nem apaga nada).
- **Tema claro/escuro** — segue a preferência do sistema.

## Tecnologias

| Camada | Escolha | Por quê (resumo — detalhes em [ARCHITECTURE.md](./ARCHITECTURE.md)) |
|---|---|---|
| Framework | React Native + Expo (SDK 51) | Managed workflow, sem necessidade de configuração nativa manual |
| Linguagem | TypeScript (strict) | Segurança de tipos em todo o domínio de dados |
| Navegação | Expo Router | Roteamento baseado em arquivos, menos boilerplate |
| Estado | Zustand | Simples e suficiente para um app 100% offline (sem cache de servidor) |
| Persistência | expo-sqlite | Consultas relacionais (SUM/AVG/GROUP BY) para os relatórios de gasto |
| Formulários | React Hook Form + Zod | Validação tipada e performática |
| Exportação | expo-file-system, expo-sharing, expo-print, expo-document-picker | Geração e compartilhamento de JSON/CSV/PDF, e importação de backup |
| Qualidade | ESLint, Prettier, Husky, lint-staged, Commitlint | Consistência de código e commits |

## Instalação

Pré-requisitos: Node.js 18+, npm, Git, e o app **Expo Go** no celular (ou um emulador Android/simulador iOS configurado).

```bash
git clone https://github.com/Emanuel-Mendonca/vortexcart.git
cd vortex-cart
npm install
```

## Como executar

```bash
npx expo start
```

Escaneie o QR code com o Expo Go (Android) ou a câmera (iOS), ou pressione `a`/`i`/`w` no terminal para abrir no emulador Android, simulador iOS, ou navegador.

Guia completo, incluindo Git e GitHub, em [IMPLEMENTACAO.md](./IMPLEMENTACAO.md). Para subir o
projeto para o GitHub em commits organizados, publicar a landing page e gerar um build
instalável (sem depender do Expo Go), veja [PUBLICACAO.md](./PUBLICACAO.md).

## Estrutura do projeto

```
app/            rotas (Expo Router) — telas montadas a partir de src/screens
src/
  components/   componentes de UI reutilizáveis
  screens/      as 4 telas do app
  storage/      camada SQLite (schema + repositórios)
  services/     exportação/importação de dados
  store/        estado global (Zustand)
  theme/        design tokens e tema claro/escuro
  types/        tipos de domínio
  utils/        formatação, datas, validação (Zod)
```

Detalhes de arquitetura e decisões técnicas em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Identidade de marca

Nome, conceito do símbolo, paleta e variações do logo em [BRANDING.md](./BRANDING.md).

## Roadmap

Veja o plano completo (MVP → V1 → V2 → V3) em [ROADMAP.md](./ROADMAP.md) e o backlog priorizado (MoSCoW) em [BACKLOG.md](./BACKLOG.md).

## Como contribuir

Contribuições são bem-vindas! Leia o [CONTRIBUTING.md](./CONTRIBUTING.md) para o fluxo de branches, padrão de commits e checklist de qualidade, e o [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) antes de participar.

## Segurança

Para reportar uma vulnerabilidade, siga as instruções em [SECURITY.md](./SECURITY.md) — não abra uma issue pública.

## Licença

Distribuído sob a licença MIT — veja [LICENSE](./LICENSE).

## Autores

- Você! (preencha aqui quando publicar)

## Agradecimentos

- À comunidade Expo/React Native pela documentação e ferramentas open source usadas neste projeto.
