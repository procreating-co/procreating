# Procreating OS — estado de execução (master prompt §1-87)

Documento de retomada. Se você é uma sessão nova retomando isto, comece por aqui antes de reler
o histórico inteiro — este arquivo é a fonte da verdade, não a memória de conversa de ninguém.

**Atualização mais recente**: Passo 1 itens 1 e 2 concluídos e implantados (janela configurável
+ RBAC mínimo). Item 3 (orquestrador de IA) e item 4 (Growth swipe) continuam **bloqueados** —
perguntei ao usuário como seguir; a resposta foi "trabalhar em outra coisa do backlog enquanto
isso". Duas coisas feitas nessa toada, ambas implantadas: batch actions na Lista de leads
(§71) e ajuste de contraste do tema dark (branco puro removido). Bloqueios em si não mudaram:
`ANTHROPIC_API_KEY` continua sem valor real em qualquer lugar (`.env.local`/Vercel), e a decisão
de escopo do RBAC na Home/Planejamento continua em aberto.

Escopo: só o Procreating OS (ERP interno — `app/(internal)/**`, `/admin`, `/clientes` etc.). O
site público/portfolio de clientes (`/clients/[client]/**`, `/p/[client]/**`) é escopo de uma
sessão diferente que compartilha este repositório — não misturar (ver `docs/roadmap.md`, que é
o roadmap DELA, não deste ERP).

## O que está feito (verificado com `npm run typecheck` + `npm run build` limpos)

- **P1** — auditoria técnica original, dados reais da empresa (Procreating, 2 sócios, 12
  clientes) semeados no banco, categoria de contrato (`recorrente_ativo`/`pontual_concluido`/
  `pontual_em_andamento`/`recorrente_churn`), correções de fluxo de caixa (MRR, receita mensal
  retroativa, `paid_at`).
- **P2** — Pipeline UX: cards compactos, drawer lateral, filtros persistentes, colunas sem
  scroll horizontal feio.
- **P3** — Quote Builder + catálogo de serviço.
- **Tema light "Warm Ivory" → v2** (accent roxo #635BFF, estilo Stripe) — paleta completa em
  `app/globals.css`, `.os-shell` light apenas (dark mode e `/admin`/`/clients` não tocados).
- **Rota `/meu-dia` → `/workspace`** — renomeação completa (pastas, componente `WorkspaceTasks`,
  todo lugar que referenciava o caminho antigo). Sidebar: "Meu Workspace" → "Workspace".
- **Edição de cliente e contrato** — antes só o status do cliente era editável; agora dá pra
  criar/editar contrato (valor, período, condições) e editar cadastro básico do cliente.
- **Quick Task Parser** (§49/§50) — "Editar vídeo amanhã às 15h" ↵ cria a tarefa certa, nos 3
  lugares que criam tarefa (Workspace, ⌘K, "+").
- **Growth Engine** (§31/§32) — simulador de Planejamento usa MRR e meta REAIS (antes era um
  `30000` fixo), calcula "receita recorrente a conquistar" (meta − MRR), não a meta cheia.
- **Command K completo** (§60) — cobre toda a lista do prompt (Create task/opportunity/proposal,
  Import list, Start sequence, Search client/lead, Go to Growth/Commercial/Planning/Finance).
- **Automação §72 — regras 1, 2 e 3**, incluindo janela de alerta configurável (ver seção
  própria abaixo).
- **RBAC mínimo** (`can_view_financials`) — ver seção própria abaixo.
- **Batch actions na Lista de leads** (§71) — seleção múltipla + toolbar contextual (Assign/Tag/
  Strategy/Move/Export). Ver seção própria abaixo.
- **Tema dark — contraste reduzido** — branco puro removido (texto e superfícies claras usam
  `#E7E5E4` agora, não mais `#FFFFFF`/oklch~0.96-1), fundo `#0B0B0D`, texto secundário `#A1A1AA`.
  Só `.os-shell[data-theme="dark"]`.
- **`.env.example`** — `ANTHROPIC_API_KEY` documentada (sem valor), decisão de modelo já
  registrada (Claude API), integração NÃO escrita (ver seção IA abaixo — parada por falta de
  chave real, não por falta de tempo).

## Automação (§72) — o que foi implementado nesta rodada

Lista fechada de 3 regras (dada explicitamente, nesta ordem de prioridade). Regra de segurança
respeitada nas 3: nenhuma cria/edita/apaga em massa, cada uma age sobre 1 registro por vez,
reaproveitando Server Actions já existentes (nenhum SQL novo escrito pra automação em si).

**Regra 1 — Lead respondeu → move pra "Respondeu" sozinho. FEITO.**
`logLeadActivityAction` (`lib/comercial/actions.ts`) ganhou um parâmetro `isPositiveResponse`
(checkbox no drawer do lead, "Foi uma resposta do lead — mover pra 'Respondeu' automaticamente").
Quando marcado: registra a nota normalmente, e se o lead ainda estiver num estágio anterior a
"Respondeu", chama `moveLeadStageAction` — a MESMA função que o Kanban usa no drag-and-drop,
nenhuma lógica de troca de estágio duplicada.

**Regra 2 — Lead sem contato há N dias → marcar como atrasado. FEITO, mas não como "rotina
diária" — como recomputação ao vivo, e por um motivo real:** o board do Pipeline já tinha o
indicador visual (`next_contact_at` no passado → badge "Atrasado"), só que com um bug real —
não excluía leads em estágio terminal (Fechado/Perdido), que continuavam mostrando "Atrasado"
mesmo já não precisando de nenhuma ação. Corrigido em dois lugares:
- `components/comercial/pipeline-board.tsx` (`nextActionLabel` agora recebe `isTerminalStage` e
  suprime o badge pra Fechado/Perdido).
- `lib/comercial/sequences.ts` (`computeExecutionQueue` — um lead Perdido com sequência ativa
  continuava aparecendo na fila de execução sugerindo continuar contatando; filtrado agora).
Não existe (e não foi criada) infra de cron neste projeto — o valor é recalculado a cada
carregamento de página, o que é estritamente melhor que um flag armazenado por rotina diária
(nunca fica desatualizado por até 24h). Se no futuro isso precisar virar notificação PUSH (não
só indicador visual passivo), aí sim vai precisar de um job de verdade — não é o caso hoje
(regra explícita: "nenhuma notificação externa ainda").

**Regra 3 — Conta a receber vencendo em N dias → alerta interno. FEITO**, mesma lógica de
recomputação ao vivo (não rotina armazenada), mesmo motivo da regra 2.
- `lib/financeiro/queries.ts` — `computeFinanceiroMetrics()` ganhou `upcomingReceivables`
  (`status='pendente'` com `due_date` dentro da janela configurável).
- **Janela configurável — feito na retomada seguinte** (era pendência desta regra): coluna
  `financial_rules.receivables_alert_days` (default 5, mesmo padrão de `operational_percentage`
  — tabela de config de 1 linha já existente, migration `20260818000000`). Campo editável em
  Configurações → Regras financeiras (`ReceivablesAlertDaysField`); `updateReceivablesAlertDaysAction`
  atualiza a linha. Constante `UPCOMING_RECEIVABLES_WINDOW_DAYS` removida.
- Aparece em dois lugares: StatTile "Vence nos próximos N dias" em `/financeiro`, e um item na
  lista "Atenção" do Dashboard (`lib/dashboard/executive-metrics.ts`, `kind: "upcoming_revenue"`,
  clicável, mostra a lista real por trás do número).

## Batch actions na Lista de leads (§71) — FEITO

Trabalho de backlog (itens 3/4 do Passo 1 bloqueados, usuário pediu pra seguir com outra coisa
útil enquanto isso). "Selecionar vários... toolbar contextual que só aparece com seleção". Do
vocabulário do prompt (Assign/Tag/Strategy/Sequence/Move/Export/Archive), mapeado pro schema
real: Assign→`owner_id`, Tag→`leads.tags`, Strategy→`strategy_id`, Move→`stage_id`,
Export→CSV client-side. "Sequence" não virou ação própria (cadência já é derivada de
`strategy_id`); "Archive" não existe no schema (mover pra "Perdido" já cobre o mesmo caso).

- `components/comercial/leads-table.tsx` — checkbox por linha + "selecionar todos visíveis".
- `components/comercial/bulk-actions-toolbar.tsx` — cada campo dispara na hora (sem botão
  "Aplicar").
- `lib/comercial/actions.ts` — `bulkAssignOwnerAction`, `bulkAssignStrategyAction`,
  `bulkAddTagAction` (append, 1 leitura + 1 escrita por lead), `bulkMoveStageAction` (nunca
  aceita `is_won` como destino, loga `stage_changed` por lead pro funil continuar correto).

## Bug real do tema dark — tokens novos herdando do light — CORRIGIDO

Achado pelo usuário: cards do Pipeline com fundo branco/creme sólido em tema escuro, hover da
sidebar branco. Causa raiz: `--kanban-*`, `--sidebar-hover`, `--sidebar-muted-foreground`,
`--input-background*`/`--input-placeholder` (todos criados na v2 do tema) só tinham valor no
bloco `.os-shell` (light) — nunca foram redefinidos em `.os-shell[data-theme="dark"]`. CSS
custom property resolve por propriedade, não por bloco: sem redefinição no dark, o valor
continuava vindo do light mesmo dentro do dark (o fallback do `@theme inline` só serve pra
propriedade totalmente indefinida, não é este caso). Corrigido explicitando os 2 grupos no bloco
dark, mesmos tons do resto da paleta escura.

**Verificação**: sem screenshot literal de `/comercial` logado — Playwright não instala Chromium
neste ambiente ("does not support chromium on mac12"). Confirmado na CSS compilada pós-build:
cada token afetado agora tem 2 valores distintos (light e dark) em vez de herdar 1 só. Recomendo
uma conferência visual rápida sua em produção (Pipeline + hover da sidebar, tema escuro) — não
consegui fazer isso sozinho neste ambiente.

## Tema dark — contraste reduzido — FEITO

Pedido explícito, fora do plano documentado (ajuste pontual). Branco puro removido de
`.os-shell[data-theme="dark"]` — texto e superfícies claras (botão primário, item ativo da
sidebar) usam `#E7E5E4` no lugar de `#FFFFFF`/oklch~0.96-1. Fundo mantido `#0B0B0D`, texto
secundário `#A1A1AA`. Superfícies intermediárias (card/popover/secondary/muted/accent/border/
chart) são uma rampa neutra derivada entre essas duas pontas — mesmo raciocínio já documentado
no tema light v2. Só o dark do shell interno mudou; `:root` (`/admin`/`/clients`) e o light do
shell não foram tocados.

## Growth como carrossel com swipe (§1-2, §45-47) — ADIADO, nada tocado

Decisão tomada (não minha, veio explícita): é reestruturação de arquitetura de navegação
(sidebar+abas → swipe entre Overview/Commercial/Planning), risco real de quebrar a navegação
principal do Comercial se ficar pela metade. Não comecei nenhuma linha disso. Precisa de uma
sessão dedicada, com folga de uso pra terminar inteiro numa sentada — não é um incremento de
fim de sessão.

## RBAC mínimo (Passo 1 item 2) — FEITO

`lib/auth/permissions.ts` — `canViewFinancials(role)` (pura: `owner`/`admin`/`finance`) +
`requireFinancialAccess()` (resolve a sessão real via `getSession()`, `lib/admin/auth` — nunca
confia em `role` vindo do chamador). Aplicado em:
- Toda action de `lib/financeiro/actions.ts` (checa antes de ler/escrever `revenue`/`expenses`/
  `costs`/`financial_rules`).
- `/financeiro` e `/configuracoes/regras-financeiras` (página inteira — sem acesso, mostra "Sem
  acesso" em vez do conteúdo).

**Escopo real, não escondido — o que NÃO foi gateado nesta rodada**:
- **Home (`/`)** — mostra MRR, cash flow, meta do mês como parte do dashboard executivo
  agregado. Não gateei a página inteira porque é a home de TODO usuário independente do papel
  (gatear isso é uma decisão de produto — "o que um papel sem acesso financeiro deve ver na
  home?" — que não é óbvia e não cabia decidir sozinho aqui).
- **Planejamento (`/comercial?tab=planejamento`)** — o Growth Engine mostra MRR/meta real
  (`lib/simulation/defaults.ts` chama `computeFinanceiroMetrics()`). Mesmo motivo, não gateado.
- **`lib/clientes/contract-actions.ts`** (criar/editar contrato — valor, período) — fora do
  escopo explícito da instrução (`lib/financeiro/queries.ts`/`actions.ts` especificamente).

Se o próximo passo for endurecer isso, a pergunta a responder antes é exatamente essa: um papel
sem `can_view_financials` (`commercial`/`marketing`/`operations`/`production`) deveria ver a
Home com números ocultos/genéricos, ou ser redirecionado pra outra tela padrão? Isso é decisão
de produto, não técnica — não escolhi sozinho.

Único usuário real hoje é Santiago (`role: owner`) — não afetado por nenhuma dessas regras
(confirmado no banco antes de aplicar).

## IA contextual (§73-74) — RBAC pronto, orquestrador NÃO iniciado

Modelo decidido: **Anthropic (Claude API)**. `ANTHROPIC_API_KEY` documentada em `.env.example`
(sem valor). **Parado aqui por instrução explícita da própria rodada**: "se ainda não houver
chave real configurada, pare aqui, avise que precisa da chave, e não simule/mocke resposta de
IA". Verificado nos dois lugares possíveis:
- `.env.local` (local) — sem a variável.
- `vercel env ls` (produção) — só `NEXT_PUBLIC_SUPABASE_ANON_KEY`/`NEXT_PUBLIC_SUPABASE_URL`,
  nenhuma chave da Anthropic.

Nenhuma linha do orquestrador foi escrita. **Próximo passo exato**: (1) quem retomar precisa
primeiro obter uma `ANTHROPIC_API_KEY` real e configurá-la (`.env.local` pra dev, `vercel env
add ANTHROPIC_API_KEY production` pra prod); (2) só depois disso confirmado, implementar o MVP
somente-leitura (5-8 ferramentas consultando `lib/comercial/queries.ts`/`lib/financeiro/
queries.ts` — resumo do pipeline, leads sem follow-up, resumo financeiro do mês, contas
atrasadas — cada ferramenta financeira checando `can_view_financials` ANTES de ficar disponível
pro modelo, não o modelo decidindo não contar; nenhuma ferramenta de escrita ainda).

## Verificação final desta rodada

```
npm run typecheck   # limpo
npm run build       # limpo
```

Nenhum arquivo fora do escopo do Procreating OS foi tocado (confirmado via `git status` antes de
cada commit — a outra sessão que compartilha este repositório trabalha em
`app/(internal)/operacao/**` de conteúdo/entregas/equipe/produção e `lib/operacao/**`, arquivos
que não aparecem em nenhum commit desta lista).

## Próximo passo exato pra quem retomar

Ordem original (janela configurável → RBAC → IA → Growth swipe) cumprida até onde deu:
1. ~~Janela configurável~~ — **feito**.
2. ~~RBAC mínimo~~ — **feito**.
3. **Orquestrador de IA — bloqueado, precisa de ação humana primeiro**: obter uma
   `ANTHROPIC_API_KEY` real e configurá-la (`.env.local` + `vercel env add ANTHROPIC_API_KEY
   production`). Só depois disso, implementar o MVP somente-leitura (5-8 ferramentas, ver seção
   IA acima).
4. Growth como carrossel com swipe — só numa sessão dedicada inteira a isso, só depois do item 3.

Gap conhecido, não urgente, registrado pra não esquecer: Home e Planejamento mostram dado
financeiro sem passar pelo RBAC novo (ver seção RBAC acima) — decisão de produto pendente, não
técnica.
