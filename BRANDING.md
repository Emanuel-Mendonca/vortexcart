# Identidade de Marca — Vortex Cart

## Nome

**Vortex Cart**

- **Vortex** (vórtice): remete a atração, movimento circular, algo "puxando" pra dentro —
  aqui, a ideia de que suas compras espalhadas em vários mercados são puxadas para um único
  lugar organizado, e que o app "sug a" o desperdício do seu orçamento.
- **Cart** (carrinho): imediatamente reconhecível como compras/mercado, em inglês — mantém o
  nome curto, internacional e fácil de pronunciar, sem perder clareza do propósito do app.
- Pronúncia simples em português e inglês, funciona bem como wordmark curto para ícone de
  app (cabe em poucos caracteres em qualquer launcher).

## Conceito do símbolo

Um vórtice de três braços em espiral, girando em torno de um núcleo central sólido.

- **Os três braços em espiral** representam os três eixos que o app organiza: itens,
  supermercados e meses — três dimensões diferentes de uma mesma compra, giram e convergem
  para um centro comum.
- **O núcleo central** é o "resultado": o total consolidado, o resumo que sobra depois de
  organizar a bagunça das notas fiscais espalhadas.
- O movimento circular também sugere o ciclo mensal de compras — cada mês, o vórtice "gira"
  de novo.

## Cores

Reaproveita a paleta já definida em `src/theme/tokens.ts` — não criamos cores novas para a
marca, a marca usa o sistema de design do produto:

| Uso | Cor | Hex |
|---|---|---|
| Vórtice (traço principal) | Lima | `#D8F33D` |
| Fundo do ícone / superfície de marca | Roxo | `#4F1FFF` |
| Núcleo / texto de apoio | Preto | `#000000` |
| Fundo alternativo (splash, telas escuras) | Preto | `#000000`, vórtice em roxo, núcleo em lima |

## Variações

1. **Ícone do app** (`src/assets/icon.png`): fundo roxo sólido, vórtice em lima, núcleo preto
   — máximo contraste para launcher de celular.
2. **Ícone adaptativo Android** (`src/assets/adaptive-icon.png`): só o vórtice, sem fundo
   (transparente), para compor com a máscara adaptativa do Android.
3. **Splash screen** (`src/assets/splash.png`): fundo preto, vórtice em roxo, núcleo em lima —
   inverte o contraste do ícone para diferenciar o momento de abertura do app.
4. **Monocromático** (para favicon, contextos de 1 cor, ou impressão em P&B): vórtice e
   núcleo em preto sobre fundo branco, ou branco sobre preto.
5. **Wordmark**: "Vortex Cart" em Raleway ExtraBold, com a palavra "Cart" destacada em lima
   sobre fundo roxo (mesmo padrão visual já usado no cabeçalho da versão web).

Os arquivos atuais em `src/assets/` são a versão **placeholder** gerada
programaticamente (formas geométricas simples) — funcionais para o app rodar e testar hoje,
mas a versão definitiva do ícone deve ser desenhada por um designer ou gerada a partir do
prompt abaixo e refinada manualmente (vetorizada, com prumo e proporções ajustados à mão).

## Prompt para geração por IA (ponto de partida, não produto final)

```
Minimalist app icon logo, a spiral vortex made of three curved swirling arms converging
into a solid circular core at the center, flat vector design, bold geometric shapes, no
gradients, no drop shadows, colors: electric purple background (#4F1FFF), lime green
spiral arms (#D8F33D), black core circle (#000000), centered composition, high contrast,
clean edges, scalable icon style similar to modern fintech and productivity apps
(Linear, Arc Browser, Stripe), square 1:1 aspect ratio, no text, no letters
```

Ajustes úteis a pedir em iterações seguintes: "fewer spiral arms", "thicker/thinner arm
stroke", "more rounded terminals on the spiral arms", "less negative space around the mark".

## Atualização do roadmap

Este documento resolve o item "Nome, logo e ícone do app" listado como **Must have** no
[BACKLOG.md](./BACKLOG.md) e marcado no [ROADMAP.md](./ROADMAP.md) (V1) — os assets finais
(ícone vetorial produzido/revisado por um designer) continuam como acompanhamento aberto,
mas o nome, conceito e paleta já estão definitivos e aplicados em todo o app.
