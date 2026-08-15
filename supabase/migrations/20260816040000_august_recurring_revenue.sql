-- Fluxo de caixa "zerado" em agosto/2026 apesar do MRR de R$10.900 confirmado — causa: os 3
-- contratos `recorrente_ativo` (Kawhen, Maria Tabarez, Bruna) nunca tiveram uma linha de
-- `revenue` gerada pra agosto (o seed de dados reais só criava `revenue` onde havia uma
-- afirmação explícita de pagamento — nenhuma existia ainda pro mês corrente na época). Usuário
-- confirmou agora, em 15/08/2026: cobrança sempre no dia 05, e as 3 mensalidades de agosto (mais
-- o pontual da Maria das Graças, que já estava correto) já foram recebidas.
--
-- Corrige `due_day` pros 2 contratos que estavam sem essa informação (Bruna e Maria Tabarez —
-- Kawhen já tinha `due_day=5` corretamente) e grava a cobrança de agosto como paga pros 3.
-- Idempotente (`where not exists`).
do $$
declare
  v_client_id uuid;
  v_contract record;
begin
  update public.contracts set due_day = 5
  where category = 'recorrente_ativo' and due_day is null;

  for v_contract in
    select ct.id as contract_id, ct.client_id, ct.monthly_value
    from public.contracts ct
    where ct.category = 'recorrente_ativo'
  loop
    if not exists (
      select 1 from public.revenue
      where contract_id = v_contract.contract_id and due_date = '2026-08-05'
    ) then
      insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
      values (v_contract.client_id, v_contract.contract_id, 'Mensalidade 08/2026', v_contract.monthly_value, '2026-08-05', 'pago', '2026-08-05');
    end if;
  end loop;
end $$;
