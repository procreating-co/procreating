# Portal do Cliente — Fase B: auditoria e plano técnico

> **Status: planejamento, aguardando aprovação. Nenhum código, migration, deploy ou commit foi feito.**
> Este documento não está commitado — arquivo local para revisão, seguindo a mesma convenção de
> `docs/architecture.md`/`docs/roadmap.md` (planejamento vive em `docs/`, implementação vem depois,
> separada).

---

## 1. Estado atual

O ERP (`app/(internal)/**`, minha sessão) tem dado real de clientes, contratos e produção,
conectado ao Supabase, com RLS corrigida na Fase A. O que hoje é chamado de "workspace do
cliente" em `/clients/[client]/(workspace)/**` **não é isso** — é um conceito diferente, legado,
estático, de outra sessão (ver seção 2).

Resumo por área auditada:

| Área | Estado real |
|---|---|
| `clients`, `contracts`, `production_projects`, `production_items` | **Real**, Supabase, RLS da Fase A já protege (staff full, portal read-only próprio cliente) |
| `client_contacts`, `client_onboarding` | Real, Supabase, sem RLS específica de Portal ainda (não estavam no escopo da Fase A) |
| `client_portal_users`, `client_portal_config` | Criadas na Fase A, **vazias** — zero usuário de portal existe hoje |
| Autenticação de staff (`lib/admin/auth`) | Real, Supabase Auth, cookie próprio, gate em `proxy.ts` + validação em `app/(internal)/layout.tsx` |
| Autenticação de cliente | **Não existe** |
| Storage de vídeo/foto | **Mock em memória** (`lib/storage/mock-provider.ts`) — não persiste, reseta a cada deploy. R2 real citado em `docs/r2.md` mas sem credencial no projeto; upload é manual via painel Cloudflare |
| Fotos | Arquivos estáticos commitados em `public/gallery/<slug>/` — só existem pastas para `pascoal` e `elenita` |
| `/clients/[client]/(workspace)/**` (fotos/vídeos/conteúdos/entregas/projetos) | Existe, mas é **estático**, 3 clientes fictícios (`pascoal`, `elenita`, `cliente-x`), conceito de "site/apresentação" (template Landing Page/Portfolio, status Published/Draft/Archived) — **não tem nenhuma relação com `production_items`/`contracts`** |
| `/clients/[client]/public/**` (proposta/galeria/prospecção) | Site público legado, estático, fora de escopo (Page-Builder-adjacent, congelado) |
| Resultados de marketing (views, engajamento, leads gerados) | **Não existe nenhuma tabela/coluna para isso** |
| `revenue` (financeiro) | Real, mas é dinheiro que o cliente paga — não é "resultado" no sentido que o pedido descreve, e é dado sensível hoje mascarado por `canViewFinancials`/`canViewFinancialsMasked` |

## 2. Arquitetura existente

```
┌─ ERP interno (minha sessão) ────────────────────────────────┐
│ app/(internal)/**  →  proxy.ts gate  →  lib/admin/auth       │
│  clients ← contracts, production_projects ← production_items │
│  lib/operacao/queries.ts (join manual TS, sem embed)         │
│  lib/clientes/queries.ts (getClientFull, por staff)          │
└────────────────────────────────────────────────────────────┘

┌─ Client delivery / Page-Builder (outra sessão, "Chat A") ───┐
│ app/clients/[client]/public/**   → site público legado       │
│ app/clients/[client]/(workspace)/** → "workspace" de SITE    │
│   (Published/Draft/Archived — rastreia entrega de site,      │
│    não produção real) — lib/clients/workspace-registry.ts,   │
│    estático, 3 entradas fictícias                            │
│ Page-Builder (projects/templates/...) — CONGELADO            │
│   (docs/project-creation.md, "Architecture Freeze")          │
└────────────────────────────────────────────────────────────┘

┌─ Fundação Fase A (pronta, não consumida por nenhum código) ─┐
│ client_portal_users, client_portal_config                    │
│ is_active_staff(), is_portal_member_of(), get_client_        │
│   portal_profile() — SECURITY DEFINER, testados, em produção │
└────────────────────────────────────────────────────────────┘
```

O Portal do Cliente (Fase B) é um **quarto bloco**, novo, que não existe ainda em nenhuma forma —
não é uma extensão do workspace estático, não é o site público, não é o Page-Builder. Consome a
fundação da Fase A e os dados reais do ERP, mas mora em rotas/arquivos próprios.

## 3. O que pode ser reaproveitado

**Padrões de código (reaproveitar a ideia, reescrever no namespace novo):**
- `lib/admin/auth` — o padrão `AuthProvider` (interface + `getSession`/`signIn`/`signOut`,
  cookie próprio, `proxy.ts` faz gate rápido por cookie + validação real no layout) é exatamente
  o que a sessão de cliente precisa, espelhado, nunca importado direto (sessão de staff e de
  cliente não podem se misturar).
- `lib/operacao/queries.ts` — padrão de join manual em TypeScript (sem embed do PostgREST) já
  validado pra `production_items`/`production_projects`; a query do Portal segue o mesmo padrão.
- `lib/operacao/types.ts` (`PRODUCTION_ITEM_STATUS_PRESETS`, `PRODUCTION_ITEM_KIND_LABEL`) —
  vocabulário de status já existe e é exatamente o que descreve "em produção/aguardando
  aprovação/entregue" — reaproveitar os *valores*, não reinventar rótulos novos.
- `docs/r2.md` (convenção de pasta `clients/<slug>/<categoria>/...`) — mesmo se a Fase B4 optar
  por Supabase Storage em vez de R2 (ver seção 11), a convenção de prefixo por cliente é boa e
  reaproveitável.

**Referência visual (olhar, não importar — pertence à outra sessão):**
- `components/gallery/**` (lightbox, lock screen, hint de digitação) — melhor exemplo de UX
  "premium" já existente no repo. Útil como inspiração de tom, não como import direto.
- `components/workspace/**` (`workspace-overview.tsx`, `workspace-stat-grid.tsx`,
  `workspace-progress.tsx`) — cards de progresso e resumo, mesmo raciocínio: referência visual.

**Não reaproveitável (não é o mesmo conceito, mesmo com nome parecido):**
- `app/clients/[client]/(workspace)/**` inteiro — rastreia entrega de *site*, não de produção.
- `components/operacao/production-items-table.tsx` — tabela densa, estilo ERP; o pedido explícito
  foi "não um dashboard cheio de informações irrelevantes" — o oposto do que essa tabela é.

## 4. Gaps

Por ordem de impacto no piloto:

1. **Zero dado de produção para os 2 pilotos** (`production_projects`/`production_items` = 0
   linhas para Kawhen e Bruna). A tela mais importante pedida ("Entregas") não tem nada para
   mostrar até isso ser preenchido pelo time, via `/operacao` (que já é real). **Isto é o maior
   bloqueador do plano inteiro** — não é código, é dado.
2. **Storage não é real.** Nenhum vídeo/foto de Kawhen ou Bruna existe em lugar nenhum do
   projeto (nem `public/gallery/`, nem `data/`, nem referência a R2). `lib/storage` é mock.
   Decisão de arquitetura pendente (seção 11).
3. **`production_items` não tem coluna de arquivo/anexo.** Mesmo com storage resolvido, a tabela
   hoje é só `kind/title/status_label/status_tone` — não referencia nenhum asset. Precisa de
   schema novo (fora do escopo de hoje, só identificado).
4. **Nenhuma métrica de resultado de marketing existe no banco.** Só `revenue` (financeiro,
   fora do primeiro foco). "Resultados" como pedido (o que a agência entregou de valor) não tem
   fonte de dado — proponho não inventar, e reduzir o escopo inicial ao que é derivável de dado
   real (contagem de entregas concluídas).
5. **Nenhuma autenticação de cliente existe.** Zero linha de código, zero rota, zero cookie.
6. **Nenhuma UI de staff para conceder acesso de Portal.** `client_portal_users` só pode ser
   escrita hoje via SQL direto — falta uma tela para o time convidar um contato.
7. **A pendência da Fase A** (funções `SECURITY DEFINER` novas com `EXECUTE` também para `anon`,
   inofensivo hoje porque `auth.uid()` resolve `NULL`, mas deveria ser fechada antes de existir
   login real de cliente — ver relatório da Fase A).

## 5. Kawhen — diagnóstico

| Campo | Valor |
|---|---|
| Existe em `clients`? | Sim — `d0de4b99-142e-46b7-a40c-3caacc23c7f4` |
| Slug | `kawhen` |
| Nome | Kawhen Confecções e Transportes LTDA |
| Status | `ativo` |
| Segmento | Confecções e Transportes |
| Cidade/UF | Porto Alegre / RS |
| `project_stage` | `null` (campo do funil Projeto→Recorrente, não usado para clientes já recorrentes) |
| Contratos | 1 — `recorrente`, `ativo`, desde **2024-12-01**, R$ 2.200/mês, categoria `recorrente_ativo` (o contrato mais antigo entre os clientes recorrentes reais do sistema) |
| `production_projects` | **0 linhas** |
| `production_items` | **0 linhas** |
| Dados de resultado disponíveis | Nenhum (nem produção, nem métrica de marketing). `revenue`: 20 lançamentos pagos, R$ 44.000 total, dez/2024–ago/2026 — é financeiro, não "resultado" |
| Assets (vídeo/foto) | Nenhum em nenhum lugar do projeto |
| Contatos | 1 — Pedro Garbin Susin, `contato@kawhen.com.br` (principal) |
| `client_onboarding` | 0 linhas |
| Config de portal | Nenhuma (`client_portal_config`/`client_portal_users` vazias) |
| O que já poderia aparecer hoje | Nome, status, cidade/segmento, contrato ativo desde dez/2024, contato |
| O que está faltando | Tudo de produção/entregas/conteúdo/vídeo/foto/resultado — zero dado real além de identidade + contrato |

## 6. Bruna Montenegro — diagnóstico

| Campo | Valor |
|---|---|
| Existe em `clients`? | Sim — `ac9e276c-5bf9-412b-b9fc-1cd46bd6cd56` |
| Slug | `bruna-montenegro` |
| Nome | Bruna Gonçalves Montenegro |
| Status | `ativo` |
| Segmento | Advocacia / Jurídico |
| Cidade/UF | Porto Alegre / RS |
| `project_stage` | `null` |
| Contratos | 2 — um encerrado (2026-04-02 a 2026-07-02, `recorrente_renovado`) + um ativo desde **2026-07-02**, R$ 3.000/mês, `recorrente_ativo`. É uma **renovação**, não um churn (confirmado por `docs/execution-status.md`, bug real já corrigido no ERP) |
| `production_projects` | **0 linhas** |
| `production_items` | **0 linhas** |
| Dados de resultado disponíveis | Nenhum. `revenue`: 5 lançamentos pagos, R$ 15.000 total, abr–ago/2026 |
| Assets (vídeo/foto) | Nenhum |
| Contatos | 1 — a própria Bruna, `brunamontenegro.adv@gmail.com`, WhatsApp `(51) 98530-1470` (principal) |
| `client_onboarding` | 0 linhas |
| Config de portal | Nenhuma |
| O que já poderia aparecer hoje | Nome, status, cidade/segmento, contrato ativo desde jul/2026 (+ histórico de renovação), contato |
| O que está faltando | Mesmo gap de Kawhen — produção/entregas/conteúdo/vídeo/foto/resultado zerados |

**Nenhum dado foi inventado nas duas tabelas acima** — cada linha vem de uma query real rodada
contra produção durante esta auditoria.

## 7. Arquitetura proposta

```
auth.users
 ├── staff  → public.users            (inalterado, Fase A)
 └── client → client_portal_users → clients   (Fase A, agora consumido)

app/portal/[slug]/**          ← NOVO, meu namespace, nunca /clients/**
 ├── layout.tsx                 → valida sessão de portal + slug pertence à sessão
 ├── page.tsx                   → Overview (Fase B3)
 ├── entregas/page.tsx          → Fase B4
 ├── conteudos/page.tsx         → Fase B5 (depende de storage)
 └── (resultados/page.tsx)      → Fase B6, escopo mínimo

lib/portal/**                 ← NOVO
 ├── auth/                      → espelha lib/admin/auth, cookie e rota próprios
 ├── resolver.ts                → chama get_client_portal_profile() via supabase.rpc()
 └── queries.ts                 → lê contracts/production_projects/production_items
                                    (RLS já filtra; client_id explícito por defesa em profundidade)

components/portal/**          ← NOVO, visual próprio, não importa components/workspace ou
                                  components/client-hub
```

Nenhuma cópia paralela de dado do ERP — toda leitura do Portal passa pelas mesmas tabelas
(`clients`/`contracts`/`production_projects`/`production_items`), nunca por uma tabela espelho.
`production_projects` do ERP nunca é confundido com `projects` do Page-Builder — não há nenhuma
referência cruzada entre eles em nenhuma fase deste plano.

## 8. Fluxo de autenticação

1. Staff, em uma tela nova (Fase B2, dentro do ERP), digita o e-mail do contato do cliente e
   escolhe "conceder acesso ao Portal".
2. Server Action (rodando com `service_role`, como já se faz em `close_lead_and_create_client`)
   cria o usuário no Supabase Auth (convite por e-mail — Supabase Auth já tem
   `inviteUserByEmail`/magic link nativo, não precisa reinventar) e insere a linha em
   `client_portal_users` (`client_id`, `auth_user_id`, `is_active=true`).
3. Cliente recebe e-mail, define senha (ou usa magic link, a decidir — ver seção de decisões em
   aberto), acessa `/portal/login`.
4. `lib/portal/auth` autentica via Supabase Auth (mesma instância, cookie **diferente** do
   staff), busca via `is_portal_member_of`/uma consulta a `client_portal_users` qual(is)
   `client_id` essa sessão pode ver, resolve o slug correspondente.
5. `/portal/[slug]/layout.tsx` confirma que o slug da URL bate com o `client_id` da sessão —
   **camada de app em cima da RLS**, não substituindo — se não bater, `notFound()` (mesmo padrão
   já usado em `(workspace)/layout.tsx` para slug desconhecido), nunca um redirect que revele que
   o slug existe.
6. `proxy.ts` ganha uma entrada nova no `matcher` (`/portal/:path*`) com gate rápido por cookie
   próprio — **não adiciona nada ao gate existente de `/admin`/`(internal)`, não toca
   `/clients/**`**.

## 9. Fluxo de dados

```
Cliente autenticado → lib/portal/queries.ts
  → supabase.rpc('get_client_portal_profile', { p_slug })     (Fase A, já existe)
  → supabase.from('contracts').select(...).eq('client_id', id) (RLS: is_portal_member_of)
  → supabase.from('production_projects')...
  → supabase.from('production_items')...
```

Toda query tem dupla proteção: RLS no banco (Fase A, testada) **e** `client_id` explícito vindo
da sessão resolvida no passo 8.5 acima (defesa em profundidade — mesmo raciocínio já usado no
`get_client_portal_profile`, que resolve slug→id e checa posse no mesmo `WHERE`).

## 10. Estrutura da experiência do cliente

Uma tela por conceito, não um dashboard denso:

1. **Overview** — nome do projeto/cliente, status geral em uma frase, contrato ativo desde
   quando (sem valor em R$ nesta fase).
2. **Entregas** — lista agrupada por status (usando os presets já existentes:
   Roteiro/Em produção/Edição/Revisão/Concluído para `producao`; Em produção/Em
   revisão/Aguardando aprovação/Aprovado/Entregue para `entrega`; Planejado/Em
   produção/Publicado para `conteudo`) — resposta direta a "o que já foi entregue / o que está
   em andamento / o que está aguardando".
3. **Conteúdos/Vídeos/Fotos** — bloqueado até a decisão de storage (seção 11).
4. **Resultados** — escopo mínimo nesta fase: contagem de entregas concluídas no período,
   nada inventado.
5. *(Futuro, fora do piloto)* Financeiro/Contratos com valor, aprovação, chat, notificações.

## 11. Plano de implementação por fases

### FASE B0 — Backfill de dado real (não é código)
- **Objetivo:** Kawhen e Bruna terem `production_projects`/`production_items` reais.
- **Arquivos:** nenhum — uso da tela `/operacao` já existente e real.
- **Tabelas:** `production_projects`, `production_items`.
- **Impacto no ERP/Portal:** nenhum código muda; é a pré-condição de dado para a Fase B4.
- **Risco:** sem isso, a Fase B4 fica vazia mesmo depois de pronta.
- **Critério de conclusão:** pelo menos 1 `production_project` e alguns `production_items` reais
  por cliente-piloto, cadastrados pelo time.

### FASE B1 — Fundação técnica do Portal
- **Objetivo:** rota, layout, sessão de cliente, resolver seguro — zero tela de conteúdo além de
  "olá, {nome}".
- **Arquivos:** `app/portal/**` (novo), `lib/portal/auth/**` (novo), `lib/portal/resolver.ts`
  (novo), `proxy.ts` (+1 entrada no `matcher`).
- **Tabelas:** `client_portal_users`, `clients` (via `get_client_portal_profile`).
- **Componentes reaproveitados:** padrão `AuthProvider`/cookie/gate de `lib/admin/auth` +
  `proxy.ts` (replicado, não importado).
- **Novas tabelas:** nenhuma.
- **Migrations:** nenhuma nova — mas recomendo fechar a pendência da Fase A (`revoke execute ...
  from anon` nas 3 funções) **antes** desta fase ir ao ar, já que é aqui que login real passa a
  existir.
- **Impacto no ERP:** zero. **Impacto no Portal:** é toda a fundação.
- **Riscos:** sessão de staff vazando pro Portal ou vice-versa — mitigar com cookies/paths
  totalmente distintos e teste explícito nos dois sentidos.
- **Dependências:** Fase A concluída (está).
- **Como testar:** criar 1 usuário de teste via SQL direto (sem UI ainda), logar, confirmar que
  vê só o próprio slug, que staff não abre `/portal/**`, que portal não abre `/operacao/**`.
- **Critério de conclusão:** login funcional, isolamento de sessão confirmado nos dois sentidos.

### FASE B2 — Staff concede acesso de Portal
- **Objetivo:** tela real (dentro do ERP, provavelmente em `/clientes/[id]`) para convidar um
  contato como usuário de Portal.
- **Arquivos:** novo componente em `components/clientes/**` (ex.: `portal-access-section.tsx`),
  nova Server Action em `lib/clientes/**`.
- **Tabelas:** `client_portal_users` (insert), Supabase Auth (invite).
- **Novas tabelas:** nenhuma, se o convite for direto (Admin API `inviteUserByEmail`); **uma
  nova** (`client_portal_invites`, espelhando `team_invites`) só se decidirmos por convite via
  link/token em vez de e-mail nativo do Supabase — decisão em aberto (seção final).
- **Impacto no ERP:** uma seção nova numa página existente (`/clientes/[id]`) — édição de
  arquivo dentro do meu escopo, não toca `/clients/**`.
- **Riscos:** e-mail de convite falhar silenciosamente — precisa de feedback de erro real na UI.
- **Dependências:** B1.
- **Como testar:** staff convida o e-mail real de Kawhen/Bruna, confirmar linha em
  `client_portal_users`, confirmar e-mail chega.
- **Critério de conclusão:** staff cria acesso pelos 2 pilotos sem tocar SQL.

### FASE B3 — Overview
- **Objetivo:** primeira tela real de conteúdo.
- **Arquivos:** `app/portal/[slug]/page.tsx`, `components/portal/overview/**`.
- **Tabelas:** `clients` (via RPC), `contracts` (sem valor em R$).
- **Migrations:** nenhuma.
- **Riscos:** nenhum novo além dos já listados.
- **Dependências:** B1.
- **Como testar:** comparar com os diagnósticos das seções 5/6 — deve bater exatamente.
- **Critério de conclusão:** Overview 100% real para os 2 pilotos.

### FASE B4 — Entregas
- **Objetivo:** a tela central pedida.
- **Arquivos:** `app/portal/[slug]/entregas/page.tsx`, `lib/portal/queries.ts`
  (`getPortalProductionItems`), `components/portal/entregas/**`.
- **Tabelas:** `production_items`, `production_projects`.
- **Migrations:** nenhuma (schema já suficiente para status/rótulo — não para anexo, ver gap 3).
- **Riscos:** **bloqueado por B0.** Sem dado real, tela fica vazia.
- **Dependências:** B0, B1, B3.
- **Como testar:** inserir um item de teste, mudar status em `/operacao`, confirmar reflexo
  imediato no Portal (mesma tabela, sem cache divergente).
- **Critério de conclusão:** cliente piloto entende em poucos segundos o que está em andamento/
  entregue, com dado real.

### FASE B5 — Conteúdos/Vídeos/Fotos
- **Objetivo:** cliente ver arquivos reais.
- **Bloqueado por decisão de storage** (ver "decisões em aberto" ao final) — Supabase Storage
  (recomendado) vs. conectar R2 de verdade.
- **Arquivos:** depende da decisão; inclui, no mínimo, `lib/portal/assets.ts` novo.
- **Novas tabelas:** provavelmente `production_item_assets` (title, storage key, kind,
  production_item_id) — **migration nova, fora do escopo de hoje**, só identificada.
- **Riscos:** maior risco técnico do plano — infraestrutura de storage nunca foi decidida de
  verdade neste projeto (`lib/storage` é mock desde sempre).
- **Dependências:** B0 (para ter algo pra anexar), decisão de storage.
- **Critério de conclusão:** ao menos 1 vídeo e 1 foto reais visíveis por cliente-piloto.

### FASE B6 — Resultados
- **Objetivo:** seção "Resultados", escopo mínimo e honesto.
- **Arquivos:** `app/portal/[slug]/resultados/page.tsx` (ou seção dentro do Overview).
- **Tabelas:** deriva de `production_items` (contagem de concluídos) — nenhuma métrica nova
  inventada.
- **Gap registrado, não resolvido nesta fase:** métricas de marketing (views/engajamento/leads)
  não têm fonte de dado — precisa de decisão de produto antes de qualquer migration.
- **Critério de conclusão:** seção existe, mostra só número real.

### FASE B7 — Fora do escopo do piloto (explicitamente adiado)
Financeiro/contratos com valor, aprovação de conteúdo, edição pelo cliente, chat, notificações —
nenhum destes é tocado nesta rodada, por pedido explícito.

## 12. Migrations necessárias

| Fase | Migration |
|---|---|
| B1 | Nenhuma nova. Recomendado fechar a pendência da Fase A (`revoke execute on function is_active_staff(), is_portal_member_of(uuid), get_client_portal_profile(text) from anon`) antes do primeiro login real. |
| B2 | Nenhuma, se convite for via Supabase Auth nativo. Uma (`client_portal_invites`) se optarmos por convite via token próprio. |
| B3 | Nenhuma. |
| B4 | Nenhuma. |
| B5 | Uma ou mais: bucket de Storage + RLS de `storage.objects`, possivelmente tabela `production_item_assets`. |
| B6 | Nenhuma no escopo mínimo. |

## 13. Arquivos que serão modificados

**Novos, sem tocar nada existente:** `app/portal/**`, `lib/portal/**`, `components/portal/**`.

**Existentes, edição pontual e pequena:**
- `proxy.ts` — uma linha no array `matcher`.
- `app/(internal)/(growth)/clientes/[id]/page.tsx` e `components/clientes/**` — nova seção "Acesso
  ao Portal" (Fase B2). Fica dentro do meu escopo (ERP), não é `/clients/**`.

## 14. Arquivos que NÃO devem ser modificados

- `app/clients/**`, `components/client-hub/**` inteiros — escopo exclusivo de outra sessão.
- `lib/clients/**` (`resolver.ts`, `registry.ts`, `workspace-registry.ts`, `provider.ts`) — idem.
- `components/workspace/**`, `components/gallery/**` — idem (referência visual apenas).
- `data/**`, `content/clients/**` — registries estáticos legados, preservados intactos.
- Page-Builder: `projects`, `templates`, `project_versions`, `deployments`, `assets` (tabelas e
  qualquer código associado) — congelado, confirmado por `docs/project-creation.md`.
- `lib/admin/auth/**` — sessão de staff, só leio como referência, nunca edito.

## 15. Estratégia de rollback

Fase B é aditiva por natureza (rota nova, não uma modificação de rota existente) — o rollback
mais simples de todo este plano: **a rota `/portal/**` não é linkada de nenhum lugar existente**
até ser anunciada, então pode ser testada em produção diretamente por URL antes de qualquer
exposição. Reversão por fase:
- B1/B2/B3/B4/B6: `git revert`/deletar os arquivos novos — nada compartilhado é tocado.
- B5 (única com migration real): mesma disciplina da Fase A — branch/transação de teste
  primeiro (branch real, se o plano nesse meio-tempo já tiver Pro; senão, mesmo método
  `BEGIN…ROLLBACK` usado na Fase A), rollback de policy documentado antes de aplicar.

## 16. Riscos

1. **Zero dado real de produção nos pilotos** — mitigado por B0, mas é um risco de prazo (depende
   do time preencher, não de código).
2. **Storage nunca foi decidido de verdade neste projeto** — maior risco técnico, bloqueia B5.
3. **Confusão de escopo com `/clients/**`** — mitigado por namespace `/portal/**` totalmente
   separado e por esta seção 14.
4. **Vazamento de sessão staff↔portal** — mitigado por cookies/paths distintos, testado
   explicitamente em B1.
5. **Pendência de segurança da Fase A** (grant a `anon`) — hoje inofensiva, deveria ser fechada
   antes do primeiro login real (recomendado abrir junto de B1).
6. **Métrica de "Resultados" sem fonte de dado** — mitigado reduzindo o escopo ao que é real
   (B6), decisão de produto adiada explicitamente.

## 17. Critérios de aceite (piloto completo)

- Kawhen e Bruna conseguem logar em `/portal/<slug>` com conta própria.
- Cada um vê **somente** seus próprios dados — testado nos dois sentidos, não só via RLS
  (camada de app também).
- Staff não perde nenhuma capacidade existente.
- Nenhum dado ou métrica foi inventado — tudo que aparece é rastreável a uma linha real do
  banco, com gap explícito onde não há dado.
- `/clients/**`, Page-Builder e `lib/admin/auth` seguem intocados.

## 18. Ordem recomendada de execução

```
B0 (backfill de dado, pode começar já — zero código)
 └→ fechar pendência anon da Fase A (migration pequena)
     └→ B1 (fundação técnica)
         └→ B2 (staff concede acesso)
             └→ B3 (Overview)
                 └→ B4 (Entregas — precisa de B0 ter rodado)
                     └→ decisão de storage → B5 (Conteúdos)
                         └→ B6 (Resultados, escopo mínimo)
                             ⇥ B7 fica pra depois do piloto, com feedback real de Kawhen/Bruna
```

---

## Decisões em aberto — preciso da sua aprovação explícita antes de tocar em código

1. **Storage (B5):** Supabase Storage (recomendado — mesma base já aprovada na Fase A, RLS
   nativa) vs. conectar R2 de verdade (mais alinhado ao plano documentado em `docs/r2.md`, mas
   decisão de infra fora do que foi aprovado até aqui).
2. **Convite de cliente (B2):** e-mail nativo do Supabase Auth (`inviteUserByEmail`, sem tabela
   nova) vs. tabela própria `client_portal_invites` espelhando `team_invites` (mais controle, mais
   trabalho).
3. **"Entregas" — uma tela unificada (3 `kind` juntos, agrupados por status) ou 3 abas** espelhando
   `/operacao` (Produção/Entregas/Conteúdo separados)? Recomendo tela única — o pedido foi
   explicitamente "não um dashboard cheio de informações irrelevantes".
4. **Fechar a pendência de `anon` da Fase A** antes de B1 — confirmo que é uma migration pequena e
   isolada, não expande escopo desta fase, só recomendo o momento.

Nada disso foi implementado. Aguardando sua revisão.
