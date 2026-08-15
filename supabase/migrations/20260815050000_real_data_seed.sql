-- Seed de dados reais — parte 2/2: os dados em si. Regras seguidas à risca (recebidas junto com
-- os dados, citadas aqui pra quem ler esta migration no futuro entender as escolhas):
--
--   * NADA foi inventado. Onde a informação não existia (CNPJ, data exata, valor atual), o campo
--     ficou NULL — nunca um placeholder disfarçado de dado real.
--   * Datas: só usadas quando informadas explicitamente OU diretamente derivadas de uma data já
--     dada (ex.: "renovado a partir de maio/2026" → contrato anterior termina 30/04/2026, é a
--     mesma informação, não uma nova). Quando só mês/ano foi dado (sem dia), o dia 1 foi usado
--     por convenção — documentado em cada bloco. Quando NENHUMA data foi dada (ex.: "15 semanas"
--     sem data de início explícita além da entrada, ou o produto inicial da Elenita), o campo
--     ficou NULL/o registro estruturado foi omitido — nunca calculado por inferência de duração.
--   * `revenue` (cobrança) só foi criada onde existe uma AFIRMAÇÃO EXPLÍCITA de pagamento (pago,
--     não pago, ou "metade paga"). Contrato tem valor; isso não é o mesmo que cobrança confirmada
--     — "não transforme contrato antigo em receita" foi levado ao pé da letra: nenhuma linha de
--     `revenue` foi gerada só porque um contrato existe.
--   * Negociação nunca virou contrato nem receita — Pascoal e Elenita (oportunidades de R$6.000/mês)
--     entram só em `leads`, nunca em `contracts`/`revenue`.
--   * Idempotente: `on conflict do nothing`/`where not exists` em cada insert — rodar esta
--     migration mais de uma vez (ou copiar o bloco pra outro ambiente) não duplica nada.

do $$
declare
  v_santiago_id uuid;
  v_negociacao_stage_id uuid;
  v_client_id uuid;
  v_contract_id uuid;
begin
  select id into v_santiago_id from auth.users where email = 'martins.santiago08@gmail.com';
  select id into v_negociacao_stage_id from public.pipeline_stages where key = 'negociacao';

  if v_santiago_id is null then
    raise exception 'Usuário martins.santiago08@gmail.com não encontrado — seed não pode rodar sem um created_by real.';
  end if;

  -- ================================================================
  -- EMPRESA
  -- ================================================================
  if not exists (select 1 from public.company_profile) then
    insert into public.company_profile (name, trade_name, city, state, annual_revenue_goal, monthly_profit_goal, created_by)
    values ('PROCREATING CO LTDA', 'PROCREATING CO.', 'Porto Alegre', 'Rio Grande do Sul', 100000, 20000, v_santiago_id);
  end if;

  -- Meta mensal ATUAL (estado informado agora prevalece sobre o que já estava gravado, inclusive
  -- se era dado de teste — regra 5) — mês corrente, upsert pela unicidade de `month`.
  insert into public.revenue_goals (month, amount, created_by)
  values (date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date, 30000, v_santiago_id)
  on conflict (month) do update set amount = excluded.amount, updated_at = now();

  -- ================================================================
  -- SÓCIOS
  -- ================================================================
  -- Santiago: telefone real + função (Estrategista) no campo `department` (não existe coluna de
  -- "função" separada de `role`/cargo — department é o campo livre mais próximo, reaproveitado).
  update public.users
  set phone = '+55 51 983205917', department = 'Estrategista'
  where email = 'martins.santiago08@gmail.com';

  -- Eduardo ainda não criou conta (`public.users` não tem linha pra ele) — só o convite
  -- (`team_invites`, já semeado antes) pode ser atualizado. "FULL / NOT ADMIN" → role='admin'
  -- (não 'owner', que era o valor anterior, herdado de quando só existia "os 2 sócios são
  -- iguais"). Ele continua sócio (`member_type='socio'`, aplicado quando a conta for criada) —
  -- `lib/financeiro/rules.ts` foi corrigido pra dividir lucro por `member_type`, não por `role`,
  -- exatamente pra essa distinção não tirar Eduardo do rateio.
  update public.team_invites
  set name = 'Eduardo Fraresso', role = 'admin'
  where email = 'edufraresso11@gmail.com';

  -- ================================================================
  -- 1. KAWHEN — ATIVO
  -- ================================================================
  insert into public.clients (name, slug, status, document, segment, city, state, created_by)
  values ('Kawhen Confecções e Transportes LTDA', 'kawhen', 'ativo', '05.111.420/0001-69', 'Confecções e Transportes', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'kawhen';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Pedro Garbin Susin') then
    insert into public.client_contacts (client_id, name, email, is_primary)
    values (v_client_id, 'Pedro Garbin Susin', 'contato@kawhen.com.br', true);
  end if;

  -- Contrato ORIGINAL (histórico) — 3 meses, encerrou 28/02/2025 (não é o contrato atual).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2024-12-01') then
    insert into public.contracts (client_id, type, status, start_date, end_date, monthly_value, due_day, payment_terms, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2024-12-01', '2025-02-28', 2200, 5, 'Transferência bancária', v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, notes)
    values (v_contract_id, 'Gestão de mídias sociais e tráfego pago',
      'Meta Business, anúncios, roteiros, gravação, edição, postagem, redes sociais, relatórios e estratégias comerciais.');
  end if;

  -- Continuidade atual: SEM data de início nem valor confirmado (usuário informou só "segue ativo
  -- até agosto/2026") — não dá pra criar uma linha de `contracts` (start_date é obrigatório) sem
  -- inventar uma data. Registrado como evento, não como contrato.
  if not exists (select 1 from public.events where entity_type = 'client' and entity_id = v_client_id and type = 'relationship_note') then
    insert into public.events (entity_type, entity_id, actor_id, type, metadata)
    values ('client', v_client_id, v_santiago_id, 'relationship_note', jsonb_build_object(
      'note', 'Relação comercial segue ativa (informado pelo usuário) até pelo menos agosto/2026. Contrato/valor atual não confirmado nos documentos — o contrato original (3 meses, R$2.200/mês) encerrou em 28/02/2025 e está registrado só como histórico. Abril/2026: mensalidade não paga/atrasada (valor não confirmado — não registrado em contas a receber por faltar o valor).'
    ));
  end if;

  -- ================================================================
  -- 2. JOVEM PROMISSOR — ENCERRADO
  -- ================================================================
  insert into public.clients (name, slug, status, document, segment, city, state, created_by)
  values ('Projeto Jovem Promissor', 'jovem-promissor', 'churn', '39.956.448/0001-19', 'Projeto social / ONG', 'Canoas', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'jovem-promissor';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Wagner Vinícius Vargas Fonseca') then
    insert into public.client_contacts (client_id, name, is_primary) values (v_client_id, 'Wagner Vinícius Vargas Fonseca', true);
  end if;

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2024-12-05') then
    insert into public.contracts (client_id, type, status, start_date, end_date, total_value, payment_terms, created_by)
    values (v_client_id, 'pontual', 'encerrado', '2024-12-05', '2025-01-05', 1500, 'R$250 entrada + R$1.250 após gravação', v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity) values
      (v_contract_id, 'Diária de gravação', 1),
      (v_contract_id, 'Vídeos', 10),
      (v_contract_id, 'Roteiros', null),
      (v_contract_id, 'Edição', null),
      (v_contract_id, 'Postagem', null),
      (v_contract_id, 'Fotos', null);
  end if;

  -- ================================================================
  -- 3. ATLÉTICO SOCCER — ENCERRADO
  -- ================================================================
  insert into public.clients (name, slug, status, segment, city, state, created_by)
  values ('Escola de Futebol Atlético Soccer', 'atletico-soccer', 'churn', 'Escola de futebol / esporte', 'Alvorada', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'atletico-soccer';

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-04-20') then
    insert into public.contracts (client_id, type, status, start_date, total_value, created_by)
    values (v_client_id, 'pontual', 'encerrado', '2025-04-20', 1500, v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity, frequency) values
      (v_contract_id, 'Otimização de perfil', null, null),
      (v_contract_id, 'Meta Business / Gerenciador de anúncios', null, null),
      (v_contract_id, 'Roteiros', null, null),
      (v_contract_id, 'Direção', null, null),
      (v_contract_id, 'Gravação', 1, null),
      (v_contract_id, 'Vídeos', 3, null),
      (v_contract_id, 'Tráfego pago', null, '30 dias');

    -- "Apenas metade paga" — fato explícito. QUAL parcela ficou pendente não foi informado
    -- (regra explícita: não inventar isso) — divididas em 2 linhas iguais, uma paga (sem data de
    -- pagamento, não informada) e uma pendente, somando o total contratado.
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status) values
      (v_client_id, v_contract_id, 'Atlético Soccer — parcela 1/2', 750, '2025-04-20', 'pago'),
      (v_client_id, v_contract_id, 'Atlético Soccer — parcela 2/2', 750, '2025-04-20', 'pendente');
  end if;

  -- ================================================================
  -- 4. KONCEITO — ENCERRADO
  -- ================================================================
  insert into public.clients (name, slug, status, document, segment, city, state, created_by)
  values ('Konceito Cafeteria LTDA', 'konceito', 'churn', '49.928.091/0001-19', 'Cafeteria / Gastronomia', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'konceito';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Pamela Gorgen Coelho') then
    insert into public.client_contacts (client_id, name, is_primary) values (v_client_id, 'Pamela Gorgen Coelho', true);
  end if;

  -- Projeto pontual inicial — único ponto com data (a própria entrada do cliente).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-04-30') then
    insert into public.contracts (client_id, type, status, start_date, total_value, created_by)
    values (v_client_id, 'pontual', 'encerrado', '2025-04-30', 1500, v_santiago_id);
  end if;

  -- "Depois: 4 meses de R$1.500" — sem NENHUMA data (nem mês) pra esse período. Não dá pra criar
  -- um `contracts` (start_date obrigatório) sem inventar quando começou. Registrado como evento.
  if not exists (select 1 from public.events where entity_type = 'client' and entity_id = v_client_id and type = 'relationship_note') then
    insert into public.events (entity_type, entity_id, actor_id, type, metadata)
    values ('client', v_client_id, v_santiago_id, 'relationship_note', jsonb_build_object(
      'note', 'Após o projeto pontual inicial (R$1.500), houve um período de 4 meses de mensalidade recorrente de R$1.500 — datas exatas de início/fim não documentadas, por isso não viraram um contrato estruturado.'
    ));
  end if;

  -- ================================================================
  -- 5. ALINE MENEZES — CHURN
  -- ================================================================
  insert into public.clients (name, slug, status, document, city, state, created_by)
  values ('Aline Menezes', 'aline-menezes', 'churn', '999.106.200-04', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'aline-menezes';

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-10-20') then
    insert into public.contracts (client_id, type, status, start_date, end_date, monthly_value, due_day, payment_terms, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2025-10-20', '2025-12-31', 1200, 1, 'Depósito / TED / PIX', v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity, frequency, notes) values
      (v_contract_id, 'Vídeo', 1, 'semanal', null),
      (v_contract_id, 'Captação', 1, 'mensal', null),
      (v_contract_id, 'Alterações', 2, null, 'até 2 alterações por entrega'),
      (v_contract_id, 'Facebook Ads', null, null, null);
  end if;

  -- ================================================================
  -- 6. NICOLE — CHURN
  -- ================================================================
  insert into public.clients (name, slug, status, document, city, state, created_by)
  values ('Nicole Catherine Antoniazzi Kaspary', 'nicole-kaspary', 'churn', '846.444.860-00', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'nicole-kaspary';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Nicole Catherine Antoniazzi Kaspary') then
    insert into public.client_contacts (client_id, name, whatsapp, is_primary)
    values (v_client_id, 'Nicole Catherine Antoniazzi Kaspary', '+55 51 99821-7425', true);
  end if;

  -- "15 semanas" a partir de 18/09/2025 — end_date deliberadamente NULL (calcular a data exata
  -- de término exigiria assumir uma convenção de contagem de semana; a regra é não inventar
  -- data, então fica em aberto em vez de calculado).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-09-18') then
    insert into public.contracts (client_id, type, status, start_date, monthly_value, due_day, special_conditions, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2025-09-18', 1200, 5, 'Duração informada: 15 semanas — data de término exata não documentada.', v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity, frequency, notes) values
      (v_contract_id, 'Vídeos', 4, 'mensal', null),
      (v_contract_id, 'Fotos', 20, 'mensal', null),
      (v_contract_id, 'Captação', 1, 'mensal', null),
      (v_contract_id, 'Alterações', 2, null, 'até 2 alterações'),
      (v_contract_id, 'Facebook Ads', null, null, null);
  end if;

  -- ================================================================
  -- 7. THAMIRES — CHURN
  -- ================================================================
  insert into public.clients (name, slug, status, document, city, state, created_by)
  values ('Thamires de Oliveira Ficagna dos Santos', 'thamires-santos', 'churn', '049.373.050-85', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'thamires-santos';

  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2025-09-18') then
    insert into public.contracts (client_id, type, status, start_date, monthly_value, due_day, special_conditions, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2025-09-18', 1200, 1, 'Duração informada: 15 semanas — data de término exata não documentada.', v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity, frequency, notes) values
      (v_contract_id, 'Vídeos', 4, 'mensal', null),
      (v_contract_id, 'Fotos', 20, 'mensal', null),
      (v_contract_id, 'Captação', 1, 'mensal', null),
      (v_contract_id, 'Alterações', 2, null, 'até 2 alterações'),
      (v_contract_id, 'Facebook Ads', null, null, null);
  end if;

  -- ================================================================
  -- 8. MARIA TABAREZ — ATIVO (evolução de MRR: R$3.000 → R$4.200 → R$5.700)
  -- ================================================================
  insert into public.clients (name, slug, status, document, segment, city, state, created_by)
  values ('Maria Tabarez Harmonização Facial LTDA', 'maria-tabarez', 'ativo', '51.180.273/0001-04', 'Estética / Harmonização Facial', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'maria-tabarez';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Nilo Stangarlin') then
    insert into public.client_contacts (client_id, name, email, is_primary) values (v_client_id, 'Nilo Stangarlin', 'nilo.stangarlin@gmail.com', false);
  end if;
  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Maria Eduarda Tabarez') then
    insert into public.client_contacts (client_id, name, email, is_primary) values (v_client_id, 'Maria Eduarda Tabarez', 'mariaeduardatabarez@hotmail.com', true);
  end if;

  -- Fase 1: R$3.000/mês, 12/01/2026 (entrada) → 30/04/2026 (véspera do início da fase 2, dado
  -- explicitamente como "a partir de maio/2026" — não é uma data nova inventada, é a mesma
  -- informação lida ao contrário).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-01-12') then
    insert into public.contracts (client_id, type, status, start_date, end_date, monthly_value, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2026-01-12', '2026-04-30', 3000, v_santiago_id);
  end if;

  -- Fase 2: R$4.200/mês a partir de 01/05/2026 (dia não informado, dia 1 do mês por convenção)
  -- até 31/07/2026 (véspera do upsell de agosto/2026, mesma lógica acima).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-05-01') then
    insert into public.contracts (client_id, type, status, start_date, end_date, monthly_value, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2026-05-01', '2026-07-31', 4200, v_santiago_id);
  end if;

  -- Fase 3 (ATUAL): R$5.700/mês a partir de 01/08/2026 (dia 1 por convenção — mês informado
  -- como "agosto/2026"), sem data de término — é o contrato ativo.
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-08-01') then
    insert into public.contracts (client_id, type, status, start_date, monthly_value, created_by)
    values (v_client_id, 'recorrente', 'ativo', '2026-08-01', 5700, v_santiago_id)
    returning id into v_contract_id;

    insert into public.contract_scope_items (contract_id, service, quantity, frequency, notes) values
      (v_contract_id, 'Planejamento estratégico', null, null, null),
      (v_contract_id, 'Roteiros', null, null, null),
      (v_contract_id, 'Captação', null, null, null),
      (v_contract_id, 'Edição', null, null, null),
      (v_contract_id, 'Fotos', null, null, null),
      (v_contract_id, 'Vídeos', 4, 'mensal', 'mínimo');
  end if;

  -- ================================================================
  -- 9. BRUNA — ATIVO (renovado)
  -- ================================================================
  insert into public.clients (name, slug, status, document, segment, city, state, created_by)
  values ('Bruna Gonçalves Montenegro', 'bruna-montenegro', 'ativo', '024.610.360-47', 'Advocacia / Jurídico', 'Porto Alegre', 'RS', v_santiago_id)
  on conflict (slug) do nothing;
  select id into v_client_id from public.clients where slug = 'bruna-montenegro';

  if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Bruna Gonçalves Montenegro') then
    insert into public.client_contacts (client_id, name, email, whatsapp, is_primary)
    values (v_client_id, 'Bruna Gonçalves Montenegro', 'brunamontenegro.adv@gmail.com', '(51) 98530-1470', true);
  end if;

  -- Contrato original — 3 meses, encerrou 02/07/2026 (documentado).
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-04-02') then
    insert into public.contracts (client_id, type, status, start_date, end_date, monthly_value, payment_terms, created_by)
    values (v_client_id, 'recorrente', 'encerrado', '2026-04-02', '2026-07-02', 3000, 'PIX / transferência — vencimento no 5º dia útil', v_santiago_id);
  end if;

  -- Renovação — usuário confirmou que renovou pelos mesmos valores; início = onde o original
  -- terminou (continuidade direta, não uma data nova). Sem data de término — pedido explícito
  -- pra não inventar quando a renovação acaba.
  if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-07-02' and status = 'ativo') then
    insert into public.contracts (client_id, type, status, start_date, monthly_value, payment_terms, special_conditions, created_by)
    values (v_client_id, 'recorrente', 'ativo', '2026-07-02', 3000, 'PIX / transferência — vencimento no 5º dia útil', 'Renovação do contrato original, mesmos valores.', v_santiago_id);
  end if;

  -- ================================================================
  -- 10. PASCOAL — cliente já existe (site entregue); NEGOCIAÇÃO comercial nova (R$6.000/mês)
  -- ================================================================
  update public.clients
  set document = '90.041.187/0001-64', segment = 'Comércio de autopeças', city = 'Porto Alegre', state = 'RS'
  where slug = 'pascoal' and document is null;
  select id into v_client_id from public.clients where slug = 'pascoal';

  if v_client_id is not null then
    if not exists (select 1 from public.client_contacts where client_id = v_client_id and name = 'Júlia Brigido Cid') then
      insert into public.client_contacts (client_id, name, email, is_primary) values (v_client_id, 'Júlia Brigido Cid', 'cidjuliab@gmail.com', true);
    end if;

    -- Contrato inicial pontual — já pago, encerrado. Separado da NOVA oportunidade recorrente
    -- (que fica só em `leads`, nunca vira `contracts`/`revenue` enquanto for negociação).
    if not exists (select 1 from public.contracts where client_id = v_client_id and start_date = '2026-06-19') then
      insert into public.contracts (client_id, type, status, start_date, end_date, total_value, created_by)
      values (v_client_id, 'pontual', 'encerrado', '2026-06-19', '2026-07-29', 5750, v_santiago_id)
      returning id into v_contract_id;

      insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
      values (v_client_id, v_contract_id, 'Pascoal — contrato inicial (pago)', 5750, '2026-06-19', 'pago');
    end if;
  end if;

  if v_negociacao_stage_id is not null and not exists (
    select 1 from public.leads where company_name = 'Pascoal Zona Sul Comércio de Auto Peças LTDA' and client_id is null
  ) then
    insert into public.leads (company_name, contact_name, email, potential_value, owner_id, stage_id, source, cnpj_cpf, notes)
    values (
      'Pascoal Zona Sul Comércio de Auto Peças LTDA', 'Júlia Brigido Cid', 'cidjuliab@gmail.com', 6000, v_santiago_id, v_negociacao_stage_id,
      'Seed — dados reais', '90.041.187/0001-64',
      'Oportunidade de contrato RECORRENTE mensal (R$6.000/mês). Não confundir com o contrato pontual já encerrado e pago (R$5.750, 19/06/2026–29/07/2026).'
    );
  end if;

  -- ================================================================
  -- 11. ELENITA — cliente já existe (site entregue); NEGOCIAÇÃO comercial nova (R$6.000/mês)
  -- ================================================================
  select id into v_client_id from public.clients where slug = 'elenita';

  if v_client_id is not null and not exists (select 1 from public.events where entity_type = 'client' and entity_id = v_client_id and type = 'relationship_note') then
    insert into public.events (entity_type, entity_id, actor_id, type, metadata)
    values ('client', v_client_id, v_santiago_id, 'relationship_note', jsonb_build_object(
      'note', 'Produto inicial de R$1.500, pago — data não documentada, por isso não virou uma linha de contrato/receita estruturada. Existe uma nova oportunidade em negociação (R$6.000/mês recorrente), registrada em Leads/CRM, não confundir com este valor histórico.'
    ));
  end if;

  if v_negociacao_stage_id is not null and not exists (
    select 1 from public.leads where company_name = 'Dra. Elenita Luzardo' and client_id is null
  ) then
    insert into public.leads (company_name, potential_value, owner_id, stage_id, source, notes)
    values (
      'Dra. Elenita Luzardo', 6000, v_santiago_id, v_negociacao_stage_id, 'Seed — dados reais',
      'Oportunidade de contrato RECORRENTE mensal (R$6.000/mês). Produto inicial de R$1.500 já foi pago anteriormente (data não documentada) — histórico separado, não é MRR atual.'
    );
  end if;

  -- ================================================================
  -- 12. URBANDECOR — ENCERRADO, dado mínimo (só o nome é seguro)
  -- ================================================================
  insert into public.clients (name, slug, status, created_by)
  values ('UrbanDecor', 'urbandecor', 'churn', v_santiago_id)
  on conflict (slug) do nothing;
  -- Sem CNPJ, responsável, valor, datas ou escopo documentados — nenhum registro além do
  -- cliente em si. Criar um `contracts` exigiria inventar `start_date`/`type`, os dois
  -- obrigatórios — não existe informação real pra nenhum dos dois.

end $$;
