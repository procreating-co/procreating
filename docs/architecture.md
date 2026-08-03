# Arquitetura

## O que é este projeto

Uma plataforma interna da Procreating para entregar projetos de posicionamento digital a
clientes. Todo cliente novo roda o **mesmo código** — mesmos componentes, mesmas animações,
mesma estrutura de página — em `/clients/<slug>`, mudando só os dados (textos, vídeos, fotos,
cores, senhas). Hoje só a Pascoal (`/clients/pascoal`) está em produção, mas a estrutura já
suporta N clientes sem duplicar nada.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript estrito.

## Rotas

```
app/
  page.tsx                        Home da plataforma — placeholder (não pertence a nenhum cliente)
  layout.tsx                      <html>, fontes, metadata genérica da plataforma, metadataBase
  robots.ts                       disallow all (ver "SEO" abaixo)
  api/download/route.ts           proxy de download dos vídeos do R2 (edge runtime)
  clients/[client]/
    layout.tsx                    resolve o cliente, injeta --client-accent, generateMetadata,
                                   generateStaticParams, notFound() se o slug não existir
    page.tsx                      Home do cliente: Nav, Hero, Features, HowItWorks, Infrastructure
                                   (se prospeccao !== null), Footer
    galeria/page.tsx               GalleryExperience
    prospeccao/page.tsx            notFound() se config.prospeccao === null; senão ProspeccaoExperience
```

Todas as rotas de cliente são **SSG** (`generateStaticParams` em `app/clients/[client]/layout.tsx`
lista os slugs registrados em `lib/clients/registry.ts`) — um cliente novo precisa de rebuild
pra aparecer, não é dinâmico em runtime. `/clients/<slug-não-registrado>` dá 404 em build time
(rota nem existe) e também em runtime, se algo tentar acessar diretamente.

`/api/download` roda em `edge` runtime (não SSG — aparece como rota dinâmica no build) porque
faz proxy de um fetch externo (R2) por request; ver `docs/r2.md`.

## Fluxo de dados: de `data/<slug>/` até a tela

```
data/<slug>/{config,videos,gallery}.ts
        │  (import estático)
        ▼
lib/clients/registry.ts   — REGISTRY: Record<slug, ClientEntry>
        │
        ▼
lib/clients/index.ts      — getClientConfig/getClientVideos/getClientGalleryFolderDefs(slug)
        │  (única camada que os componentes/rotas conhecem)
        ▼
app/clients/[client]/*.tsx — resolve o slug da URL, chama lib/clients, monta as props
        │
        ▼
components/**              — só recebem ClientConfig/ClientVideos/etc. via props, nunca
                              sabem que os dados vieram de um arquivo TS
```

Isso é deliberado: **nenhum componente importa de `data/` diretamente** (só
`lib/clients/registry.ts` e as `page.tsx` fazem). Quando a origem dos dados trocar para
Supabase (`docs/supabase.md`), só `lib/clients/index.ts` muda — o resto do código nem percebe.

Fotos da galeria são a exceção: continuam vindo do filesystem (`public/gallery/<slug>/<id>/`,
lidas em `lib/gallery-server.ts` via `fs.readdirSync`) em vez do R2 — decisão deliberada pra
manter a DX de "solta o arquivo, ele aparece" sem SDK novo.

## Camada de tipos

`lib/clients/types.ts` é a fonte única de verdade — `ClientConfig`, `ClientVideos`, `VideoItem`,
`GalleryFolder`/`GalleryPhoto`/`GalleryFolderDef`, `FeaturedPhoto`, `Metric`, `ProspeccaoConfig`.
Campo sem `?` é obrigatório: um `data/<slug>/config.ts` incompleto quebra `npx tsc --noEmit` e o
build imediatamente, com o campo exato apontado — nunca falha silenciosamente em produção.

`lib/clients/provider.ts` documenta o contrato (`ClientDataProvider`) que a camada de
carregamento satisfaz hoje via arquivos e satisfaria amanhã via Supabase — ver `docs/supabase.md`.

## Componentes

```
components/
  landing/      Navigation, HeroSection, FeaturesSection, HowItWorksSection,
                InfrastructureSection, FooterSection, VideoCard, VideoLightbox
  gallery/      GalleryExperience, LockScreen, PhotoLightbox
  prospeccao/   ProspeccaoExperience, LockScreen
  shared/       AnimatedRevealText — reveal de texto caractere por caractere,
                usado pela Galeria e pela Prospecção
  ui/           button.tsx — o único primitivo shadcn/ui realmente usado no projeto
                (o resto do scaffold padrão do v0.app foi removido; ver docs/roadmap.md)
```

Todo componente de seção recebe seus dados via props tipadas (`XSectionProps`) — zero texto
hardcoded. `InfrastructureSection` só é renderizada pela Home quando `config.prospeccao !==
null`; o CTA "Prospectar Parceiros" da Navigation segue a mesma regra via `showProspeccaoCta`.

**Lógica compartilhada** (não visual — cada tela mantém seu próprio JSX/estilo):
- `hooks/use-countdown.ts` — contagem regressiva, usada pelo teaser da Home e pela Prospecção.
- `hooks/use-access-code-form.ts` — state/submit das duas lock screens.
- `hooks/use-modal-behavior.ts` — Escape/setas/scroll-lock/focus-trap dos dois lightboxes
  (vídeo e foto).
- `lib/access-code.ts` — `isValidAccessCode`, comparação case-insensitive usada pelas duas
  telas de senha.

## Theming

Uma única cor por cliente: `config.theme.accentColor` (hex) é injetada como
`style={{ "--client-accent": ... }}` num wrapper em `app/clients/[client]/layout.tsx`. Componentes
referenciam `var(--client-accent)` via Tailwind arbitrary values (`text-[var(--client-accent)]`
etc.) em vez do hex direto. `app/globals.css` define um fallback (`#d4af6a`, o dourado da
Pascoal) pra nada quebrar se algo renderizar fora desse wrapper.

**Limitação conhecida**: só a cor primária é parametrizada. Alguns tons **derivados** dela
(hover mais claro, contraste em fundo branco, gradiente do easter egg) são literais fixos
calibrados à mão pra Pascoal — não se ajustam sozinhos pra outra `accentColor`. Detalhes e
arquivos afetados em `data/README.md`.

## Segurança da Galeria e da Prospecção

Ambas são portas com senha **client-side** — a checagem roda no navegador
(`lib/access-code.ts`), não há sessão/cookie/token. Deliberadamente **nunca persiste** o
desbloqueio (sem `localStorage`/`sessionStorage`): recarregar a página pede a senha de novo.
Suficiente pro nível de proteção necessário hoje (evitar que o link vaze acidentalmente pra
quem não devia ver), não para dados realmente sensíveis. Se isso precisar endurecer, a nota em
`lib/access-code.ts` já aponta o caminho (Route Handler + cookie assinado).

## Convenções

- Todo arquivo em `app/`/`components/`/`lib/`/`hooks/` é kebab-case.
- Imports sempre via alias `@/*` (nunca `../../`).
- Um cliente novo nunca edita componentes — só `data/<slug>/*` + uma linha em
  `lib/clients/registry.ts`. Ver `docs/onboarding.md` e `data/README.md`.
