# Supabase (preparação — ainda não integrado)

Nada neste projeto fala com o Supabase hoje. Este documento cobre só o que é específico da
**migração da fonte de dados da Pascoal** (`data/pascoal/*.ts` → uma linha em tabela); o
**schema completo da plataforma** (Client/Project/Template/Page/Section/Block/Asset/
AssetVariant/AssetCollection/Deployment/Event/Analytics — todos os tipos reais, com o
raciocínio arquitetural por trás de cada um) vive só em `docs/project-creation.md`, que é a
referência única — este arquivo não repete mais esse desenho, pra não manter duas narrativas de
schema divergindo com o tempo (era exatamente esse o problema antes desta revisão: este
documento descrevia um schema de 3 tabelas com `videos`/`gallery_folders` que antecedia o
modelo `Asset` unificado da revisão 4 e a hierarquia Página/Seção/Bloco da revisão 5 — já
desatualizado há duas revisões).

## O que muda vs. o que não muda, quando a Pascoal migrar (cenário hipotético, não decidido)

**Muda só `lib/clients/index.ts`** (e o que ele chama internamente, hoje `ClientResolver` +
`registrySource`, ver `docs/project-creation.md` seção 9 — Resolver Layer). Uma fonte nova
(`supabaseSource`, satisfazendo `ClientDataProvider`) entraria na lista de sources do resolver,
ao lado de `registrySource`, sem exigir mudança em `app/p/[client]/**`.

**Não muda nada além disso**: os tipos em `lib/clients/types.ts` (`ClientConfig` — que a
revisão 5 formalizou como **congelado**, mantido só pra Pascoal, nunca usado por projeto novo),
os componentes de `components/landing|gallery|prospeccao/**`, as rotas em `app/p/[client]/`.

## Checklist de migração (quando for a hora — não decidido, só documentado)

1. Criar o schema real no Supabase seguindo `docs/project-creation.md` (schema consolidado,
   revisão 5).
2. Escrever `lib/clients/sources/supabase-source.ts` satisfazendo `ClientDataProvider`
   (`lib/clients/provider.ts`) — consulta o Supabase, valida contra `ClientConfig`, devolve
   `null` se o slug não existir. Segue o mesmo padrão de `registry-source.ts` (adaptador puro,
   sem lógica de fallback — isso é responsabilidade do `ClientResolver`, não da source).
3. Adicionar essa source à lista em `lib/clients/index.ts`:
   `new ClientResolver([registrySource, supabaseSource])`.
4. `getRegisteredClientSlugs()` (usado em `generateStaticParams`) passaria a incluir os slugs
   vindos da nova source — decidir ali se as rotas Supabase-backed continuam SSG (rebuild a cada
   cliente novo) ou passam a ISR/dynamic.
5. Popular a tabela com os clientes já existentes, se algum dia fizer sentido migrar a própria
   Pascoal (hoje não há motivo — arquivo estático funciona bem pro único cliente real).
6. Manter `data/_template/` como está — continua sendo a referência de quais campos existem no
   formato legado, mesmo que nenhum projeto novo volte a usá-lo.

## O que NÃO fazer nessa migração

Não trocar a validação de código de acesso (`lib/access-code.ts`) para o servidor como parte
dessa migração — são mudanças independentes. A nota de segurança já existente em
`lib/access-code.ts` (mover pra uma Route Handler com cookie assinado) é uma melhoria separada,
coberta em termos gerais por `docs/project-creation.md` seção 18 (Segurança — Rate Limit,
tokens temporários), que pode acontecer antes, depois ou nunca, sem depender do Supabase.
