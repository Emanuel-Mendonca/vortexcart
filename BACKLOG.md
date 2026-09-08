# Backlog priorizado (MoSCoW)

Priorização usando **M**ust / **S**hould / **C**ould / **W**on't, para o próximo ciclo de
trabalho (V1, conforme o [ROADMAP.md](./ROADMAP.md)).

## Must have (indispensável para V1)

| Item | Motivo |
|---|---|
| CI/CD com lint + typecheck + testes no GitHub Actions | Sem isso, qualquer PR pode quebrar o projeto silenciosamente |
| Testes automatizados dos repositórios SQLite | É a camada mais arriscada de regressão silenciosa (cálculo de totais, agregações) |
| ~~Nome, logo e ícone definitivos~~ ✅ | Resolvido: "Vortex Cart" — ver [BRANDING.md](./BRANDING.md). Ícone final ainda precisa de refinamento por um designer/vetorização a partir do placeholder |
| ~~README com screenshots reais~~ ✅ | Resolvido — capturas reais em `docs/screenshots/` e na landing page |

## Should have (importante, mas não bloqueia o lançamento)

| Item | Motivo |
|---|---|
| Onboarding na primeira abertura | Melhora a experiência de quem nunca usou o app |
| Revisão de empty/loading states | Detalhe de polimento que afeta percepção de qualidade |
| ~~Build de teste via EAS~~ ✅ | `eas.json` configurado com perfis dev/preview/production — falta rodar `eas build` com uma conta Expo (ver PUBLICACAO.md) |
| Dependabot + CodeQL configurados | Segurança contínua de dependências, baixo custo de manter |

## Could have (bom ter, se sobrar tempo)

| Item | Motivo |
|---|---|
| Gráfico de evolução de preço por item | Valor real, mas não essencial pro caso de uso principal |
| Metas de gasto mensal | Funcionalidade nova, não corrige nem destrava nada existente |
| Múltiplas listas/perfis | Aumenta complexidade de dados sem necessidade comprovada ainda |
| Widget de tela inicial | Alto esforço (código nativo/config plugin) para ganho incerto |

## Won't have (fora do escopo por enquanto)

| Item | Motivo |
|---|---|
| Autenticação/contas de usuário | Contraria a proposta local-first, sem backend |
| Sincronização em nuvem própria | Exigiria backend e custo de manutenção incompatíveis com o escopo de portfólio |
| Marketplace/integração com supermercados | Foge do propósito de controle pessoal de gastos |

## Como este backlog é revisado

Este arquivo é revisado a cada marco do [ROADMAP.md](./ROADMAP.md) concluído — itens que
sobem de prioridade (Could → Should → Must) ou saem do escopo (Won't) são atualizados aqui,
com o motivo da mudança registrado no `CHANGELOG.md` quando relevante.
