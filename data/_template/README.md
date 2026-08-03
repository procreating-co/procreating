# Template de cliente

Você copiou esta pasta para `data/<slug>/` — aqui está o que falta pra esse cliente subir em
`/clients/<slug>`. Para o contexto completo (por que a arquitetura é assim, convenção de pastas no R2,
limitações conhecidas), veja `data/README.md` um nível acima. Este arquivo é só o checklist rápido
de dentro da pasta copiada.

## Checklist

- [ ] Renomeei a pasta para `data/<slug>/` (o nome real do cliente, kebab-case).
- [ ] `config.ts`: preenchi todo campo obrigatório (sem `?` no tipo). Rodei `npx tsc --noEmit` —
      se algo essencial ficou faltando, o erro aponta exatamente o campo.
- [ ] `config.ts`: decidi se este cliente tem o módulo de Prospecção (`prospeccao: {...}`) ou não
      (`prospeccao: null` — já é o padrão do template).
- [ ] `config.ts`: decidi a cor de destaque (`theme.accentColor`) — vira `var(--client-accent)`
      em toda a UI automaticamente, sem editar nenhum componente.
- [ ] `videos.ts`: subi os 5 vídeos no bucket R2 em `clients/<slug>/videos/` (ver `docs/r2.md`) e
      apontei `videoSrc`/`downloadHref` pra lá — de preferência usando o helper `r2Url()`
      (`@/lib/r2`) em vez de montar a URL na mão.
- [ ] `gallery.ts`: listei as pastas da galeria (`{ id, label }`).
- [ ] Criei `public/gallery/<slug>/<id>/` pra cada pasta listada acima e soltei as fotos dentro
      (aparecem automaticamente, sem editar código).
- [ ] Coloquei o logo em `public/images/` e apontei `logo` no `config.ts` pra ele.
- [ ] Coloquei as fotos do carrossel da Home em `public/images/gallery/` e apontei
      `features.photos` no `config.ts` pra elas.
- [ ] Registrei o cliente em `lib/clients/registry.ts` (import + linha no `REGISTRY`) — sem isso
      `/clients/<slug>` dá 404 mesmo com tudo preenchido certo.
- [ ] `npm run dev` e conferi `/clients/<slug>`, `/clients/<slug>/galeria` e (se aplicável)
      `/clients/<slug>/prospeccao`.

## Onde cada coisa vive

| Arquivo | O que é |
|---|---|
| `config.ts` | Todo o texto, cores, senhas e metadata do cliente. |
| `videos.ts` | Os 5 `VideoItem` (2 vídeos verticais + 1 horizontal de redes sociais, 1 de disparo, 1 de apresentação). |
| `gallery.ts` | Só a lista de pastas da galeria (`{ id, label }`) — as fotos em si vêm do filesystem. |
