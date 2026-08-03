# Onboarding (engenharia)

Este documento é para quem vai **mexer no código**. Se você só precisa cadastrar um cliente
novo sem tocar em componentes, o guia certo é `data/README.md` (e o checklist dentro de
`data/_template/README.md` depois de copiar a pasta).

## Primeira vez rodando o projeto

```bash
git clone <repo>
cd procreating
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SITE_URL se for testar OG/canonical; opcional em dev
npm run dev
```

Abra `http://localhost:3000` — Home placeholder da plataforma. O cliente Pascoal está em
`http://localhost:3000/clients/pascoal`, o único registrado hoje.

## Se orientar no código

Leia `docs/architecture.md` primeiro — explica a rota de dados (`data/` → `lib/clients/` →
páginas → componentes via props) e por que os componentes nunca importam `data/` diretamente.
Depois disso:

- Mexendo em **UI/animação de uma seção específica** → está em `components/landing/`,
  `components/gallery/` ou `components/prospeccao/`. Cada seção recebe tudo via props
  tipadas (`XSectionProps`) — não deveria ter texto/valor hardcoded lá dentro.
- Mexendo em **lógica compartilhada entre telas** (contagem regressiva, form de senha,
  comportamento de modal) → está em `hooks/`. Ver a lista em `docs/architecture.md`.
- Mexendo nos **tipos** do config de cliente → `lib/clients/types.ts`. Lembre que campo sem `?`
  é obrigatório de propósito — só torne algo opcional se genuinamente for opcional pro
  produto, não pra "facilitar" um cliente incompleto.
- Adicionando um **cliente novo** → não é uma tarefa de engenharia, é preencher
  `data/<slug>/*.ts` + uma linha em `lib/clients/registry.ts`. Ver `data/README.md`.

## Antes de abrir um PR

```bash
npm run typecheck
npm run build
```

Se sua mudança tocou em algum componente renderizado (não só em `data/`), suba `npm run dev` e
confira visualmente `/clients/pascoal` — é a referência visual do projeto, nada deveria mudar visual
ou funcionalmente ali sem ser essa a intenção explícita da mudança.

## Onde as coisas ficam (mapa rápido)

| Pergunta | Resposta |
|---|---|
| Como um cliente novo é cadastrado? | `data/README.md` |
| Por que a estrutura é assim? | `docs/architecture.md` |
| Como funciona o bucket de vídeos? | `docs/r2.md` |
| Como vai ficar quando trocar pra banco de dados? | `docs/supabase.md` |
| Como o deploy funciona? | `docs/deploy.md` |
| O que falta / vem depois? | `docs/roadmap.md` |
