-- Eventos mais granulares no fechamento de negócio — pedido explícito ("Registrar eventos
-- importantes: DEAL_WON, CLIENT_CREATED, CONTRACT_CREATED, SCOPE_CREATED, PROJECT_CREATED,
-- TASK_GENERATED, ONBOARDING_COMPLETED"). `lead_converted`/`client_created` já cobriam
-- DEAL_WON/CLIENT_CREATED (nomes diferentes, mesmo evento — não duplicados aqui, só
-- complementados). CREATE OR REPLACE preserva as permissões já corrigidas (confirmado por query
-- direta depois de aplicar — `anon` continua sem EXECUTE).

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
  v_scope_count int := 0;
  v_project_id uuid;
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

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('client', v_client_id, auth.uid(), 'contract_created', jsonb_build_object('contract_id', v_contract_id, 'type', v_contract_type));

  for v_scope_item in select jsonb_array_elements(coalesce(p_payload -> 'scope_items', '[]'::jsonb))
  loop
    if coalesce(v_scope_item ->> 'service', '') <> '' then
      insert into public.contract_scope_items (contract_id, service, quantity, frequency, deadline, notes)
      values (
        v_contract_id,
        v_scope_item ->> 'service',
        nullif(v_scope_item ->> 'quantity', '')::int,
        v_scope_item ->> 'frequency',
        v_scope_item ->> 'deadline',
        v_scope_item ->> 'notes'
      );
      v_scope_count := v_scope_count + 1;
    end if;
  end loop;

  if v_scope_count > 0 then
    insert into public.events (entity_type, entity_id, actor_id, type, metadata)
    values ('client', v_client_id, auth.uid(), 'scope_created', jsonb_build_object('contract_id', v_contract_id, 'item_count', v_scope_count));
  end if;

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

  insert into public.tasks (title, assignee_id, context_type, context_id, created_by)
  values
    ('Enviar contrato assinado', auth.uid(), 'client_onboarding', v_client_id, auth.uid()),
    ('Agendar reunião de kickoff', auth.uid(), 'client_onboarding', v_client_id, auth.uid()),
    ('Configurar acesso do cliente', auth.uid(), 'client_onboarding', v_client_id, auth.uid());

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('client', v_client_id, auth.uid(), 'task_generated', jsonb_build_object('count', 3, 'context_type', 'client_onboarding'));

  insert into public.production_projects (client_id, name, status, created_by)
  values (v_client_id, v_client_name, 'planejamento', auth.uid())
  returning id into v_project_id;

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('client', v_client_id, auth.uid(), 'project_created', jsonb_build_object('production_project_id', v_project_id));

  update public.leads set client_id = v_client_id, stage_id = v_won_stage_id, updated_at = now() where id = p_lead_id;

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values
    ('lead', p_lead_id, auth.uid(), 'lead_converted', jsonb_build_object('client_id', v_client_id)),
    ('client', v_client_id, auth.uid(), 'client_created', jsonb_build_object('lead_id', p_lead_id)),
    ('client', v_client_id, auth.uid(), 'onboarding_completed', jsonb_build_object('lead_id', p_lead_id));

  return v_client_id;
end;
$$;

grant execute on function public.close_lead_and_create_client(uuid, jsonb) to authenticated;
