# Plano de Testes

## Estratégia

O projeto usa **Jest** + **jest-expo** como test runner, e **React Native Testing Library**
para testes de componentes/telas. A pirâmide de testes priorizada:

1. **Testes unitários** (maior volume) — funções puras: `src/utils/*`, cálculo de totais em
   `src/storage/comprasRepository.ts`, agregações em `src/storage/resumoRepository.ts`.
2. **Testes de integração** — store Zustand (`useComprasStore`) operando contra um banco
   SQLite real (em memória / arquivo temporário), cobrindo o fluxo completo: criar → listar
   → editar → excluir → agregações refletindo a mudança.
3. **Testes de componente** (menor volume, os mais caros de manter) — comportamento de tela
   com interações simuladas (ex.: preencher o formulário de Nova Compra e validar erros).

Não há testes end-to-end (Detox/Maestro) previstos por enquanto — reavaliar quando houver
build de EAS estável (ver [ROADMAP.md](./ROADMAP.md), V1).

## O que testar prioritariamente

| Área | Por quê é prioridade |
|---|---|
| `calcularTotal` / subtotais (quantidade × valor unitário) | Erro aqui é o pior tipo: silencioso e financeiro |
| `getComparativoMercados` / `getGastoPorMes` | Lógica de agregação SQL é fácil de quebrar em uma migration futura |
| `novaCompraFormSchema` (Zod) | Garante que dados inválidos nunca cheguem ao banco |
| `exportPayloadSchema` / importação | Um backup malformado não pode corromper o banco do usuário |
| `monthLabel` / `parseMonthValue` / `buildMonthValue` | Bug aqui quebra filtros e exibição em cascata |

## Convenções

- Arquivos de teste ao lado do código: `arquivo.ts` → `arquivo.test.ts`.
- Testes de banco usam `resetDbInstanceForTests()` (`src/storage/db.ts`) no `beforeEach` para
  isolar cada caso.
- Sem mocks do `expo-sqlite` em si — testamos contra o banco real (mais lento, porém mais
  confiável para uma camada de persistência).

## Rodando os testes

```bash
npm test              # roda tudo uma vez
npm run test:watch    # modo watch, útil durante o desenvolvimento
npm run test:coverage # relatório de cobertura
```

## Definition of Done (checklist por funcionalidade)

Antes de considerar qualquer funcionalidade "pronta", confirme:

- [ ] Caminho feliz coberto por teste automatizado
- [ ] Pelo menos um caso de erro/borda coberto (valor negativo, campo vazio, arquivo inválido etc.)
- [ ] `npm run typecheck` e `npm run lint` passam sem warnings novos
- [ ] Testado manualmente no dispositivo/emulador (não só "parece funcionar" pelo código)
- [ ] Testado nos temas claro e escuro
- [ ] Sem `console.log` esquecido (o ESLint já avisa, mas confira)
- [ ] Documentação relevante atualizada (`README.md`, `CHANGELOG.md`, ou `ARCHITECTURE.md`
      se a mudança afeta a estrutura)

Esta checklist complementa (não substitui) a checklist de Pull Request do
[CONTRIBUTING.md](./CONTRIBUTING.md).
