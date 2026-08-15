-- Correção do dashboard financeiro — parte 2/2: dados. Corrige o seed anterior
-- (`20260815050000_real_data_seed.sql`) onde a descrição mais precisa da realidade atual
-- (dada pelo usuário nesta rodada) diverge do que foi modelado antes — regra 5 de sempre:
-- o estado atual informado agora prevalece sobre o dado anterior, que vira histórico corrigido,
-- nunca duas versões conflitantes convivendo. Idempotente (delete+insert determinístico ou
-- `where not exists`/`on conflict` — rodar 2x converge no mesmo estado, nunca duplica).

do $$
declare
  v_santiago_id uuid;
  v_client_id uuid;
  v_contract_id uuid;
begin
  select id into v_santiago_id from auth.users where email = 'martins.santiago08@gmail.com';
  if v_santiago_id is null then
    raise exception 'Usuário martins.santiago08@gmail.com não encontrado.';
  end if;

  -- ================================================================
  -- 1. KAWHEN — não são 2 contratos (original de 3 meses + continuidade não confirmada), é UM
  -- contrato recorrente contínuo desde 01/12/2024, ainda ativo hoje. Abril/2026 é uma mensalidade
  -- em atraso — não é "a receber" (o usuário instruiu deixar a receber zerado, essas mensalidades
  -- não vão ser cobradas retroativamente) e não deve inflar o "ganho histórico" do cliente — por
  -- isso vira só uma nota narrativa, nunca uma linha de `revenue` com status pendente/atrasado.
  -- ================================================================
  select id into v_client_id from public.clients where slug = 'kawhen';

  update public.contracts
  set status = 'ativo', end_date = null, category = 'recorrente_ativo'
  where client_id = v_client_id and start_date = '2024-12-01';

  delete from public.events where entity_type = 'client' and entity_id = v_client_id and type = 'relationship_note';
  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('client', v_client_id, v_santiago_id, 'relationship_note', jsonb_build_object(
    'note', 'Contrato recorrente único e contínuo desde 01/12/2024 (R$2.200/mês), sem interrupção — ativo até hoje. Abril/2026: mensalidade não recebida — tratada como perda (write-off), não como valor a receber; não soma em "a receber" nem no total histórico gerado pelo cliente.'
  ));

  -- ================================================================
  -- 2. JOVEM PROMISSOR — pago integralmente, confirmado. Sem linha de receita antes; agora que o
  -- pagamento integral está confirmado, registra.
  -- ================================================================
  select id into v_client_id from public.clients where slug = 'jovem-promissor';
  select id into v_contract_id from public.contracts where client_id = v_client_id and start_date = '2024-12-05';

  if v_contract_id is not null and not exists (select 1 from public.revenue where contract_id = v_contract_id) then
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
    values (v_client_id, v_contract_id, 'Jovem Promissor — pago integralmente', 1500, '2024-12-05', 'pago');
  end if;

  -- ================================================================
  -- 3. ATLÉTICO SOCCER — a parcela de R$750 nunca foi (e não vai ser) recebida. Por instrução
  -- explícita: "a receber" fica zerado pra isso, e não conta no ganho histórico do cliente — a
  -- linha de `revenue` pendente é removida (não fica como pendente/atrasado, o que inflaria "a
  -- receber", nem como qualquer outro status, o que inflaria `totalContracted` na ficha do
  -- cliente); o fato em si (metade não paga) fica só como nota narrativa.
  -- ================================================================
  select id into v_client_id from public.clients where slug = 'atletico-soccer';
  delete from public.revenue where client_id = v_client_id and description = 'Atlético Soccer — parcela 2/2';

  if not exists (select 1 from public.events where entity_type = 'client' and entity_id = v_client_id and type = 'relationship_note') then
    insert into public.events (entity_type, entity_id, actor_id, type, metadata)
    values ('client', v_client_id, v_santiago_id, 'relationship_note', jsonb_build_object(
      'note', 'Contrato de R$1.500 — apenas R$750 (metade) foi efetivamente recebido; a outra metade nunca foi paga e não vai ser cobrada. Tratada como perda (write-off): não conta em "a receber" nem no total histórico gerado pelo cliente.'
    ));
  end if;

  -- ================================================================
  -- 4. URBANDECOR — dados reais chegaram agora (antes só o nome era seguro). R$2.000 em 2
  -- parcelas de R$1.000 (fev/2026 e mar/2026, dia não informado — dia 1 de cada mês por
  -- convenção, documentado).
  -- ================================================================
  select id into v_client_id from public.clients where slug = 'urbandecor';

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-02-01') then
    insert into public.contracts (client_id, type, status, start_date, end_date, total_value, category, created_by)
    values (v_client_id, 'pontual', 'encerrado', '2026-02-01', '2026-03-01', 2000, 'pontual_concluido', v_santiago_id)
    returning id into v_contract_id;

    insert into public.revenue (client_id, contract_id, description, amount, due_date, status) values
      (v_client_id, v_contract_id, 'UrbanDecor — parcela 1/2', 1000, '2026-02-01', 'pago'),
      (v_client_id, v_contract_id, 'UrbanDecor — parcela 2/2', 1000, '2026-03-01', 'pago');
  end if;

  -- ================================================================
  -- 5. WISH — cliente novo (projeto pontual concluído no ano passado, não é projeto em
  -- andamento). R$5.500, 22/07/2025–30/08/2025, 2 parcelas de 50% (jul/2025 e ago/2025 — datas
  -- exatas de cada parcela não informadas, usadas as datas de início/fim do próprio contrato,
  -- que são exatas, como referência de vencimento de cada uma).
  -- ================================================================
  insert into public.clients (name, slug, status, created_by)
  values ('Wish', 'wish', 'churn', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'wish';

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-07-22') then
    insert into public.contracts (client_id, type, status, start_date, end_date, total_value, category, created_by)
    values (v_client_id, 'pontual', 'encerrado', '2025-07-22', '2025-08-30', 5500, 'pontual_concluido', v_santiago_id)
    returning id into v_contract_id;

    insert into public.revenue (client_id, contract_id, description, amount, due_date, status) values
      (v_client_id, v_contract_id, 'Wish — parcela 1/2 (50%)', 2750, '2025-07-22', 'pago'),
      (v_client_id, v_contract_id, 'Wish — parcela 2/2 (50%)', 2750, '2025-08-30', 'pago');
  end if;

  -- ================================================================
  -- 6. NICOLE KASPARY / THAMIRES FICAGNA / ALINE MENEZES — confirmado agora: pagaram até
  -- maio/2026, depois churn. Corrige `end_date` (Aline tinha uma data antiga incompatível com essa
  -- confirmação mais recente — regra 5, o estado atual informado prevalece). "Até maio/2026" sem
  -- dia exato → 31/05/2026 (fim do mês, convenção).
  -- ================================================================
  update public.contracts c set end_date = '2026-05-31'
  from public.clients cl
  where c.client_id = cl.id and cl.slug in ('nicole-kaspary', 'thamires-santos', 'aline-menezes') and c.type = 'recorrente';

  -- ================================================================
  -- 7. MARIA DAS GRAÇAS — não é uma cliente desta seed (veio de outra sessão que compartilha o
  -- banco), mas o usuário confirmou explicitamente que o valor já foi pago — corrige o status.
  -- ================================================================
  update public.revenue
  set status = 'pago'
  where client_id = (select id from public.clients where slug = 'maria-das-gra-as')
    and description = 'Pagamento único'
    and status = 'pendente';

end $$;
