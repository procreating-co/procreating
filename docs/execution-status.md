# Procreating OS — estado de execução (master prompt §1-87)

Documento de retomada — escrito porque a sessão que fez este trabalho está perto do limite de
uso semanal (94% no momento da escrita) e a próxima janela só abre em ~2 dias. Se você é uma
sessão nova retomando isto, comece por aqui antes de reler o histórico inteiro.

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
- **Automação §72 — regras 1, 2 e 3** (ver seção própria abaixo, é o trabalho desta rodada).
- **`.env.example`** — `ANTHROPIC_API_KEY` documentada (sem valor), decisão de modelo já
  registrada (Claude API), integração NÃO escrita (ver seção IA abaixo).

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
  (`status='pendente'` com `due_date` dentro de `UPCOMING_RECEIVABLES_WINDOW_DAYS` = **5 dias,
  fixo**).
- **Pendência real, não escondida**: a janela de N dias deveria ser configurável (pedido
  explícito) — hoje é uma constante (`UPCOMING_RECEIVABLES_WINDOW_DAYS` em
  `lib/financeiro/queries.ts`). Não construí UI de configuração pra isso nesta rodada (não cabia
  no tempo restante sem risco) — **próximo passo exato**: adicionar um campo em
  `configuracoes/regras-financeiras` (mesmo padrão de `financial_rules`/`operational_percentage`
  já existente) e trocar a constante por uma leitura desse valor.
- Aparece em dois lugares: StatTile "Vence nos próximos 5 dias" em `/financeiro`, e um item na
  lista "Atenção" do Dashboard (`lib/dashboard/executive-metrics.ts`, `kind: "upcoming_revenue"`,
  clicável, mostra a lista real por trás do número).

## Growth como carrossel com swipe (§1-2, §45-47) — ADIADO, nada tocado

Decisão tomada (não minha, veio explícita): é reestruturação de arquitetura de navegação
(sidebar+abas → swipe entre Overview/Commercial/Planning), risco real de quebrar a navegação
principal do Comercial se ficar pela metade. Não comecei nenhuma linha disso. Precisa de uma
sessão dedicada, com folga de uso pra terminar inteiro numa sentada — não é um incremento de
fim de sessão.

## IA contextual (§73-74) — preparado, não implementado

Modelo decidido: **Anthropic (Claude API)**. `ANTHROPIC_API_KEY` documentada em `.env.example`
(sem valor) — confirmado com `grep -rn ANTHROPIC --include="*.ts" --include="*.tsx" .`: zero
resultados, nenhum arquivo de código lê essa variável ainda. O orquestrador de IA em si **não
foi escrito nesta sessão, de propósito** — depende de RBAC real existir primeiro: hoje
`users.role` é decorativo (sem
enforcement nenhum no código), e dar uma camada de IA acesso a dado sensível (financeiro,
contratos, dados de cliente) sem controle de permissão real seria construir em cima de uma base
que ainda falta. **Próximo passo exato, nesta ordem**: (1) RBAC real primeiro, (2) só depois o
orquestrador de IA.

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

Por ordem de valor/risco, do mais seguro pro mais arriscado:
1. Janela configurável da automação de contas a receber (pendência real desta rodada, pequena).
2. RBAC real (`users.role` com enforcement) — pré-requisito da IA, item concreto e bem definido.
3. Orquestrador de IA (Claude API) — só depois do RBAC.
4. Growth como carrossel com swipe — só numa sessão dedicada inteira a isso.
