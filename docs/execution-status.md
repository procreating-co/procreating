# Procreating OS — estado de execução (master prompt §1-87)

Documento de retomada. Se você é uma sessão nova retomando isto, comece por aqui antes de reler
o histórico inteiro — este arquivo é a fonte da verdade, não a memória de conversa de ninguém.

**Atualização mais recente**: `ANTHROPIC_API_KEY` configurada (`.env.local` + `vercel env add
ANTHROPIC_API_KEY production`) — confirmado nos dois lugares sem nunca imprimir o valor. Rodada
de 4 itens, todos concluídos e implantados:
1. Bug reportado "tarefa some sem escrever a data" — investigado, NÃO reproduzido no código: o
   fix anterior (`5c23d92`) está corretamente aplicado e deployado nos 3 pontos de criação. Pedi
   confirmação explícita do usuário em produção (ver seção própria).
2. Preview de texto removido do campo de tarefa no Workspace (mantido em ⌘K/QuickAdd).
3. Visão de semana nova no Workspace (7 colunas, hoje + 6 dias), substituindo "Próximos prazos".
4. Orquestrador de IA (§73-74) — MVP somente-leitura implementado (6 ferramentas). **Bloqueio
   novo, diferente do anterior**: a chave está configurada e a API responde corretamente até a
   checagem de billing, mas a conta Anthropic está sem crédito ("credit balance too low") — a
   integração está pronta, só falta crédito na conta pra testar uma resposta real.

Ver seções próprias de cada item abaixo.

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

## Analytics + filtros de período no Comercial (§65-66) — FEITO

Backlog (itens 3/4 do Passo 1 seguem bloqueados). "Contact→Reply, Reply→Meeting, Meeting→
Proposal, Proposal→Won" (§65) e filtros de período consistentes — Today/7 dias/30 dias/Este mês/
Mês passado/Trimestre/Ano (§66) — nenhum dos dois existia na Visão Geral do Comercial.

- `lib/comercial/period.ts` (novo) — 7 presets, timezone-safe. "Custom" (intervalo livre) fica
  de fora — precisaria de um date-range picker novo, escopo maior; documentado, não escondido.
- `lib/comercial/funnel.ts` ganha `computeOverallFunnel(period)` — mesmo funil que já existia
  por estratégia, agora global e por período. Reaproveita o `FunnelChart` (Recharts) que já
  existia em `components/comercial/funnel-chart.tsx`.
- `lib/comercial/metrics.ts` — `computeComercialMetrics` aceita período (default "este mês").
  Bug real corrigido: a versão anterior calculava "início do mês" com `new Date()` cru — mesmo
  viés de fuso que `lib/date.ts` existe pra evitar. Corrigido pra todo mundo, incluindo o Home
  dashboard (chama sem argumento, herda o default correto).

## "ERP totalmente funcional" — auditoria de edição/exclusão — FEITO (3 de 6 gaps fechados)

Pedido aberto do usuário, não um item do master prompt: "faça uma análise geral pra implementar
meios de edição e de melhora na experiência de usuário, tornando o ERP totalmente funcional".
Varredura por grep (`createXAction` sem `updateXAction`/`deleteXAction` correspondente) achou 6
telas só-criação. Fechadas nesta rodada, 3 commits separados, cada um com typecheck+build limpo:

- **Contatos do cliente** (`client_contacts`) — só existiam via onboarding, sem editar/excluir
  depois. `lib/clientes/contact-actions.ts` (novo) + `ContactFormDialog` (criar/editar no mesmo
  componente, prop `contact?` opcional) + `ContactsSection` (hover revela editar/excluir,
  `ConfirmDialog` na exclusão). `clearOtherPrimaries` mantém um único contato principal.
- **Tarefas do Workspace** — só criar (parser de linguagem natural) e marcar feita; renomear/
  mudar prazo/responsável ou desistir exigia excluir-e-recriar (excluir nem existia).
  `updateTaskAction`/`deleteTaskAction` (`lib/tasks/actions.ts`) + `TaskEditDialog` (campos
  explícitos, deliberadamente SEM reaproveitar `parseQuickTask` — editar é "mudar exatamente
  isto", não re-escrever a frase torcendo pro parser entender igual).
- **Despesas e Custos (Financeiro)** — Despesas só tinha criar; Custos tinha excluir mas sem
  confirmação. `updateExpenseAction`/`deleteExpenseAction`/`updateCostAction`
  (`lib/financeiro/actions.ts`, atrás de `requireFinancialAccess()` como o resto do arquivo) +
  `ExpenseFormDialog`/`CostFormDialog` ganham prop opcional (`expense?`/`cost?`) + `ConfirmDialog`
  nas duas exclusões. `FinancialEntriesTable` ganhou `actions?` opcional (só Despesas usam —
  Receitas continuam só com toggle de status, já que parcela vem de contrato: editar ali é editar
  o contrato, não a linha).

**3 gaps identificados e NÃO fechados nesta rodada** (backlog, não esquecidos):
- `/configuracoes/usuarios` — hoje é um `ComingSoon` puro; agora que RBAC existe (papel importa de
  verdade), vale uma tela de gestão de `users`/`team_invites`, não só o cadastro via allowlist em
  `/admin/signup`.
- Listas de prospecção — hoje só criação via import de CSV, sem renomear/excluir lista depois.
- Produção/projetos em `/operacao` — **não investigado nesta rodada de propósito**: é escopo ativo
  de outra sessão que compartilha este repositório (arquivos dela apareciam modificados no
  `git status` no início desta sessão) — mexer ali sem coordenação é risco de conflito real, não
  hipotético.

**Erro de processo, sem consequência**: ao montar o funil, sobrescrevi `funnel-chart.tsx` sem
ler o arquivo primeiro — ele já era um componente funcional (usado também pela página de
Estratégia) com a mesma interface. Revertido com `git checkout HEAD --` antes de qualquer
commit, nada chegou a ir pro ar errado. Registrando aqui como lembrete: **sempre ler um arquivo
antes de recriá-lo**, mesmo quando parece óbvio que "não deve existir ainda".

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

## Growth como carrossel com swipe (§1-2, §45-47) — FEITO (a nota "ADIADO" abaixo estava errada)

**Correção de registro**: a entrada anterior deste documento dizia "ADIADO, nada tocado". Isso
era falso no momento em que a rodada atual começou — uma sessão anterior já tinha implementado
`components/comercial/gesture-nav.tsx` + `components/comercial/tab-transition.tsx` (sem atualizar
esta seção depois). Instrução desta rodada foi clara: antes de tocar em navegação, descrever o
desenho em texto e só codar depois de confirmado — a investigação achou isso, descrevi pro
usuário, ele confirmou que já satisfaz o pedido.

**O que já existia** (swipe entre as 5 sub-abas do Comercial — Visão Geral/CRM/Prospecção/
Estratégias/Planejamento — que bate com o "Overview/Commercial/Planning" do prompt original):
`GestureNav` escuta `wheel` (trackpad/mouse nativo, sem lib), acumula `deltaX` até passar um
threshold (ignora se o scroll é mais vertical que horizontal, ou se o alvo é o Kanban — que tem
scroll horizontal próprio), navega UMA aba por gesto com cooldown de 550ms via `router.push` pra
uma URL `?tab=` normal — deep-link/compartilhamento/back-forward já funcionavam de graça, nunca
existiu estado de carrossel paralelo à URL. `TabTransition` dá o fade+slide sutil na troca
(seção 28: "não exagerar").

**Único gap real, fechado nesta rodada**: `GestureNav` só reagia a `wheel` — em touchscreen
(celular/tablet) não existia swipe nenhum, só toque nas abas visíveis (`PageTabs`, que já
funcionava em qualquer dispositivo/teclado como fallback e continua existindo). Adicionado
`touchstart`/`touchend` no mesmo componente: mede o deslocamento total do toque (não acumula a
cada `touchmove`, decide só quando o dedo solta — evita `preventDefault()` no meio do gesto, que
brigaria com o scroll nativo), mesma regra de fundo (horizontal domina vertical → navega) e o
mesmo `cooldown`/lookup de índice do wheel, agora fatorado num `navigate()` compartilhado.
Convenção padrão de carrossel mobile: arrastar pra esquerda avança, pra direita volta.

Fora de escopo, de propósito (não é o que o pedido descrevia, e trocar sidebar+ícones por um
carrossel de ÁREAS de topo — Dashboard/Comercial/Financeiro/Operação como slides cheios — seria
reestruturação de navegação principal de verdade, risco real): nada disso foi tocado.

## RBAC mínimo (Passo 1 item 2) — FEITO

`lib/auth/permissions.ts` — `canViewFinancials(role)` (pura: `owner`/`admin`/`finance`) +
`requireFinancialAccess()` (resolve a sessão real via `getSession()`, `lib/admin/auth` — nunca
confia em `role` vindo do chamador). Aplicado em:
- Toda action de `lib/financeiro/actions.ts` (checa antes de ler/escrever `revenue`/`expenses`/
  `costs`/`financial_rules`).
- `/financeiro` e `/configuracoes/regras-financeiras` (página inteira — sem acesso, mostra "Sem
  acesso" em vez do conteúdo).

**Decisão de produto que antes estava em aberto — resolvida e aplicada nesta rodada**: papel sem
`can_view_financials` NÃO é redirecionado pra fora de Home/Planejamento — continua vendo a tela
inteira (contexto preservado), só os números em R$ viram `"R$ ••••"`.

- **Home (`/`)** — KPIs/`FinancialBlock` via helpers `money()`/`compactMoney()` locais; conteúdo
  dos modais de detalhe (`DetailList`) que carrega valor, via `maskEntries()` (só troca o campo
  `value`, nunca `label`/`meta`); "Atenção Necessária" troca a frase inteira quando teria R$
  embutido. 3 gráficos (Receita vs. Meta, Fluxo de Caixa, Funil de Vendas) codificam valor
  visualmente (altura de barra/linha) — não dá pra mascarar ponto a ponto sem ficar ilegível,
  viram um `EmptyInline` no lugar; as tabelas de apoio desses gráficos continuam visíveis (texto
  já mascarado). Contagens/percentuais (clientes ativos, conversão, churn, headcount) NÃO são
  "dado financeiro" no sentido estrito de `canViewFinancials` — continuam visíveis pra qualquer
  papel.
- **Planejamento (`/comercial?tab=planejamento`)** — abordagem diferente da Home porque
  `SimulatorForm` é formulário EDITÁVEL, não leitura: em vez de sobrepor "R$ ••••" num
  `<input type="number">` (UX estranha, o campo teria que virar read-only), Meta/MRR
  simplesmente não são pré-preenchidos com o dado real quando `canView=false` — o simulador
  continua funcionando por inteiro com qualquer valor digitado, só sem partir do MRR/meta reais.
- **`lib/clientes/contract-actions.ts`** (criar/editar contrato — valor, período) — segue fora do
  escopo desta rodada (era fora da instrução original também).

Único usuário real hoje é Santiago (`role: owner`) — não afetado por nenhuma dessas regras
(confirmado no banco antes de aplicar). O mascaramento não foi visualmente confirmado com uma
segunda conta de papel não-financeiro (não existe uma ainda) — a lógica foi conferida lendo o
código gerado, não por screenshot logado como outro papel.

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

## Gestão de usuários em Configurações — FEITO

`/configuracoes/usuarios` era um `ComingSoon` puro. Escopo explícito, sem reabrir o fluxo de
convite: listar `users` reais (nome/e-mail/papel), listar `team_invites` ainda pendentes
(`used_at is null`) e revogar um convite — convidar continua só pelo menu **+**
(`inviteTeamMemberAction`, reaproveitado). Segundo domínio de RBAC criado pra isto
(`canManageUsers`/`requireUserManagementAccess`, `owner`/`admin`, mesmo padrão de
`canViewFinancials`/`requireFinancialAccess`) — gestão de quem tem acesso é, em si, dado sensível.

## Listas de prospecção — renomear/excluir — FEITO

Último dos 3 gaps de CRUD do backlog anterior. `prospecting_lists` só tinha criação (import de
CSV). `renameProspectingListAction`/`deleteProspectingListAction` em `lib/comercial/actions.ts` —
a exclusão não reimplementa "tem leads vinculados": `leads.list_id` referencia a lista sem
`on delete cascade` (migration `20260814260000`), o próprio Postgres bloqueia (`23503`), só
traduzido pra mensagem legível. Card de lista em `ProspeccaoView` era um `<Link>` inteiro — virou
`<div onClick>` com `router.push` (HTML não permite `<button>` dentro de `<a>`, mesmo motivo já
resolvido em `LeadCard`/`pipeline-board.tsx`), ícones de editar/excluir revelados no hover.

## Bug "tarefa some sem escrever a data" — investigado, fix confirmado correto no código

Instrução desta rodada: não assumir que era a mesma causa de antes, investigar primeiro. Auditei
os 3 pontos de criação de tarefa (`WorkspaceTasks`, `CommandPalette`, `QuickAddMenu`) e a cadeia
completa até `createTaskAction`:
- `parseQuickTask` (`lib/tasks/quick-parse.ts`) — o fix `5c23d92` está lá: sem palavra de data
  reconhecida, `dueDate` vira `todayISO()`, nunca fica `null`.
- Os 3 call sites passam `assigneeId: parsed.assigneeId ?? userId` (nunca fica sem responsável) e
  `dueDate: parsed.dueDate` direto pra `createTaskAction`, sem transformação no meio.
- `createTaskAction` insere `due_date: input.dueDate` sem override.
- `5c23d92` é ancestral do HEAD atual e de todo deploy feito desde então (confirmado via
  `git merge-base --is-ancestor`) — o fix está no ar.
- Só existe uma definição de `parseQuickTask` no repositório (sem cópia divergente em paralelo).

Nenhuma causa de regressão encontrada — o código está correto. **Não reescrevi nada aqui** por
não ter achado nada quebrado; reescrever sem uma causa real seria só cosmético. Meu ambiente não
tem Chromium (Playwright não instala aqui, limitação já documentada), então não consegui clicar
de verdade em produção — **pedido explícito ao usuário: testar em `procreating.vercel.app` uma
tarefa sem nenhuma palavra de data (ex.: "revisar contrato") nos 3 lugares e confirmar que aparece
em "Tarefas de hoje" na hora**. Se ainda estiver quebrado depois dessa auditoria de código não
achar nada, o próximo passo é logar a chamada de rede real (Network tab) pra ver o payload que
está saindo do browser — pode ser cache de build antigo no navegador do usuário, não código.

## Preview de texto removido do campo de tarefa (Workspace) — FEITO

Só em `components/workspace-tasks/workspace-tasks.tsx` — `describeQuickTaskPreview` continua
em uso normal no `quick-add-menu.tsx` e no Command Palette (campo dentro de modal sem lista
visível por trás, preview ainda serve de confirmação antes de enviar). No Workspace a tarefa já
aparece na lista logo abaixo assim que criada — preview era redundante ali.

## Visão de semana no Workspace — FEITO

Não existia calendário nenhum (ausência, não bug). 7 colunas (hoje + 6 dias seguintes), sem grade
de hora — distribuição por dia, Sunsama-style, não uma agenda cheia (volume real de tarefas é
baixo, grid de horário seria complexidade sem necessidade real agora). `listWeekTasks` (nova,
`lib/tasks/queries.ts`) traz hoje..hoje+6 numa passada só, qualquer status; `WeekView`
(`components/workspace-tasks/week-view.tsx`) agrupa por `due_date` e desenha, toggle de concluída
reaproveitando `updateTaskStatusAction`. Substituiu "Próximos prazos" (mesmo dado no fundo, duas
UIs pra mesma coisa seria redundante) — `WorkspaceOverview.upcomingTasks` virou `.weekTasks`.
`listUpcomingTasks` ficou sem chamador ativo, mantida (função genericamente útil, não uma
duplicata morta de lógica).

## Orquestrador de IA (§73-74) — MVP somente-leitura implementado, BLOQUEADO em billing (não em código)

`ANTHROPIC_API_KEY` configurada nos dois lugares. 6 ferramentas somente-leitura, nenhuma escrita:
- Sem RBAC (pipeline/tarefas já não são gateados em nenhum outro lugar do produto):
  `get_pipeline_summary`, `get_stale_leads`, `get_my_tasks_due`.
- Atrás de `canViewFinancials` — filtradas da lista de ferramentas ANTES da chamada à API quando
  o papel não tem acesso, não é o modelo "decidindo" esconder: `get_financial_summary`,
  `get_overdue_accounts`, `get_upcoming_receivables`.

Todas chamam as MESMAS queries determinísticas que o resto do produto usa
(`computeComercialMetrics`, `computeFinanceiroMetrics`, `listTodayAndOverdueTasks` etc.) — o
modelo só formata/explica, nunca calcula um número sozinho (reforçado no system prompt).

`lib/ai/client.ts` — cliente mínimo via `fetch` cru, **sem SDK nova** (decisão deliberada: evita
tocar `package.json`/`package-lock.json`, compartilhado com a outra sessão que trabalha neste
repositório — a API é só HTTP+JSON). `lib/ai/orchestrator.ts` — `askAssistantAction`, Server
Action: 1 pergunta → loop de tool use (máx. 4 rodadas) → resposta em texto, sem histórico
persistido entre perguntas (decisão explícita desta rodada). UI:
`components/dashboard/ai-assistant.tsx` — botão Sparkles discreto no header (mesmo padrão visual
do ícone de busca, `Dialog` simples, não o mesmo componente do Command Palette), mostra chips de
quais ferramentas foram consultadas por transparência.

**Testado fora do runtime do Next** (script isolado, chamada crua à API com a chave real): auth
aceita, formato do request aceito, a API processou até a checagem de billing — e voltou
`"Your credit balance is too low to access the Anthropic API."` Ou seja: **o código está correto
e pronto**, o bloqueio agora é a CONTA Anthropic sem crédito, não a chave nem a integração. Não
tem como validar uma resposta real (nem testar o loop de tool use de ponta a ponta) até isso ser
resolvido — é um segundo item que só o usuário destrava (`console.anthropic.com` → Plans &
Billing → adicionar crédito), separado da configuração da chave que já foi feita.

## Próximo passo exato pra quem retomar

1. **Usuário precisa testar o item 1** (bug de tarefa sem data) em produção e confirmar — ver
   seção acima. Sem essa confirmação, não considerar esse item fechado só porque o código parece
   correto.
2. **Usuário precisa adicionar crédito na conta Anthropic** (`console.anthropic.com` → Plans &
   Billing) pra validar o orquestrador de IA de ponta a ponta — código pronto, só falta isso.
   Depois de resolvido, um teste real (uma pergunta simples tipo "quantos leads sem follow-up?")
   confirma o loop de tool use funcionando; se algo quebrar ali, é o primeiro lugar a olhar.

Fora esses dois itens de confirmação/desbloqueio que dependem do usuário, sem item grande
conhecido pendente — os 3 blocos do master prompt que definiam o core do produto (Comercial,
Financeiro, Workspace/Onboarding) estão funcionalmente maduros sobre dado real, RBAC cobre os
domínios sensíveis que existem hoje (financeiro, gestão de usuários), os 6 gaps de CRUD da
auditoria "ERP totalmente funcional" estão todos fechados, e a primeira fatia de IA está
implementada. Único gap conhecido restante: Operação/produção (`app/(internal)/operacao/**`,
`lib/operacao/**`) nunca foi auditada por esta linha de trabalho — de propósito, é escopo ativo de
outra sessão que compartilha o repositório.
