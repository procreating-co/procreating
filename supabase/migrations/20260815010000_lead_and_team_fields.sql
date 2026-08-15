-- DATA FOUNDATION — campos genuinamente novos em `leads`/`users`. NÃO cria uma tabela "Deal"
-- separada: `leads` já modela o negócio em aberto (valor potencial, responsável, estágio,
-- estratégia, próxima ação) desde a Fase 2-5, e `pipeline_stages.probability` já é a
-- probabilidade (por ESTÁGIO, não uma reafirmada por lead) — duplicar isso numa tabela "deals"
-- seria exatamente o "não duplique entidades" que este pedido pede pra evitar. O que faltava de
-- verdade: dados de identificação/qualificação do lead que não tinham coluna ainda.

alter table public.leads
  add column cnpj_cpf text,
  add column city text,
  add column state text,
  add column website text,
  add column instagram text,
  add column linkedin text,
  add column campaign text,
  add column tags text[] not null default '{}',
  add column lead_score integer,
  add column contact_attempts integer not null default 0;

-- Equipe — `users` ganha os campos operacionais (tipo, status, departamento, capacidade) que
-- alimentam Workspace/Tasks/Capacity. Dados de remuneração (salário/bônus/comissão/profit share)
-- ficam DE FORA de propósito — não é um campo a mais, é uma sub-área com modelo de permissão
-- próprio (histórico de pagamento, quem pode ver o quê) que merece seu próprio ciclo, não uma
-- coluna solta numa migration de cadastro.
alter table public.users
  add column phone text,
  add column member_type text not null default 'funcionario' check (member_type in ('socio', 'funcionario', 'freelancer', 'prestador')),
  add column status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  add column department text,
  add column weekly_capacity_hours numeric(5, 1);

-- Sócios existentes viram `member_type='socio'` — o default 'funcionario' acima é só pra
-- membros futuros que não sejam sócio; os 2 que já existem hoje são sócio de fato.
update public.users set member_type = 'socio' where role = 'owner';
