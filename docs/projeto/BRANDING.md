# Identidade de Marca — Vortex Cart

## Nome

**Vortex Cart**

- **Vortex** (vórtice): remete a atração, movimento circular, algo "puxando" pra dentro —
  aqui, a ideia de que suas compras espalhadas em vários mercados são puxadas para um único
  lugar organizado, e que o app "suga" o desperdício do seu orçamento.
- **Cart** (carrinho): imediatamente reconhecível como compras/mercado, em inglês — mantém o
  nome curto, internacional e fácil de pronunciar, sem perder clareza do propósito do app.
- Pronúncia simples em português e inglês, funciona bem como wordmark curto para ícone de
  app (cabe em poucos caracteres em qualquer launcher).

## Conceito do símbolo

Um anel orbital com uma abertura (não é um círculo fechado) envolvendo um ícone de carrinho
de compras minimalista — esta é a **logo oficial adotada** para o app (não mais um
placeholder gerado por código).

- **O anel aberto** sugere órbita e movimento — o "vórtice" não é um objeto estático, é uma
  trajetória em andamento, sempre girando.
- **A abertura no anel** funciona como um portal/entrada — por onde as compras "entram" na
  órbita do app.
- **O carrinho no centro** é literal e direto: não deixa dúvida sobre do que o app trata,
  mesmo à distância ou em tamanho pequeno (favicon, ícone de launcher).
- A paleta clara (quase branca) sobre fundo noturno faz o símbolo funcionar como um "recibo
  luminoso" — a ideia de algo que se destaca no escuro, como uma constelação.

## Direção visual: atmosférica / cósmica / glassmorphism

A identidade evoluiu de um estilo flat/bold (blocos sólidos, bordas pretas grossas) para uma
linguagem **atmosférica**: superfícies translúcidas com desfoque (glassmorphism), glows
coloridos suaves ao fundo, anéis orbitais finos, e sombras com cor (em vez de sombra dura
preta). A ideia de "vórtice" ficou mais literal nessa direção — o círculo de anéis girando ao
redor do mockup do app na landing page é a representação direta do próprio símbolo da marca.

## Cores

Paleta derivada de um esquema Material Design 3 (tema escuro completo), com o tema claro
obtido a partir dos tokens `inverse-*`/`*-fixed*` do próprio M3 — não são cores soltas
inventadas à parte, e estão centralizadas em `src/ui/theme/tokens.ts`.

| Token                    | Uso                                 | Escuro (padrão)                          | Claro                                |
| ------------------------ | ----------------------------------- | ---------------------------------------- | ------------------------------------ |
| `primary`                | Vórtice, botões primários, glow     | Lavanda `#CCBFF7`                        | Roxo profundo `#625788`              |
| `accent`                 | Selos, destaques ("mais econômico") | Dourado `#D3C87C` (igual nos dois temas) | Dourado `#D3C87C`                    |
| `background`             | Fundo geral                         | Noturno `#10131B`                        | Branco `#FFFFFF`                     |
| `surface` / `surfaceAlt` | Cards, superfícies elevadas         | `#1D1F28` / `#272A32`                    | Branco / lavanda bem clara `#F3F0FA` |
| `text`                   | Texto principal                     | `#E1E2EE`                                | Roxo quase-preto `#1E1341`           |
| `border`                 | Bordas e contornos                  | `#938F99`                                | `#7A7290`                            |

O tema escuro é o principal — é nele que o glow do vórtice, os anéis orbitais e o
glassmorphism aparecem com mais força. O tema claro existe para acessibilidade/preferência do
sistema, mas a "assinatura" visual da marca vive no escuro.

## Variações

1. **Ícone do app** (`src/ui/assets/icon.png`): logo oficial (anel aberto + carrinho) em tom
   claro sobre fundo noturno, cantos arredondados — pronto para launcher de celular.
2. **Ícone adaptativo Android** (`src/ui/assets/adaptive-icon.png`): apenas o símbolo, sem
   fundo (transparente), extraído da logo oficial para compor com a máscara adaptativa do
   Android.
3. **Splash screen** (`src/ui/assets/splash.png`): mesmo símbolo, centralizado sobre fundo
   noturno em formato retrato.
4. **Monocromático** (favicon, impressão em P&B): a logo já funciona nativamente em uma cor
   só (claro sobre escuro) — é a sua forma padrão, sem necessidade de uma versão separada.
5. **Wordmark**: "Vortex Cart" em Raleway/Space Grotesk, com "Cart" destacado em lavanda,
   sobre fundo escuro translúcido (ver cabeçalho de `docs/index.html`).

Os arquivos em `src/ui/assets/` foram gerados automaticamente a partir da logo oficial
(recorte, remoção de fundo para a versão adaptativa, e recomposição para o splash) — já é a
versão definitiva para uso no app, não um placeholder.

## Prompt para geração por IA (para novas variações/composições futuras)

Caso precise gerar composições adicionais no mesmo estilo (banners, ilustrações, materiais de
divulgação) mantendo a linguagem visual da logo:

```
Minimalist app icon logo, an open circular ring (orbit-like, with a gap) encircling a simple
shopping cart glyph, thin rounded line strokes, light lavender-white color (#E4E5F1) on a
dark night background (#10131B), soft atmospheric glow allowed, centered composition,
clean geometric style similar to modern Material You / premium app icons, square 1:1
aspect ratio, no text, no letters
```

Ajustes úteis a pedir em iterações seguintes: "thicker/thinner ring stroke", "larger gap in
the ring", "add subtle glow", "different cart icon style (filled vs outline)".

## Atualização do roadmap

Este documento resolve o item "Nome, logo e ícone do app" listado como **Must have** no
[BACKLOG.md](./BACKLOG.md) e marcado no [ROADMAP.md](./ROADMAP.md) (V1) — nome, símbolo,
paleta e ícone final já estão definitivos e aplicados em todo o app e na landing page
(`docs/index.html`). Um SVG vetorial da logo (em vez do PNG atual) fica como possível
refinamento futuro, mas não bloqueia mais nada.
