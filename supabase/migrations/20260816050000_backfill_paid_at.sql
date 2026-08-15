-- Achado ao verificar a correção anterior (agosto/2026): TODA linha de `revenue` com
-- `status='pago'` criada pelo seed de dados reais tinha `paid_at` NULL — a data exata do
-- pagamento não tinha sido informada, e o cuidado de "não inventar data" foi aplicado ao campo
-- errado. `due_date` já era a melhor referência disponível pra essas linhas (contrato pontual
-- pago integralmente, parcela paga na data do contrato) — mas `paid_at` é o campo que
-- `lib/dashboard/executive-metrics.ts` usa pra "receita realizada" (KPIs, sparkline, ritmo do
-- mês) no Home. Resultado prático: toda receita já recebida ficava invisível nesses painéis,
-- em qualquer mês — a causa real de "fluxo de caixa errado, tudo errado".
update public.revenue
set paid_at = due_date
where status = 'pago' and paid_at is null;
