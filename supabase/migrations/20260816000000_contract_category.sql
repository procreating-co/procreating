-- Correção do dashboard financeiro — parte 1/2: schema. O bug relatado ("valores errados porque
-- tratam contratos já encerrados como recorrência ativa e não diferenciam tipos de cliente") tem
-- uma causa raiz clara: MRR (`lib/financeiro/queries.ts`) e "Top 5"/"Valor médio por cliente"
-- (`lib/dashboard/executive-metrics.ts`) inferiam "isso conta como receita atual?" cruzando
-- `type`+`status` na hora da leitura — dois contratos com o mesmo `type='recorrente'
-- status='ativo'` podiam significar coisas bem diferentes (recorrência realmente em curso vs.
-- uma fase antiga que nunca foi marcada `encerrado` na renegociação). Em vez de inferir de novo
-- toda leitura, este campo grava a decisão UMA vez, explicitamente, no momento em que o contrato é
-- criado/corrigido — os 4 valores cobrem todo o ciclo de vida de um contrato (nunca 'pipeline':
-- por regra de negócio uma negociação NUNCA vira `contracts` até ser fechada — ver
-- `close_lead_and_create_client` —, então uma linha desta tabela, por definição, já deixou de ser
-- pipeline; "Pipeline" como categoria existe só no nível de `leads`, não aqui).
alter table public.contracts
  add column category text check (category in ('recorrente_ativo', 'pontual_concluido', 'pontual_em_andamento', 'recorrente_churn'));

-- Backfill determinístico a partir do que já existia (`type` + `status`) — cobre tanto os
-- contratos semeados nesta sessão quanto qualquer contrato de outra origem (ex.: criado pela outra
-- sessão que compartilha este banco, via `close_lead_and_create_client`). Depois deste UPDATE,
-- correções específicas (próxima migration) sobrescrevem os casos que o backfill genérico não
-- consegue acertar sozinho (ex.: Kawhen, cujo `status` estava `encerrado` só porque nunca foi
-- atualizado na renovação — o backfill classificaria como churn; a correção reclassifica).
update public.contracts
set category = case
  when type = 'recorrente' and status = 'ativo' then 'recorrente_ativo'
  when type = 'recorrente' and status in ('encerrado', 'cancelado') then 'recorrente_churn'
  when type = 'pontual' and status = 'ativo' then 'pontual_em_andamento'
  when type = 'pontual' and status in ('encerrado', 'cancelado') then 'pontual_concluido'
end
where category is null;

alter table public.contracts alter column category set not null;
