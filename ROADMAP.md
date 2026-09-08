# Roadmap

Este roadmap organiza o projeto em marcos incrementais. Cada marco deve ser utilizável
sozinho — não dependemos de "terminar tudo" para ter valor entregue.

## MVP — mínimo utilizável (Fases 1 a 3, já entregues)

Objetivo: alguém consegue registrar compras reais e ver se está economizando.

- [x] Registrar compra (mês, mercado, itens, quantidade, valor unitário)
- [x] Histórico com edição e exclusão
- [x] Resumo: gasto por mês + comparação de supermercados
- [x] Catálogo de itens com sugestão automática
- [x] Persistência local (SQLite), 100% offline
- [x] Exportar dados (JSON/CSV/PDF) e importar backup

## V1 — pronto para uso diário e para portfólio (Fases 4 a 6)

Objetivo: o projeto é publicável no GitHub como peça de portfólio e confortável de usar no
dia a dia.

- [x] Documentação open source completa (README, CONTRIBUTING, etc. — Fase 4)
- [x] CI/CD (lint, typecheck, testes automáticos a cada push/PR — Fase 5)
- [x] Identidade de marca definitiva: nome, logo, ícone do app (Fase 6 — ver [BRANDING.md](./BRANDING.md))
- [ ] Testes automatizados cobrindo os repositórios de storage e a store (ver [TESTPLAN.md](./TESTPLAN.md))
- [ ] Onboarding na primeira abertura do app (explicação rápida das 4 abas)
- [ ] Empty states e loading states revisados em todas as telas
- [x] Configuração de build de teste (Expo/EAS) para instalação fora do Expo Go — falta só rodar (ver [PUBLICACAO.md](./PUBLICACAO.md))

## V2 — funcionalidades que agregam além do essencial

- [ ] Edição em lote (marcar vários itens como comprados de uma vez)
- [ ] Gráfico de evolução de preço por item específico ao longo do tempo
- [ ] Metas de gasto mensal com alerta ao se aproximar do limite
- [ ] Múltiplas listas/perfis (ex.: "casa" e "trabalho")
- [ ] Widget de tela inicial (Android/iOS) com o gasto do mês
- [ ] Backup automático periódico (sem precisar exportar manualmente)

## V3 — expansão de longo prazo

- [ ] Sincronização opcional entre dispositivos (ex.: via arquivo em nuvem do próprio
      usuário — Google Drive/iCloud —, mantendo o app sem backend próprio)
- [ ] Leitura de nota fiscal (OCR/QR code) para preencher itens automaticamente
- [ ] Sugestão de qual mercado visitar com base no histórico de preços por item
- [ ] Modo compartilhado (duas pessoas da mesma casa registrando na mesma lista)
- [ ] Internacionalização (moeda e idioma configuráveis)

## Fora de escopo (por enquanto)

- Autenticação/contas de usuário — o app é local-first por design; adicionar contas mudaria
  a proposta de "sem backend, sem dado saindo do aparelho".
- Marketplace ou integração com apps de supermercado — foge do propósito de controle pessoal
  de gastos.

Veja o backlog priorizado (MoSCoW) para o que entra em cada marco em [BACKLOG.md](./BACKLOG.md).
