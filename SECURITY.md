# Política de Segurança

## Contexto do projeto

O Controle da Compra é um app **100% offline**: não há backend, não há autenticação, e
nenhum dado do usuário é transmitido pela rede. Os dados ficam apenas no banco SQLite
local do dispositivo. Isso reduz bastante a superfície de ataque, mas ainda vale reportar
problemas de segurança que você encontrar (ex.: vulnerabilidades em dependências,
problemas na exportação/importação de arquivos, etc.).

## Versões suportadas

| Versão | Suportada |
|---|---|
| 0.x (atual) | ✅ |

Enquanto o projeto estiver em `0.x` (pré-1.0), apenas a versão mais recente recebe correções
de segurança.

## Reportando uma vulnerabilidade

**Não abra uma issue pública para vulnerabilidades de segurança.**

Em vez disso:

1. Use a aba **Security → Report a vulnerability** do GitHub (Security Advisories), se
   disponível no repositório, ou
2. Entre em contato diretamente com os mantenedores listados em
   [.github/CODEOWNERS](.github/CODEOWNERS).

Inclua na sua mensagem:

- Descrição do problema e possível impacto
- Passos para reproduzir
- Versão do app/commit afetado

Você pode esperar uma resposta inicial em até 7 dias. Vamos manter você atualizado sobre o
progresso da correção.

## Boas práticas seguidas no projeto

- Dependências gerenciadas via `package-lock.json`, com Dependabot habilitado para alertas
  e atualizações automáticas (veja `.github/dependabot.yml`) e CodeQL rodando semanalmente
  e em cada PR (`.github/workflows/codeql.yml`).
- Nenhum segredo, chave de API ou credencial é usado ou armazenado pelo app.
- A importação de backup valida o arquivo com um schema Zod antes de gravar qualquer dado
  no banco (`src/services/exportSchema.ts`), para reduzir risco de dados malformados.
