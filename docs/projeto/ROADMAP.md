# Roadmap

Marcos incrementais, cada um utilizável sozinho, não dependemos de "terminar tudo" para
ter valor entregue. A prioridade de cada item pendente está marcada como
**Must** (bloqueia o marco), **Should** (importante, não bloqueia) ou **Could** (se sobrar
tempo).

## MVP, entregue

Alguém consegue registrar compras reais e ver onde está economizando.

- [x] Registrar compra: mês, mercado, itens com quantidade e valor
- [x] Histórico com edição e exclusão
- [x] Resumo: gasto por mês e comparação de supermercados
- [x] Catálogo de itens com sugestão automática
- [x] Persistência local em SQLite
- [x] Exportar em JSON, CSV e PDF; importar backup JSON

## V1, uso diário e portfólio

- [x] Documentação open source completa
- [x] CI/CD: lint, typecheck e testes a cada push/PR
- [x] Identidade de marca: nome, logo e ícone (ver [BRANDING.md](./BRANDING.md))
- [x] Build de teste configurado (`eas.json` com perfis dev/preview/production)
- [x] Onboarding em 3 etapas na primeira abertura
- [x] Tela de abertura animada com progresso real de carregamento
- [ ] **Must**, Testes cobrindo os repositórios SQLite e a store. É a camada com maior
      risco de regressão silenciosa: um erro em cálculo de total ou agregação passa
      despercebido. Hoje a cobertura se concentra em `src/shared/`.
- [ ] **Must**, Atualizar as capturas de tela. As atuais são anteriores ao redesign e não
      mostram a aba Cupom nem as formas de pagamento.
- [ ] **Should**, Exercitar exportação e importação em aparelho real. Nunca foram testadas
      desde a migração para o SDK 57.
- [ ] **Should**, Revisar empty states e loading states em todas as telas
- [ ] **Should**, Rodar `eas build` de fato, com uma conta Expo
- [ ] **Could**, Dependabot e CodeQL revisados periodicamente

## V2, entregue fora da ordem prevista

Estes itens estavam planejados para marcos posteriores e foram antecipados:

- [x] **Leitura do cupom fiscal por QR Code** (NFC-e, Minas Gerais), preenche a compra a
      partir da nota. Estava previsto como V3.
- [x] Formas de pagamento cadastráveis (débito, crédito, vale refeição)
- [x] Catálogo organizado em 15 departamentos de supermercado
- [x] Preço médio por item, calculado do histórico real
- [x] Reconhecimento de item do catálogo ao ler o cupom, evitando duplicatas

## V2, pendente

- [ ] **Should**, Migrar `expo-file-system` da API `legacy` para a atual. Dívida técnica
      assumida na migração do SDK 57: a API legada funciona, mas será removida.
- [ ] **Could**, Gráfico de evolução de preço por item ao longo do tempo
- [ ] **Could**, Projeção de gasto do mês a partir da média dos anteriores. Cálculo
      simples sobre dado real, sem IA, se implementado, deve ser chamado de projeção e
      mostrar a base do cálculo.
- [ ] **Could**, Metas de gasto mensal com alerta ao se aproximar do limite
- [ ] **Could**, Edição em lote de itens
- [ ] **Could**, Múltiplas listas ou perfis (ex.: "casa" e "trabalho")
- [ ] **Could**, Widget de tela inicial com o gasto do mês

## V3, longo prazo

- [ ] Leitura de cupom em outros estados. Cada UF tem portal e HTML próprios; hoje só MG.
- [ ] Sincronização opcional via arquivo em nuvem do próprio usuário (Drive/iCloud),
      mantendo o app sem backend próprio
- [ ] Sugestão de qual mercado visitar, com base no histórico de preços por item
- [ ] Modo compartilhado entre duas pessoas da mesma casa
- [ ] Internacionalização de moeda e idioma

## Fora de escopo

| Item                                               | Motivo                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Autenticação e contas de usuário                   | Contraria a proposta local-first; adicionar contas mudaria o produto                                 |
| Sincronização em nuvem com backend próprio         | Custo de servidor e manutenção incompatíveis com um projeto de portfólio                             |
| Marketplace ou integração com apps de supermercado | Foge do propósito de controle pessoal de gastos                                                      |
| Previsão de preços por IA                          | O app não tem dado nem infraestrutura para isso, e anunciar previsão sem cálculo real seria enganoso |

## Como este documento é mantido

Revisado a cada marco concluído. Itens que mudam de prioridade ou saem do escopo são
atualizados aqui, e a mudança relevante é registrada no
[CHANGELOG.md](../../CHANGELOG.md).
