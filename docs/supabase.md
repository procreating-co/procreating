# Supabase (preparação — ainda não integrado)

Nada neste projeto fala com o Supabase hoje. Este documento é o plano de migração da camada de
dados de arquivos TS (`data/<slug>/*.ts`) para o Supabase, quando isso fizer sentido (ex.: um
painel de admin para criar clientes sem editar código/fazer PR).

## O que muda vs. o que não muda

**Muda só `lib/clients/index.ts`** (e o que ele chama internamente). Hoje ele faz um lookup em
`lib/clients/registry.ts` (objeto estático, importado de `data/<slug>/*.ts`); no Supabase, viraria
uma query. A assinatura das 4 funções exportadas (`getClientConfig`, `getClientVideos`,
`getClientGalleryFolderDefs`, `getRegisteredClientSlugs`) é o contrato formalizado em
`lib/clients/provider.ts` (`ClientDataProvider`) — qualquer implementação nova só precisa
satisfazer essa interface.

**Não muda nada além disso**: os tipos em `lib/clients/types.ts`, todos os componentes (recebem
`ClientConfig`/`ClientVideos`/etc. via props, nunca sabem de onde vieram), as rotas em
`app/p/[client]/`. Só o import interno de `lib/clients/index.ts` troca.

## Esboço de schema

O admin (`/admin`) já modela isso em 3 níveis — **Cliente → Projeto → Template** — e o schema
segue o mesmo desenho (tipos completos, com todas as colunas, em
`lib/supabase/types/database.ts`):

- **`clients`**: a empresa/pessoa que contrata (ex.: "Pascoal Bombas"). Não tem `slug`, não tem
  config — é só identidade. Um cliente pode ter vários projetos.
- **`templates`**: o "molde" de projeto (hoje só `PosicionamentoPRO`). Define quais blocos um
  projeto tem.
- **`projects`**: a entrega em si — o que hoje é uma pasta `data/<slug>/` no template de
  arquivos. Tem `client_id` (dono) e `template_id` (molde). `config` guarda o resto do
  `ClientConfig` (hero, features, videosSection, footer, gallery, prospeccao) como jsonb.

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  blocks jsonb not null,          -- string[] — ex.: ["hero", "features", "gallery"]
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  template_id uuid not null references templates(id),
  slug text unique not null,      -- bate com data/<slug>/ / /p/<slug>
  brand_name text not null,
  accent_color text not null,
  config jsonb not null,          -- resto do ClientConfig — ver nota abaixo
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table videos (
  id text not null,
  project_id uuid not null references projects(id) on delete cascade,
  block text not null check (block in ('social', 'acquisition', 'presentation')),
  sort_order int not null default 0,
  data jsonb not null,           -- VideoItem inteiro (number, title, format, poster, videoSrc, ...)
  primary key (project_id, id)
);

create table gallery_folders (
  id text not null,
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  primary key (project_id, id)
);
```

**Por que `projects` e não `clients` guardando `slug`/`config`**: numa versão anterior deste
documento, a tabela que descreve o site publicado (`slug`, `config`, cor) se chamava `clients`.
Isso conflava as duas coisas — um cliente com 2 projetos precisaria de 2 linhas em "clients" com
o mesmo nome de empresa repetido, sem lugar pra guardar "esses 2 projetos são da mesma empresa".
Separar em `clients` (identidade) + `projects` (entrega, com `client_id`) resolve isso.
`services`/`videos`/`gallery_folders`/`analytics`/`downloads` também referenciam `project_id`
(não `client_id`) pelo mesmo motivo: um vídeo pertence ao projeto que o exibe, não à empresa em
abstrato.

**`jsonb` vs. colunas normalizadas** (em `projects.config`): o `ClientConfig` tem bastante
aninhamento (hero, features, videosSection...) que muda junto — normalizar cada bloco em tabela
própria só compensa se algum dia existir uma UI de admin editando campo a campo. Até lá, uma
coluna `jsonb` validada em runtime contra o mesmo tipo `ClientConfig` (com um parser Zod, por
exemplo) é mais simples e já dá 90% do valor. Reavaliar quando o admin editar config de verdade.

**Fotos da galeria continuam fora do banco.** A abordagem "solta o arquivo, ele aparece" via
filesystem (`lib/gallery-server.ts`) só migra para Supabase Storage se um dia o app parar de
rodar num filesystem persistente (ex.: build totalmente serverless sem `public/` gravável). Não é
o caso hoje.

## Checklist de migração (quando for a hora)

1. Criar as tabelas acima (ou o schema que fizer mais sentido na hora).
2. Escrever `lib/clients/supabase-provider.ts` implementando `ClientDataProvider`
   (`lib/clients/provider.ts`) — consulta o Supabase, valida o `jsonb` contra `ClientConfig`
   (ex.: com Zod), devolve `null` se o slug não existir.
3. Trocar `lib/clients/index.ts` para chamar essa implementação em vez do `registry.ts` atual.
   As funções passam a ser `async` — `app/p/[client]/*.tsx` e `app/page.tsx`-equivalentes
   precisam de `await` nas chamadas (hoje são síncronas).
4. `getRegisteredClientSlugs()` (usado em `generateStaticParams`) vira uma query `select slug
   from clients` — decidir ali se as rotas continuam SSG (rebuild a cada cliente novo) ou
   passam a ISR/dynamic (cliente novo aparece sem rebuild, ao custo de uma query por request).
5. Popular as tabelas com os clientes já existentes (script de migração lendo
   `data/*/config.ts` e inserindo).
6. Manter `data/_template/` como está — continua sendo a referência de quais campos existem,
   mesmo que o destino final não seja mais um arquivo TS.

## O que NÃO fazer nessa migração

Não trocar a validação de código de acesso (`lib/access-code.ts`) para o servidor como parte
dessa migração — são mudanças independentes. A nota de segurança já existente em
`lib/access-code.ts` (mover pra uma Route Handler com cookie assinado) é uma melhoria separada,
que pode acontecer antes, depois ou nunca, sem depender do Supabase.
