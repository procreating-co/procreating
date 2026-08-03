# Deploy

## Fluxo atual: GitHub → Vercel

O repositório está linkado a um projeto [v0.app](https://v0.app) (ver `README.md` na raiz), que
por sua vez está conectado ao Vercel. **Todo merge em `main` dispara deploy automático em
produção** — não existe passo manual de "publicar". Não há `vercel.json` no repo; a config de
build (framework preset Next.js, comando de build, diretório de output) é a detectada
automaticamente pelo Vercel.

Isso significa: revisar bem antes de dar merge em `main`, porque não tem gate manual depois.

## Antes de dar merge

```bash
npm run typecheck   # tsc --noEmit
npm run build        # build de produção — agora falha em erro de tipo (ver nota abaixo)
```

`next.config.mjs` **não** tem mais `typescript.ignoreBuildErrors` — até uma versão anterior
deste projeto, o build passava mesmo com erro de tipo (só `tsc --noEmit` manual pegava). Isso foi
corrigido: hoje `npm run build` falha de verdade se houver erro de tipo, então rodar os dois
comandos acima antes de commitar é redundante em teoria, mas rodar `typecheck` primeiro dá um
erro mais rápido de ler (build também faz linting/otimização, é mais lento pra iterar).

Se você adicionou/editou um cliente, confira visualmente `/clients/<slug>`,
`/clients/<slug>/galeria` e (se aplicável) `/clients/<slug>/prospeccao` com `npm run dev` antes do PR.

## Variáveis de ambiente

| Variável | Obrigatória? | Uso |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Não (tem fallback) | URL pública de produção, usada como `metadataBase` pra resolver URLs absolutas de Open Graph/Twitter Card/canonical. Sem ela, cai em `http://localhost:3000` (funciona em dev, mas o preview do link ao compartilhar em produção fica com URL errada — configure no Vercel). |

Nenhuma outra variável de ambiente é necessária: o bucket R2 é público (leitura sem
credencial) e não há integração com banco de dados ainda (ver `docs/supabase.md`).

Configure `NEXT_PUBLIC_SITE_URL` nas **Environment Variables** do projeto no Vercel (não só no
`.env.local`, que não é commitado nem lido em produção).

## Cloudflare R2

Vídeos são hospedados fora do Vercel, num bucket público do Cloudflare R2. Upload de arquivo
novo é manual (painel Cloudflare ou CLI), não faz parte do fluxo de deploy deste repo. Detalhes
completos, incluindo a convenção de pastas por cliente, em `docs/r2.md`.

## Rollback

Sem processo automatizado — usar o painel do Vercel (aba **Deployments**) pra promover um
deploy anterior de volta a produção, ou reverter o commit em `main` e deixar o auto-deploy
seguir o fluxo normal.
