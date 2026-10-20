# Apresentação offline (presencial)

Versão da apresentação **Pascoal — Projeto Inicial** (`/clients/pascoal/public/past`) que roda
**100% no seu computador, sem internet**. Mesmo visual, mesmos textos, mesmas animações e os mesmos
vídeos do site online, só que servidos do disco.

O site online (Vercel + R2) **não foi alterado** e continua funcionando igual.

---

## Uso rápido (dia da reunião)

```bash
cd ~/git/procreating
npm run presentation
```

O navegador abre sozinho em:

```
http://127.0.0.1:4000/clients/pascoal/public/past
```

(Se a porta 4000 estiver ocupada, o terminal mostra a porta usada.)

1. Coloque o navegador em tela cheia: **⌃⌘F** (Chrome e Safari).
2. Apresente. **Clique num vídeo → ele começa a tocar com som.** `Esc` fecha.
3. Para encerrar: **Ctrl+C** no terminal.

A internet pode estar totalmente desligada (Wi-Fi, cabo, 4G).

---

## Antes da reunião (com internet, uma vez)

```bash
npm run sync:offline
```

Esse comando:

1. lê quais vídeos a apresentação usa (em `data/pascoal/videos.ts` e `data/pascoal/config.ts`, os
   mesmos arquivos do site online; não existe lista manual);
2. baixa os vídeos do R2 para o seu computador (≈1,1 GB na primeira vez; depois só baixa o que
   mudou). Se a conexão cair, o download retoma de onde parou;
3. copia imagens, logo e fotos da galeria;
4. confere todos os vídeos;
5. prepara a apresentação (build);
6. testa tudo servindo localmente e pré-gera as miniaturas da galeria.

Terminou com `✓ Pronto`? Pode desligar a internet.

> O R2 é um bucket público. **Nenhuma credencial é usada nem salva** em lugar nenhum.

### Recomendado: teste final sem internet

```bash
npm run test:offline
```

Abre o Google Chrome em modo invisível **com a internet bloqueada** e clica em cada vídeo como uma
pessoa faria. Confere se cada vídeo toca, se tem áudio, se as imagens e fontes carregam, se não há
erros no console e se **nenhuma** request sai do computador. Termina com
`✓ Teste no navegador sem internet: tudo OK.`

Para só conferir os arquivos de vídeo (existe, tamanho, codec, áudio):

```bash
npm run validate:offline
```

---

## Onde ficam os vídeos

```
offline/public/assets/videos/
  hero-background.mp4        ← vídeo de fundo do topo
  social-vertical-01.mp4     ← 01. Nosso processo de produção
  social-vertical-02.mp4     ← 02. Nossos Serviços
  social-horizontal-01.mp4   ← 03. Entrevista com Pascoal
  acquisition-01.mp4         ← 01. Disparo
  presentation-02.mp4        ← 02. Vídeo de Apresentação
```

Os nomes vêm do `id` de cada vídeo em `data/pascoal/videos.ts`. Esses arquivos **não vão para o
git** nem para o deploy (são grandes demais).

---

## Trocar ou adicionar um vídeo

O fluxo é o mesmo do site online:

1. Suba o vídeo novo no R2 (como já é feito hoje).
2. Edite `data/pascoal/videos.ts` (novo `videoSrc`/`downloadHref`, ou um item novo).
3. Rode `npm run sync:offline`.
4. Rode `npm run presentation`.

O sync detecta sozinho o vídeo novo, baixa, e apaga do disco o que não é mais usado.

---

## Se um vídeo não tocar

1. Rode `npm run validate:offline`. Ele mostra qual vídeo tem problema (arquivo faltando,
   download incompleto, codec incompatível).
2. Faltando ou incompleto: com internet, rode `npm run sync:offline`.
3. O player mostra "Arquivo local deste vídeo não encontrado": o mesmo caso do item 2.
4. O vídeo abre mas fica parado: clique no ▶ dos controles. Não deveria acontecer, porque o clique
   no card já inicia o vídeo com som, mas é o comportamento padrão caso o navegador bloqueie.
5. Sem som: confira o volume do Mac e a saída de áudio (HDMI/projetor). Todos os vídeos atuais
   têm faixa de áudio (o `validate:offline` confirma).
6. Mudou código/dados e algo quebrou: `npm run presentation` refaz o build sozinho quando detecta
   mudança. Se o build falhar, o erro aparece no terminal.

**Erro "A apresentação offline ainda não foi preparada"**: rode `npm run sync:offline` (com
internet) pelo menos uma vez neste computador.

---

## O que funciona offline

| Item | Offline |
|---|---|
| Apresentação completa (hero, fotos, vídeos, prospecção, rodapé) | ✓ |
| Vídeo de fundo, 5 vídeos com áudio, botão de download | ✓ (arquivos locais) |
| Fontes (Instrument Sans / JetBrains Mono) | ✓ (arquivos em `offline/fonts/`) |
| Galeria (código `pascoal`), Central de Prospecção (código `admin`) | ✓ |
| Proposta de Continuidade (aparece no menu após 10 s) | ✓ |
| Links que levam para fora: WhatsApp, Instagram, "Google Drive" da galeria | ✗ precisam de internet (só abrem se alguém clicar) |

---

## Como funciona (para quem for mexer no código)

- `offline/` é um **app Next.js separado** (próprio build em `offline/.next`, próprio `public/`).
  Ele reusa os componentes e os dados do app online via `@/…` **sem modificá-los**.
- `offline/lib/offline-data.ts` troca cada URL do R2 pelo arquivo local
  (`offline/generated/manifest.json`). Não existe fallback remoto: se faltar um vídeo, o build
  falha com uma mensagem clara.
- `offline/components/offline-how-it-works-section.tsx` é uma cópia fiel da seção de vídeos, com
  um player (`offline-video-player.tsx`) que chama `video.play()` **dentro do clique**. É isso que
  faz Chrome e Safari liberarem o som no primeiro clique. Ao passar o mouse sobre um card, aquele
  vídeo é pré-carregado; só um fica em buffer por vez, para economizar memória.
- Sem Vercel Analytics e sem Google Fonts no app offline.
- Scripts em `scripts/offline/`: `sync.mjs`, `presentation.mjs`, `validate.mjs`, `browser-test.mjs`.
- `offline/` está no `.vercelignore` e fora do `tsconfig.json` raiz. O deploy online ignora tudo isso.
- Requer Node 22.18+ (os scripts leem `data/pascoal/*.ts` direto).
