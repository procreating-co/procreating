# Procreating OS — estado de execução (master prompt §1-87)

Documento de retomada. Se você é uma sessão nova retomando isto, comece por aqui antes de reler
o histórico inteiro — este arquivo é a fonte da verdade, não a memória de conversa de ninguém.

**Atualização mais recente**: bug reportado pelo usuário — "fechei um cliente, o valor não
apareceu no Dashboard/Financeiro". Verificação direta no banco (Supabase MCP, `execute_sql`)
confirmou que o dado sempre esteve correto (cliente, contrato recorrente R$4.000/mês com
`category=recorrente_ativo`, 5 linhas de receita projetada — tudo gravado certo pela RPC
`close_lead_and_create_client`). Não era bug de dado. Causa real: `closeLeadAction`
(`lib/onboarding/actions.ts`) era o único Server Action de escrita do app sem nenhum
`revalidatePath` — os dois pontos que abrem o `OnboardingModal` (soltar em "Fechado" no Kanban,
Quick Add) navegam pro cliente novo com `router.push` sem `router.refresh()`, então o Router
Cache do Next seguia servindo o payload antigo de Home/Financeiro/Comercial/Clientes. Corrigido
adicionando `revalidatePath` pra `/`, `/financeiro`, `/comercial`, `/clientes`,
`/clientes/[id]` — mesma convenção usada em todo o resto do código. Deployado (`6632a1c`).

**Antes disso**: o MCP do Supabase reconectou nesta sessão — voltei no item 3 da
auditoria (RLS Client Hub) pra rodar o linter de segurança de verdade (`get_advisors`), que antes
só tinha sido investigado por grep. Confirmou o achado anterior (zero uso do ERP nas 8 tabelas) e
trouxe 3 achados novos, revisados com julgamento, não "consertados automaticamente": 2 são
`SECURITY DEFINER` do próprio ERP mas deliberados (documentados no código já antes desta sessão),
1 é uma view do Client Hub (não tocada), e 1 é configuração de conta Supabase (recomendação, não
ação minha). Ver seção própria abaixo.

**Antes disso**: rodada de auditoria/hardening **completa**, os 5 itens (retomada
depois de ter sido pausada no item 1 pra dar lugar ao mapeamento do master prompt, que também
terminou). Achados reais em quase todo item — não foi só "rodei e não achei nada":

1. **Testes unitários** (Vitest) — feito antes da pausa. Achou e corrigiu um bug real em
   `quick-parse.ts` (regex `\b` não reconhece letra acentuada — "amanhã"/"às" nunca batiam).
2. **Varredura de dark mode** — zero token de superfície faltando (a correção de uma rodada
   anterior fechou o gap por completo), mas achou `button.tsx` (variant destructive) com
   `text-white` hardcoded em vez do token — branco puro reaparecendo em todo botão "Excluir" do
   produto.
3. **RLS Client Hub** — confirmado que o ERP não usa nenhuma das 8 tabelas sem policy. Só
   investigação, sem código (decisão de arquitetura é da outra sessão).
4. **Acessibilidade** — achou 1 `<div onClick>` real sem teclado/leitor de tela
   (`prospeccao-view.tsx`, empty state), corrigido pra `<button>`. Confirmado que todo
   Dialog/Sheet fecha com Escape (Radix, nenhum wrapper customizado quebrando isso).
5. **Estados de erro em Server Actions** — achou vários toggles "dispara e esquece", e um padrão
   mais sério: 5 handlers de EXCLUSÃO fechavam o `ConfirmDialog` mesmo se a Server Action
   falhasse, dando impressão de sucesso sem ter acontecido. Corrigido pro padrão já estabelecido
   (só fecha no sucesso, mostra erro e mantém aberto na falha).

Ver as seções próprias de cada item mais abaixo. Antes disso: §2/§4/§20 completo (os 5 passos,
usuário testou e liberou o último) e a passada de minimalismo em `description=`.

**Mapeamento §1-87 contra este documento — FEITO, 4 dos 8 itens implementados.** Cruzei as 87
seções do master prompt (recuperado do transcript desta sessão, via o mesmo script Python de uma
rodada anterior — não pedi de novo) contra este arquivo, item por item. Achados e execução:
implementados nesta rodada, em ordem: §61 (atalhos de teclado), §19 (Response Handling — 3 dos 4
botões), §51 (drag-to-reschedule na visão de semana), §65 (Receita por Responsável/Origem). Ver
seções próprias abaixo. Confirmado com o usuário e deixado de fora deste ciclo: §43 (Operation
Setup automático — cruza com a outra sessão), §80-83 (testes de aceitação — QA manual, melhor com
o usuário olhando), §74 (AI scoring — depende do orquestrador validado, bloqueado em billing).
§2/§4/§20 (Comercial como 3 abas, não 5) teve só o DESENHO escrito (seção própria abaixo), sem
nenhuma linha de código — decisão consciente do usuário, por ser arquitetura de navegação
principal, "não espremido no meio de uma sessão que já vai mexer em várias outras coisas".

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

## Testes unitários (Vitest) — item 1 da auditoria/hardening — FEITO

Projeto não tinha framework de teste nenhum. Instalado `vitest` (só isso, dev dependency —
`vitest.config.mts` resolve o alias `@/*`, mesmo mapeamento do `tsconfig.json`, sem
`vite-tsconfig-paths` nem outra dependência). `npm run test` novo em `package.json`.

Cobertura (só lógica pura, sem browser — funções que já tiveram bug real de fuso/data no
histórico deste projeto):
- `lib/date.test.ts` — `addDaysISO` (vira mês, vira ano, bissexto, negativo), `monthKeyOf`/
  `dayOfMonthOf` (sem viés de fuso), `lastMonthKeys`.
- `lib/comercial/period.test.ts` — os 7 presets + casos de virada de mês/ano (`last_month` em
  janeiro, `quarter` no primeiro/último mês do trimestre) via mock de `todayISO`/`todayParts`.
- `lib/financeiro/calculations.ts` (novo) — margem/MRR/agrupamento de receita por cliente/contas
  a receber na janela, EXTRAÍDOS de `computeFinanceiroMetrics` (`lib/financeiro/queries.ts`) pra
  função pura testável sem mockar Supabase (refactor mecânico, mesmo cálculo — `queries.ts` só
  passou a chamar as funções novas). `lib/financeiro/calculations.test.ts` cobre os 5 casos.
- `lib/tasks/quick-parse.test.ts` — sem data (vira hoje), amanhã, dia da semana (inclusive quando
  hoje já é esse dia), 3 formatos de hora, `@nome` por primeiro nome/nome completo, combinação.

**Bug real achado pelos testes (não hipotético), corrigido em `lib/tasks/quick-parse.ts`**: `\b`
do JS só reconhece `[A-Za-z0-9_]` como caractere de palavra, nunca letra acentuada. `\bamanh[ãa]\b`
e `\bàs\b` NUNCA batiam na forma acentuada (a normal, a que as pessoas realmente digitam) quando
cercada de espaço/fim de frase — ou seja, o PRÓPRIO EXEMPLO do master prompt ("Editar vídeo
amanhã às 15h") virava "hoje" (não amanhã) e deixava "às" solto no título. Corrigido com
lookaround Unicode-aware (`(?<![\p{L}\p{N}_])`/`(?![\p{L}\p{N}_])`, flag `u`) nos 2 pontos
afetados — "hoje" e os nomes de dia da semana não tinham o problema (sem acento na borda do
match), não foram tocados. `npm run test` — 66/66 passando.

`lib/comercial/funnel.ts` (mencionado no pedido original) **não foi testado** — tem `server-only`
+ I/O direto no Supabase, não é lógica pura isolável sem mockar o client; testar isso exigiria uma
camada de mock de banco, escopo maior que "testes de função pura". A parte de período que ele usa
(`lib/comercial/period.ts`) está coberta.

## Varredura de dark mode — item 2 da auditoria — FEITO

Sistemática, não visual (Playwright não instala Chromium neste ambiente): script comparando cada
custom property de `.os-shell` (light) contra `.os-shell[data-theme="dark"]`. Resultado: **zero
token de superfície/texto faltando** — a correção de uma rodada anterior (`--kanban-*`/
`--sidebar-*`/`--input-*`) fechou o gap por completo, nada novo surgiu desde então. As 3 únicas
diferenças (`font-family-*`) são legítimas (fonte não muda por tema). Também sem `bg-white`/
`text-black`/hex hardcoded em nenhum componente do ERP.

**Achado real, fora do CSS**: `components/ui/button.tsx`, variant `destructive`, usava
`text-white` hardcoded em vez do token `--destructive-foreground` (que já existe e já é `#E7E5E4`
no dark, não branco puro). Esse variant é o botão "Excluir" de todo `ConfirmDialog` do produto —
era o branco puro reaparecendo pela porta dos fundos em qualquer tela de exclusão. Trocado pra
`text-destructive-foreground`, confirmado via CSS compilada (3 valores distintos: light `.os-shell`,
dark `.os-shell`, `:root` fora do shell).

## RLS Client Hub — item 3 da auditoria — FEITO (investigação por código + linter real)

As 8 tabelas da auditoria original (`templates`, `projects`, `project_versions`, `deployments`,
`project_capabilities`, `assets`, `analytics`, `downloads`). Confirmado via grep: **nenhuma tem
`.from()` em `lib/`, `app/(internal)/` ou componentes do ERP**. As poucas menções relacionadas
(`project_capabilities`) vivem em `lib/platform/`, `components/admin/projects/`, `lib/clients/` —
Client Hub, não ERP, nomes parecidos mas escopo diferente (mesmo cuidado do achado do
`ProspeccaoHub`, seção acima).

**Atualização — o MCP do Supabase reconectou nesta sessão**, rodei `get_advisors` (o linter de
segurança de verdade) de propósito. Relatório atual (não mais só a auditoria original, que pode
ter ficado desatualizada): só `analytics` e `downloads` ainda aparecem como "RLS enabled, no
policy" — as outras 6 da lista original já não aparecem mais no lint (a outra sessão deve ter
endereçado, ou o estado mudou desde a auditoria original; não investiguei o porquê, não é meu
escopo). Confirmado de novo, com dado fresco: zero uso do ERP em qualquer uma das 8.

**3 achados novos do linter, revisados com julgamento (não "consertar tudo que apareceu")**:
- `public.published_projects` — view `SECURITY DEFINER` (nível ERROR do linter). Confirmado via
  grep: definida em `20260729000000_initial_schema.sql` (schema original, pré-ERP), só referenciada
  em `lib/supabase/types/database.ts` (arquivo de tipos gerado, lista tudo independente de quem
  usa) — nenhum código do ERP a usa. Client Hub, não tocado.
- `get_team_invite`/`mark_team_invite_used` — WARN por serem `SECURITY DEFINER` chamáveis por
  `anon`/`authenticated`. **São do ERP, mas deliberados**: o próprio comentário de
  `lib/admin/auth/partners.ts` já documenta o motivo — `get_team_invite` roda ANTES de existir
  sessão (fluxo de signup) e devolve no máximo a linha de UM e-mail, nunca a tabela inteira; não é
  um SELECT aberto. Não alterado — revogar `EXECUTE` quebraria o cadastro de novo membro de equipe.
- `close_lead_and_create_client` — mesmo padrão, WARN por `SECURITY DEFINER` executável por
  `authenticated`. É a RPC central de "fechar negócio → criar cliente/contrato/receita numa
  transação só" — precisa de `SECURITY DEFINER` justamente pra fazer isso atômico além do que a
  RLS do usuário chamador permitiria sozinho. Não alterado — é o desenho, não um bug.

**1 achado de conta, não de código, fora do que eu decido sozinho**: `auth_leaked_password_protection`
desabilitado (Supabase Auth não checa senha vazada contra HaveIBeenPwned). É configuração de
projeto/conta Supabase — compartilhada entre ERP e Client Hub, não algo que eu ligo via migration.
Recomendo habilitar (painel do Supabase → Authentication → Policies) — baixo risco, não deveria
afetar sessões já logadas, mas é decisão sua, não minha.

## Acessibilidade — item 4 da auditoria — FEITO

Varredura por parser (não regex ingênuo) achando `<div>`/`<li>`/`<span>` com `onClick` e sem
`role=`. Quase tudo eram falsos positivos (`onClick` num `<Button>`/`<button>` real dentro de um
`<div>` de layout). **1 achado real**: `prospeccao-view.tsx`, o empty state "Nenhuma lista
importada ainda" (clicável, abre o import) era `<div onClick>` sem `role`/`tabIndex`/`onKeyDown`
— inacessível por teclado/leitor de tela. Virou `<button>` de verdade (sem elemento interativo
aninhado ali dentro, diferente dos cards de lista logo abaixo, que já usam `role="button"`
corretamente porque têm editar/excluir por cima).

Confirmado também: todo `Dialog`/`Sheet`/`CommandDialog` do ERP é Radix (`dialog.tsx`/
`sheet.tsx`/`command.tsx`) — Escape fecha nativamente, os keydown listeners globais desta sessão
(`KeyboardShortcuts`, `GestureNav`) não escutam Escape, sem conflito. Os únicos `role="dialog"`
manuais do repositório (`video-lightbox.tsx`, `photo-lightbox.tsx`) são Client Hub, fora de escopo.

## Estados de erro em Server Actions — item 5 da auditoria — FEITO

Todo call site das Server Actions de escrita em `lib/comercial/actions.ts`,
`lib/financeiro/actions.ts`, `lib/tasks/actions.ts`, `lib/clientes/*actions.ts` — confirmando
`if (!result.ok) setError(...)` em todo lugar, não só formulários principais. A maioria já
estava correta; achados reais, exatamente nos lugares que a instrução apontou (toggles/batch) mais
um padrão mais sério que apareceu no meio do caminho (exclusões):

- **Toggles sem captura nenhuma de resultado** (falha virava "volta sozinho no refresh" sem
  explicar por quê): `updateTaskStatusAction` (visão de semana, lista de tarefas do Workspace,
  tarefas de onboarding), `markLeadContactedAction` (fila de execução),
  `moveLeadStageAction`/drag-and-drop do Kanban (o mais visível — falha depois de um gesto físico
  de arrastar), `updateClientStatusAction`.
- **Achado mais sério**: 5 handlers de EXCLUSÃO fechavam o `ConfirmDialog` (1 caso, o dialog
  inteiro) INCONDICIONALMENTE, mesmo se a Server Action falhasse — impressão de sucesso sem ter
  acontecido, pior que só esquecer o erro. `deleteLeadAction`, `deleteContactAction`,
  `deleteCostAction`, `deleteTaskAction` — corrigidos pro padrão já estabelecido numa rodada
  anterior (`DeleteListConfirm` em `prospeccao-view.tsx`): só fecha no sucesso, mostra o erro e
  MANTÉM o dialog aberto na falha. `deleteSequenceStepAction` não tem `ConfirmDialog` nenhum
  (falta de confirmação antes de excluir é uma lacuna SEPARADA, não corrigida — registrada abaixo).
- Batch actions (`bulk-actions-toolbar.tsx`) já estavam corretas — um `run()` compartilhado já
  checava `.ok`; não apareceram no grep inicial por chamarem a action dentro de uma closure.

**Gap identificado nesta auditoria, fechado logo em seguida** (estava fora do escopo específico
de "tratamento de erro", virou item próprio): `sequence-editor.tsx` excluía um passo de cadência
sem nenhum "tem certeza?" — inconsistente com o resto do produto, que confirma toda exclusão.
`ConfirmDialog` adicionado, mesmo padrão de `contacts-section.tsx`/`costs-list.tsx` (só fecha no
sucesso, mostra erro e mantém aberto na falha).

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

## §61 — Atalhos de teclado de letra única — FEITO

`N` (nova tarefa), `C` (novo lead/oportunidade), `I` (importar lista), `P` (ir pra Prospecção),
setas esquerda/direita (troca de contexto dentro do Comercial). `⌘K` já existia.

`components/dashboard/keyboard-shortcuts.tsx` (novo) — listener global no header, guarda contra
modificador pressionado e qualquer campo de texto/textarea/select/contenteditable focado (a
guarda mais importante, checada com cuidado, exatamente como pedido). `N`/`C` reaproveitam o
`QuickAddMenu` via um evento DOM simples, sem duplicar formulário/Server Action. `I` navega pra
`?tab=prospeccao&import=1` — a URL é o canal (mesmo padrão de `?tab=`/`?period=` já usado em todo
o produto), `ProspeccaoView` lê o parâmetro ao montar e abre o drawer de importação sozinho.
Setas — terceiro canal em `GestureNav`, ao lado de wheel/touch, mesmo `navigate()`/cooldown.

## §19 — Response Handling: ações rápidas no drawer do lead — FEITO (3 de 4 botões)

Ao lado do checkbox "foi resposta positiva" (Automação regra 1, não duplicado): **Continuar**
(só registra nota, nenhuma mudança de estágio), **Agendar reunião** (move pro estágio
`reuniao_agendada`), **Desqualificar** (move pro estágio `perdido`). Ambos reaproveitam
`moveLeadStageAction`, a mesma action do drag-and-drop do Kanban.

**"Mover pro pipeline" (4º botão do prompt original) NÃO implementado, de propósito**: neste
schema todo lead já nasce dentro do pipeline (estágio "lead" em diante) — não existe um estado
"fora do pipeline" pra sair dele. Se isso importar, precisa de uma decisão de produto sobre o que
esse botão deveria fazer de fato (não inventei um mapeamento de estágio sem instrução clara).

Achado ao investigar (não tocado, fora de escopo): `components/prospeccao/views/overview-view.tsx`
e `gestao-view.tsx` também usam `LeadDetailDrawer`, mas não são referenciados por nenhuma rota —
código morto de uma iteração anterior do design de Prospecção.

## §51 — Task + Calendar bidirecional (parcial) — FEITO

A visão de semana (rodada anterior) era leitura+concluir. Agora arrastar uma tarefa pra outra
coluna reagenda de verdade (`updateTaskAction`, já existente, nenhuma action nova) — mesmo padrão
de drag-and-drop do Pipeline (estado React `draggingTaskId`, não `dataTransfer.getData`).

Não é a integração bidirecional completa que §51 descreve (não existe um "Calendar" separado de
Task neste produto — a visão de semana É a única superfície de calendário) — mas o núcleo real do
pedido (arrastar reagenda) está feito.

## §65 — Receita por Responsável e por Origem — FEITO

Só "Revenue by Strategy" existia (`compareStrategies`). `computeRevenueByOwnerAndSource`
(`lib/comercial/metrics.ts`) — uma passada só, leads fechados + `revenue` do cliente que cada um
virou (mesma definição de receita de `compareStrategies`). "Por Responsável" sempre mostrado;
"Por Origem" só se `fromRealData` (mais da metade dos negócios fechados com `leads.source`
preenchido) — sem service role key/sessão pra rodar uma query de verificação direta (RLS bloqueou
a chave anon disponível), a checagem de qualidade de dado virou parte do PRÓPRIO CÁLCULO em
runtime em vez de uma decisão minha tirada de uma foto de agora — mais robusto, sempre correto.

## §2/§4/§20 — Comercial como 3 abas (Overview/Commercial/Planning) — FEITO, os 5 passos

Desenho abaixo (registrado antes de codar) **aprovado pelo usuário sem mudanças**. Implementado
na ordem de risco crescente que o próprio desenho mapeou, cada passo com typecheck+build limpos:

1. ~~Aliases de URL~~ — **feito**. `?tab=crm` tratado como alias direto de `"commercial"`.
   `?tab=prospeccao`/`?tab=estrategias` fazem `redirect()` de verdade pra
   `?tab=commercial&panel=lists`/`&panel=strategies` (precisa ser redirect de verdade, não só
   tratar como alias silencioso — é o que garante que o parâmetro `panel` chega na URL que os
   Sheets leem via `useSearchParams()` pra abrir sozinhos).
2. ~~`CrmFilters` ganha filtro por Lista~~ — **já existia por completo**, correção ao desenho
   original: ao reler o componente antes de mexer, o filtro de Lista (dropdown, `?list=`) já
   estava implementado e funcionando (rodada anterior, ao mesmo tempo que renomear/excluir
   lista). Nenhuma mudança necessária — só confirmado via typecheck+build que os 3 filtros
   (Owner/Estratégia/Lista) continuam funcionando juntos sem regressão.
3. ~~2 `Sheet`s novos (Listas/Estratégias)~~ — **feito**. `components/comercial/
   lists-panel-sheet.tsx`/`strategies-panel-sheet.tsx` (novos) — `ProspeccaoView`/`StrategiesList`
   não foram tocados por dentro, só o container mudou de página pra drawer (`sm:max-w-xl`, mais
   largo que o padrão `sm:max-w-md` de `LeadDetailDrawer`, pra manter o grid de 2 colunas de
   cards legível). Ajuste de layout real, não copy-paste, como o próprio desenho já esperava.
4. ~~Growth swipe com 3 entradas~~ — **feito de graça**. `gestureTabs` deriva de `TABS`
   automaticamente (`app/(internal)/(growth)/comercial/page.tsx`) — reduzir `TABS` de 5 pra 3 já
   reduziu o swipe também, nenhuma mudança separada precisou ser escrita.

**Correção a uma afirmação anterior, achada NO MEIO deste trabalho, antes de qualquer dano**: a
rodada anterior identificou `components/prospeccao/views/overview-view.tsx` e `gestao-view.tsx`
como "código morto" (grep não achou uso em `app/`) e o usuário pediu pra apagar como limpeza de
graça. Ao investigar de novo (pedido explícito: "confirme com um grep final antes de apagar"), o
grep anterior estava incompleto — essas duas views são usadas por `ProspeccaoHub`, que é usado por
`ProspeccaoExperience`, que É a Central de Prospecção do **Client Hub** (`app/clients/[client]/
public/prospeccao/page.tsx`, rota `/clients/[client]/public/prospeccao`, confirmada ao vivo e
pré-renderizada no build) — escopo da outra sessão, nada a ver com o `ProspeccaoView` do ERP que
os 2 `Sheet`s novos reaproveitam (nomes parecidos, componentes completamente diferentes). **NADA
foi apagado.** Isso quase virou uma exclusão de código de produção da outra sessão baseada numa
verificação minha malfeita — registrado aqui como lembrete forte: `grep` só numa pasta (`app/`) não
basta pra provar "código morto", precisa seguir a cadeia de import até a rota de verdade.

5. ~~Conversão de `/comercial/estrategias/[id]` pra drawer~~ — **feito**, liberado depois do
   usuário testar manualmente os passos 1-4 em produção (filtros combinados, os 2 drawers, os 3
   aliases, o swipe — tudo confirmado). `components/comercial/strategy-detail-drawer.tsx` (novo)
   — mesmo conteúdo de sempre (StatTiles, funil, detalhes, cadência, editar), `Sheet` mais largo
   (`sm:max-w-2xl`) por ser o painel mais denso dos três. Aberto por `?strategyDetail=<id>` —
   **nome diferente de `?strategy=`** de propósito (esse já é o filtro de estratégia do CRM; usar
   o mesmo nome pros dois faria o filtro abrir o drawer por engano — achado ao implementar, corrigido
   antes de virar bug). Diferente de `?panel=`/`?import=1` (gatilhos de um tiro só, se auto-removem),
   `?strategyDetail=` fica na URL enquanto o drawer está aberto — preserva o deep-link que a rota
   própria tinha (F5 mantém o drawer aberto na mesma estratégia). A rota antiga virou só um
   `redirect()`. `components/comercial/strategy-detail-header.tsx` removido — única referência era
   a página que virou redirect, confirmado com grep (zero resultado) antes de apagar.

Desenho original (contexto, já executado acima):

**O que funde com o quê**: hoje `TABS` (`app/(internal)/(growth)/comercial/page.tsx`) tem 5 —
Visão Geral, CRM, Prospecção, Estratégias, Planejamento. Visão Geral e Planejamento já SÃO
"Overview"/"Planning", ficam como estão. CRM + Prospecção + Estratégias colapsam numa aba só,
"Commercial" — o Pipeline/List toggle (já existente em CRM) vira a view PRIMÁRIA; Listas de
prospecção e Estratégias deixam de ser abas próprias e viram FILTROS/painéis dentro dessa mesma
tela:
- `CrmFilters` (Owner/Estratégia, já existe) ganha um terceiro filtro por Lista — o `?list=` que
  hoje só existe como link de saída da Prospecção vira um filtro de primeira classe, visível.
- "Gerenciar listas" (import/renomear/excluir, hoje = a aba Prospecção inteira) vira um botão que
  abre um `Sheet` lateral (mesmo padrão de `LeadDetailDrawer`) com a grade de cards que já existe
  em `ProspeccaoView` — conteúdo idêntico, só o container muda de página-inteira pra drawer.
- "Estratégias" (lista + métricas por estratégia, hoje uma aba) vira outro botão/`Sheet` — mesmo
  raciocínio. O detalhe de UMA estratégia (`/comercial/estrategias/[id]`, hoje página própria com
  funil completo) também vira drawer, aberto por `?strategy=<id>` em vez de navegação de rota.

**Links/bookmarks existentes**: nenhum quebra.
- `?tab=crm` → passa a resolver pro branch "Commercial" (mesmo conteúdo, só o rótulo da aba muda
  visualmente) — sem redirect, só aceitar `"crm"` como alias de `"commercial"` na leitura do
  parâmetro.
- `?tab=prospeccao` → alias que resolve pro branch "Commercial" com o painel de Listas já aberto
  (`?tab=commercial&panel=lists`, mesmo mecanismo de `?import=1` que a Prospecção já ganhou nesta
  rodada).
- `?tab=estrategias` → mesma ideia, painel de Estratégias já aberto.
- `/comercial/estrategias/[id]` → redireciona pra `/comercial?tab=commercial&strategy=<id>`, que
  abre o drawer da estratégia sozinho ao montar.

**Growth swipe**: `GestureNav`/`gestureTabs` passam a ter 3 entradas em vez de 5 — mudança
mecânica (o array encolhe), nenhuma lógica nova; o swipe passa a bater exatamente com "Overview →
Commercial → Planning" do prompt original, sem trabalho extra.

**Risco real, por que isso é uma sessão própria**: `PipelineBoard`/`LeadsTable`/
`BulkActionsToolbar` não mudam por dentro, só onde são montados — baixo risco. O risco real está
em 3 lugares: (1) extender `CrmFilters` pra incluir Lista sem quebrar Owner/Estratégia que já
funcionam; (2) os dois `Sheet`s novos (Listas/Estratégias) reaproveitando conteúdo que hoje é
página inteira — layout/scroll dentro de um drawer é diferente de página, precisa de ajuste
visual real, não é copy-paste; (3) a conversão de `/comercial/estrategias/[id]` (rota própria,
link possivelmente já compartilhado/salvo por alguém) pra drawer é a mudança com maior chance de
efeito colateral não previsto — merece teste manual dedicado antes de ir pro ar, não só
typecheck+build limpos.

## Minimalismo — texto explicativo redundante em SectionHeader/PageHeader — FEITO (passada real)

Achado sistêmico, não 3 frases soltas: `description=` aparece 60 vezes só em `app/`. Critério
aplicado — mantém quando explica algo NÃO-óbvio (fórmula, comportamento não-visual, origem do
dado, aviso de limitação); corta quando só repete o título de outro jeito. `CardWithDetail`/
`ChartExpandDialog` (a descrição só aparece dentro do modal, sob demanda, nunca permanente) já
estavam no padrão certo — tratamento mais leve ali, só os tautológicos foram cortados.

~20 lugares mudados (não listados um a um aqui, só o padrão):
- **Comercial** — "CRM": descrição fixa removida ("soltar em Fechado abre onboarding" virou
  tooltip no próprio estágio Fechado do Kanban, `pipeline-board.tsx`, exatamente onde é
  relevante). "Fila de execução": fallback fixo removido (`ExecutionQueue` já tem o próprio empty
  state, eram duas frases pra mesma coisa) — contagem ao vivo mantida. "Planejamento": de 2
  frases pra 1 curta.
- **Home** — 9 descrições cortadas (todas tautológicas, `CardWithDetail`, modal-only mas ainda
  redundantes): Clientes Ativos, Equipe, Headcount, Ticket Médio, Churn, Valor Médio por Cliente,
  Pulso do Negócio (a nota que sobrava era dev-facing — "preparado pra virar IA no futuro" — não
  pertencia a texto de produto).
- **Workspace** — "Semana" cortada (instrução de uso de um checkbox, autoexplicativo);
  "Prioridades de X" mantida mas encurtada pro essencial (única frase que explica algo não-óbvio:
  por que ver tarefa de colega ali não é vigilância).
- **Financeiro** — A Receber/A Pagar (descrição só quando "Todas" selecionado — o toggle
  Pendentes/Todas já fala por si), Custos e Pipeline-em-negociação encurtados (mantido o aviso
  importante de nunca somar ao MRR).
- **Configurações/Usuários** — PageHeader encurtado, mantida só a parte não-óbvia (onde convidar).

**Não editado, fora do meu escopo** (`app/(internal)/operacao/**`): mesmo padrão encontrado em
Conteúdo/Projetos/Entregas/Equipe/Produção (PageHeader repetindo o título) — reportado aqui pra
outra sessão decidir, não corrigido.

## Próximo passo exato pra quem retomar

1. **Usuário precisa testar o bug de tarefa sem data** (rodada anterior) em produção e confirmar
   — sem essa confirmação, não considerar esse item fechado só porque o código parece correto.
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
