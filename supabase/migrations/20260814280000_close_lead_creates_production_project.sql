-- Fecha o gap apontado na auditoria (§03/§14/P0-3): fechar negócio criava cliente + contrato +
-- escopo + receita + tasks genéricas, mas nunca um `production_project` — o funil se rompia
-- exatamente na entrega pra Operação, que é o próprio motivo do funil existir. `production_projects`
-- não existia ainda quando este RPC foi escrito pela última vez (`20260814000000_...sql`, antes de
-- `20260814250000_production_projects.sql`) — não foi esquecido, só ainda não existia pra usar.
--
-- `CREATE OR REPLACE` precisa do corpo inteiro (não dá pra só acrescentar um passo) — idêntico à
-- versão anterior, exceto o novo passo 7.5: cria um `production_project` com o nome do cliente,
-- status inicial `planejamento`, sem responsável/prazo (decidido depois em Operação — inventar um
-- responsável ou prazo aqui seria dado fictício, não real).

create or replace function public.close_lead_and_create_client(p_lead_id uuid, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead public.leads;
  v_won_stage_id uuid;
  v_client_id uuid;
  v_contract_id uuid;
  v_base_slug text;
  v_slug text;
  v_suffix int := 1;
  v_contract_type text;
  v_start date;
  v_end date;
  v_due_day int;
  v_monthly_value numeric(12, 2);
  v_total_value numeric(12, 2);
  v_month timestamp;
  v_contact jsonb;
  v_scope_item jsonb;
  v_client_name text;
begin
  select * into v_lead from public.leads where id = p_lead_id;
  if not found then
    raise exception 'Lead % não encontrado', p_lead_id;
  end if;
  if v_lead.client_id is not null then
    raise exception 'Lead % já foi convertido no cliente %', p_lead_id, v_lead.client_id;
  end if;

  select id into v_won_stage_id from public.pipeline_stages where is_won = true order by sort_order limit 1;
  if v_won_stage_id is null then
    raise exception 'Nenhum estágio marcado como is_won em pipeline_stages';
  end if;

  v_client_name := coalesce(nullif(trim(p_payload -> 'client' ->> 'name'), ''), v_lead.company_name);

  -- 1. clients — slug único derivado do nome, mesmo padrão de `lib/admin/format.ts` (slugify +
  -- sufixo numérico em caso de colisão), só que em SQL porque roda dentro da transação.
  v_base_slug := trim(both '-' from regexp_replace(lower(v_client_name), '[^a-z0-9]+', '-', 'g'));
  if v_base_slug = '' then
    v_base_slug := 'cliente';
  end if;
  v_slug := v_base_slug;
  while exists (select 1 from public.clients where slug = v_slug) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  end loop;

  insert into public.clients (name, slug, status, document, segment, strategy_id, created_by)
  values (
    v_client_name,
    v_slug,
    'ativo',
    coalesce(p_payload -> 'onboarding' ->> 'cnpj', p_payload -> 'onboarding' ->> 'cpf'),
    null,
    v_lead.strategy_id,
    auth.uid()
  )
  returning id into v_client_id;

  -- 2. client_onboarding (Etapas 1 + 4)
  insert into public.client_onboarding (
    client_id, legal_name, trade_name, cnpj, cpf, address, billing_info,
    objective, target_audience, offer, positioning, channels, goals, commercial_notes, created_by
  )
  values (
    v_client_id,
    p_payload -> 'onboarding' ->> 'legal_name',
    p_payload -> 'onboarding' ->> 'trade_name',
    p_payload -> 'onboarding' ->> 'cnpj',
    p_payload -> 'onboarding' ->> 'cpf',
    p_payload -> 'onboarding' ->> 'address',
    p_payload -> 'onboarding' ->> 'billing_info',
    p_payload -> 'onboarding' ->> 'objective',
    p_payload -> 'onboarding' ->> 'target_audience',
    p_payload -> 'onboarding' ->> 'offer',
    p_payload -> 'onboarding' ->> 'positioning',
    p_payload -> 'onboarding' ->> 'channels',
    p_payload -> 'onboarding' ->> 'goals',
    p_payload -> 'onboarding' ->> 'commercial_notes',
    auth.uid()
  );

  -- 3. client_contacts
  for v_contact in select jsonb_array_elements(coalesce(p_payload -> 'contacts', '[]'::jsonb))
  loop
    insert into public.client_contacts (client_id, name, role_title, email, whatsapp, is_primary)
    values (
      v_client_id,
      v_contact ->> 'name',
      v_contact ->> 'role_title',
      v_contact ->> 'email',
      v_contact ->> 'whatsapp',
      coalesce((v_contact ->> 'is_primary')::boolean, false)
    );
  end loop;

  -- 4. contracts (Etapa 2)
  v_contract_type := p_payload -> 'contract' ->> 'type';
  v_start := (p_payload -> 'contract' ->> 'start_date')::date;
  v_end := nullif(p_payload -> 'contract' ->> 'end_date', '')::date;
  v_due_day := coalesce((p_payload -> 'contract' ->> 'due_day')::int, 1);
  v_monthly_value := (p_payload -> 'contract' ->> 'monthly_value')::numeric;
  v_total_value := (p_payload -> 'contract' ->> 'total_value')::numeric;

  insert into public.contracts (
    client_id, type, status, start_date, end_date, monthly_value, due_day, auto_renew,
    total_value, payment_terms, special_conditions, created_by
  )
  values (
    v_client_id, v_contract_type, 'ativo', v_start, v_end, v_monthly_value, v_due_day,
    coalesce((p_payload -> 'contract' ->> 'auto_renew')::boolean, false),
    v_total_value, p_payload -> 'contract' ->> 'payment_terms', p_payload -> 'contract' ->> 'special_conditions',
    auth.uid()
  )
  returning id into v_contract_id;

  -- 5. contract_scope_items (Etapa 3)
  for v_scope_item in select jsonb_array_elements(coalesce(p_payload -> 'scope_items', '[]'::jsonb))
  loop
    insert into public.contract_scope_items (contract_id, service, quantity, frequency, deadline, notes)
    values (
      v_contract_id,
      v_scope_item ->> 'service',
      nullif(v_scope_item ->> 'quantity', '')::int,
      v_scope_item ->> 'frequency',
      v_scope_item ->> 'deadline',
      v_scope_item ->> 'notes'
    );
  end loop;

  -- 6. revenue — derivada do contrato. Recorrente com end_date conhecido: uma linha por mês
  -- (vencimento = due_day de cada mês do intervalo). Recorrente sem end_date (contrato aberto):
  -- só a primeira parcela — gerar um horizonte arbitrário seria inventar dado; a extensão mês a
  -- mês fica pra um job futuro (cobrança automática, fora de escopo desta fase). Pontual: uma
  -- linha só.
  if v_contract_type = 'recorrente' then
    if v_end is not null then
      for v_month in select generate_series(date_trunc('month', v_start::timestamp), date_trunc('month', v_end::timestamp), interval '1 month')
      loop
        insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
        values (
          v_client_id, v_contract_id,
          'Mensalidade ' || to_char(v_month, 'MM/YYYY'),
          v_monthly_value,
          (v_month + ((v_due_day - 1) || ' days')::interval)::date,
          'pendente'
        );
      end loop;
    else
      insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
      values (
        v_client_id, v_contract_id,
        'Mensalidade ' || to_char(v_start, 'MM/YYYY'),
        v_monthly_value,
        (date_trunc('month', v_start::timestamp) + ((v_due_day - 1) || ' days')::interval)::date,
        'pendente'
      );
    end if;
  elsif v_contract_type = 'pontual' then
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
    values (v_client_id, v_contract_id, 'Pagamento único', v_total_value, coalesce(v_end, v_start), 'pendente');
  end if;

  -- 7. tasks (context_type='client_onboarding') — mínimo padrão, não um sistema de tarefas
  -- geral. Atribuídas a quem fechou o negócio (auth.uid()), dono natural de dar sequência.
  insert into public.tasks (title, assignee_id, context_type, context_id, created_by)
  values
    ('Enviar contrato assinado', auth.uid(), 'client_onboarding', v_client_id, auth.uid()),
    ('Agendar reunião de kickoff', auth.uid(), 'client_onboarding', v_client_id, auth.uid()),
    ('Configurar acesso do cliente', auth.uid(), 'client_onboarding', v_client_id, auth.uid());

  -- 7.5. production_projects — NOVO. Sem isto, o cliente fechado nunca aparecia em
  -- `/operacao/projetos`; o funil comercial terminava sem entregar pra operação de verdade.
  -- Status inicial sempre `planejamento` (é o primeiro estágio do enum, ver migration própria);
  -- `assigned_to`/`deadline` ficam nulos de propósito — inventar um responsável ou prazo aqui
  -- seria dado fictício, essa decisão é de quem organiza Operação, não do fechamento em si.
  insert into public.production_projects (client_id, name, status, created_by)
  values (v_client_id, v_client_name, 'planejamento', auth.uid());

  -- 8. lead — marca convertido, some do Kanban de leads abertos.
  update public.leads set client_id = v_client_id, stage_id = v_won_stage_id, updated_at = now() where id = p_lead_id;

  -- 9. events — trilha de auditoria nos dois lados da conversão.
  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values
    ('lead', p_lead_id, auth.uid(), 'lead_converted', jsonb_build_object('client_id', v_client_id)),
    ('client', v_client_id, auth.uid(), 'client_created', jsonb_build_object('lead_id', p_lead_id));

  return v_client_id;
end;
$$;

grant execute on function public.close_lead_and_create_client(uuid, jsonb) to authenticated;
