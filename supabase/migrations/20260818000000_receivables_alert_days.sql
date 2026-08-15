-- Retomada pós-pausa, item 1 do Passo 1 — janela de "conta a receber vencendo em N dias"
-- (automação §72 regra 3) estava fixa em código (`UPCOMING_RECEIVABLES_WINDOW_DAYS = 5`,
-- `lib/financeiro/queries.ts`). Configurável agora — mesmo padrão de `financial_rules.
-- operational_percentage` (tabela de config de 1 linha já existente), sem criar um sistema de
-- settings genérico só pra isto.
alter table public.financial_rules
  add column receivables_alert_days integer not null default 5 check (receivables_alert_days > 0);
