# Clientes

Este projeto é um template multi-cliente: o mesmo código (`app/`, `components/`, `lib/`) roda
para qualquer cliente em `/clients/<slug>`, mudando apenas os dados em `data/<slug>/`. Nenhum
componente conhece o nome, os textos ou as cores de um cliente específico — tudo chega via
props, carregadas por `lib/clients/`.

## Onboarding de um cliente novo

1. **Copie o template**: `cp -r data/_template data/<slug>`.
2. **Preencha `data/<slug>/config.ts`**: todo campo sem `?` é obrigatório — o `npx tsc --noEmit`
   falha imediatamente apontando o que falta, então não tem como esquecer nada essencial.
   - `theme.accentColor`: vira `var(--client-accent)` em toda a UI automaticamente.
   - `prospeccao` é opcional: deixe `null` para desativá-lo completamente (a rota
     `/clients/<slug>/prospeccao` faz 404, a seção some da Home, o CTA some do menu).
3. **Preencha `data/<slug>/videos.ts`**: suba os vídeos no bucket do Cloudflare R2 em
   `clients/<slug>/videos/<arquivo>.mp4` (esse prefixo por cliente é o padrão a partir daqui —
   veja a nota sobre a Pascoal abaixo) e aponte `videoSrc`/`downloadHref` para a URL pública.
4. **Preencha `data/<slug>/gallery.ts`**: uma entrada `{ id, label }` por pasta da galeria.
   As fotos em si não ficam no R2 — crie `public/gallery/<slug>/<id>/` e solte os arquivos de
   imagem lá dentro; eles aparecem automaticamente (auto-descoberta via filesystem).
5. **Logo e imagens locais**: coloque o logo em `public/images/<slug>-logo.png` e as fotos de
   destaque do carrossel da Home em `public/images/gallery/`, apontando os `src` em `config.ts`
   para esses caminhos.
6. **Registre o cliente** em `lib/clients/registry.ts`, adicionando um import + uma linha no
   objeto `REGISTRY`:
   ```ts
   import { clientConfig as elenitaConfig } from "@/data/elenita/config";
   import { clientVideos as elenitaVideos } from "@/data/elenita/videos";
   import { galleryFolderDefs as elenitaGalleryDefs } from "@/data/elenita/gallery";

   const REGISTRY: Record<string, ClientEntry> = {
     pascoal: { config: pascoalConfig, videos: pascoalVideos, galleryFolderDefs: pascoalGalleryDefs },
     elenita: { config: elenitaConfig, videos: elenitaVideos, galleryFolderDefs: elenitaGalleryDefs },
   };
   ```
   Esse passo manual existe porque o Next.js precisa de imports estáticos para incluir cada
   `data/<slug>/*` corretamente no bundle — um `import()` dinâmico a partir de um slug vindo da
   URL não é seguro de empacotar. Sem essa linha, `/clients/<slug>` retorna 404.
7. **Verifique**: `npx tsc --noEmit` (config incompleto quebra aqui), depois
   `npm run dev` e visite `/clients/<slug>`, `/clients/<slug>/galeria` e (se aplicável) `/clients/<slug>/prospeccao`.

## Convenção de pastas no R2

Todo cliente novo a partir deste template segue:
```
clients/<slug>/videos/<arquivo>.mp4
```
**Exceção**: o bucket da Pascoal já estava em produção antes deste template existir, com os
vídeos soltos na raiz (sem prefixo de pasta). Não foi reorganizado para não arriscar quebrar
URLs já em uso — `data/pascoal/videos.ts` aponta direto para a raiz do bucket. Todo cliente
novo, porém, deve seguir o padrão `clients/<slug>/videos/`.

## Limitação conhecida: cor de destaque

Apenas a cor primária (`theme.accentColor`) é configurável via `var(--client-accent)`. Alguns
componentes usam tons **derivados** dessa cor à mão (hover mais claro, contraste em fundo claro,
gradiente do easter egg do rodapé) como literais fixos (ex.: `#e0bd7d`, `#b8863b`, `#8a6d3b`,
`#f5dfa8` em `components/landing/navigation.tsx`, `components/prospeccao/prospeccao-experience.tsx`
e `app/globals.css`). Esses tons foram calibrados manualmente para a cor da Pascoal e **não**
se ajustam automaticamente para outra `accentColor`. Um cliente com uma cor de destaque muito
diferente do dourado atual pode ter esses detalhes (não a cor principal) levemente
inconsistentes até que alguém generalize essa derivação (ex.: com `color-mix()` em CSS).

## Migração futura para Supabase

Hoje `lib/clients/index.ts` lê os dados de `data/<slug>/*.ts` via o registro estático em
`lib/clients/registry.ts`. Quando isso migrar para Supabase, só essa camada muda — as funções
`getClientConfig`, `getClientVideos` e `getClientGalleryFolderDefs` mantêm a mesma assinatura,
passam a fazer uma query em vez de um lookup em objeto, e nenhum componente precisa mudar.
