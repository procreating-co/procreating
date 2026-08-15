-- "Os meses anteriores estão zerados" — Evolução mensal / fluxo de caixa mostravam zero pra
-- todo mês anterior a agosto/2026, mesmo pros clientes recorrentes cujo histórico de valor/data
-- já está 100% documentado (mesma informação usada pra criar os próprios contratos). Backfill
-- mecânico: 1 linha de `revenue` por mês de vigência de cada contrato recorrente, no dia de
-- vencimento já confirmado, status 'pago' — EXCETO onde já existe um fato negativo documentado
-- (Kawhen abril/2026, não paga — mantido só como nota narrativa, nunca uma linha de receita,
-- por instrução explícita anterior: "não adicione isso ao ganho histórico").
--
-- Bruna é o único caso com transição sem lacuna (contrato original encerra 02/07/2026, renovação
-- começa no mesmo dia) — pra não contar julho duas vezes, o mês da transição fica só na
-- renovação (é o contrato vigente a partir dali).
--
-- Não inclui Konceito (fase recorrente sem NENHUMA data documentada, nem mês) nem qualquer outro
-- contrato sem intervalo de datas conhecido — mesma regra de sempre, sem data não tem linha.
-- Idempotente: `where not exists` por contrato+mês.
do $$
declare
  v_month timestamp;
begin
  -- KAWHEN — 2.200/mês, dia 5, 12/2024 até hoje (exceto abril/2026, não pago).
  for v_month in
    select generate_series(date_trunc('month', '2024-12-01'::date), date_trunc('month', '2026-07-01'::date), interval '1 month')
  loop
    if date_trunc('month', v_month) <> date_trunc('month', '2026-04-01'::date) then
      insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
      select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 2200, (v_month + interval '4 days')::date, 'pago', (v_month + interval '4 days')::date
      from public.contracts ct join public.clients c on c.id = ct.client_id
      where c.slug = 'kawhen' and ct.category = 'recorrente_ativo'
        and not exists (
          select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month)
        );
    end if;
  end loop;

  -- MARIA TABAREZ — fase 1 (3.000, jan-abr/2026) e fase 2 (4.200, mai-jul/2026). Dia 5.
  for v_month in select generate_series(date_trunc('month', '2026-01-01'::date), date_trunc('month', '2026-04-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 3000, (v_month + interval '4 days')::date, 'pago', (v_month + interval '4 days')::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'maria-tabarez' and ct.start_date = '2026-01-12'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;

  for v_month in select generate_series(date_trunc('month', '2026-05-01'::date), date_trunc('month', '2026-07-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 4200, (v_month + interval '4 days')::date, 'pago', (v_month + interval '4 days')::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'maria-tabarez' and ct.start_date = '2026-05-01'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;

  -- BRUNA — original (3.000, abr-jun/2026 — julho fica só na renovação) e renovação (jul/2026,
  -- ago/2026 já existe). Dia 5.
  for v_month in select generate_series(date_trunc('month', '2026-04-01'::date), date_trunc('month', '2026-06-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 3000, (v_month + interval '4 days')::date, 'pago', (v_month + interval '4 days')::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'bruna-montenegro' and ct.start_date = '2026-04-02'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;

  insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
  select ct.client_id, ct.id, 'Mensalidade 07/2026', 3000, '2026-07-05', 'pago', '2026-07-05'
  from public.contracts ct join public.clients c on c.id = ct.client_id
  where c.slug = 'bruna-montenegro' and ct.category = 'recorrente_ativo'
    and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = '2026-07-01');

  -- NICOLE KASPARY — 1.200/mês, dia 5, set/2025 até mai/2026 (pagou até aqui, depois churn).
  for v_month in select generate_series(date_trunc('month', '2025-09-01'::date), date_trunc('month', '2026-05-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 1200, (v_month + interval '4 days')::date, 'pago', (v_month + interval '4 days')::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'nicole-kaspary'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;

  -- THAMIRES FICAGNA — 1.200/mês, dia 1, set/2025 até mai/2026.
  for v_month in select generate_series(date_trunc('month', '2025-09-01'::date), date_trunc('month', '2026-05-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 1200, v_month::date, 'pago', v_month::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'thamires-santos'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;

  -- ALINE MENEZES — 1.200/mês, dia 1, out/2025 até mai/2026.
  for v_month in select generate_series(date_trunc('month', '2025-10-01'::date), date_trunc('month', '2026-05-01'::date), interval '1 month') loop
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status, paid_at)
    select ct.client_id, ct.id, 'Mensalidade ' || to_char(v_month, 'MM/YYYY'), 1200, v_month::date, 'pago', v_month::date
    from public.contracts ct join public.clients c on c.id = ct.client_id
    where c.slug = 'aline-menezes'
      and not exists (select 1 from public.revenue r where r.contract_id = ct.id and date_trunc('month', r.due_date) = date_trunc('month', v_month));
  end loop;
end $$;
