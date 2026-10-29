import type { GalleryFolderDef, GalleryPhoto } from "@/lib/clients/types";
import { r2Url } from "@/lib/r2";

/**
 * Galeria da Dra. Pâmela, servida direto do Cloudflare R2 (bucket público dedicado). As fotos
 * entram como `photos` explícitas na pasta, então `getGalleryFolders` usa essas URLs em vez de ler
 * o disco (ver `lib/gallery-server.ts`). O host está liberado em `next.config.mjs`
 * (`images.remotePatterns`) pro otimizador do Next gerar thumbnails AVIF/WebP; o lightbox serve o
 * ORIGINAL (qualidade máxima) e o download passa pelo proxy `/api/download`.
 *
 * Pasta única → a Galeria detecta e mostra tudo numa grade plana (modo "flat").
 *
 * ATENÇÃO (lista parcial): o bucket `r2.dev` não permite listar o conteúdo, então estes nomes
 * vieram da listagem (paginada) do dashboard e cobrem 125 fotos. Há mais no bucket —
 * faltam os números não colados (ex.: 3-9, 22-99, 190 e possivelmente acima de 211). Basta
 * adicionar os nomes que faltam em `PHOTO_FILES` que eles aparecem automaticamente.
 */
export const R2_PAMELA_BASE = "https://pub-8eeaba32ed6d495293e15b112eb0184b.r2.dev";

/** Arquivos das fotos, dentro do prefixo `fotos/` do bucket, em ordem numérica. */
const PHOTO_FILES = [
  "1-_MG_0656.jpg",
  "2-_MG_0652.jpg",
  "10-_MG_0618.jpg",
  "11-_MG_0614.jpg",
  "12-_MG_0593.jpg",
  "13-_MG_0587.jpg",
  "14-_MG_0585.jpg",
  "15-_MG_0583.jpg",
  "16-_MG_0579.jpg",
  "17-_MG_0578.jpg",
  "18-_MG_0576.jpg",
  "19-_MG_0571.jpg",
  "20-_MG_0568.jpg",
  "21-_MG_0548.jpg",
  "100-_MG_0209.jpg",
  "101-_MG_0200.jpg",
  "102-_MG_0157.jpg",
  "103-_MG_0155.jpg",
  "104-_MG_0153.jpg",
  "105-_MG_0143.jpg",
  "106-_MG_0142.jpg",
  "107-_MG_0110.jpg",
  "108-_MG_0098.jpg",
  "109-_MG_0089.jpg",
  "110-_MG_0079.jpg",
  "111-_MG_0075.jpg",
  "112-_MG_0065.jpg",
  "113-_MG_0063.jpg",
  "114-_MG_0061.jpg",
  "115-_MG_0055.jpg",
  "116-_MG_0053.jpg",
  "117-_MG_0045.jpg",
  "118-_MG_0044.jpg",
  "119-_MG_0029.jpg",
  "120-_MG_0016.jpg",
  "121-_MG_0010.jpg",
  "122-_MG_0009.jpg",
  "123-_MG_0001.jpg",
  "124-_MG_9981.jpg",
  "125-_MG_9979.jpg",
  "126-_MG_9972.jpg",
  "127-_MG_9965.jpg",
  "128-_MG_9961.jpg",
  "129-_MG_9960.jpg",
  "130-_MG_9959.jpg",
  "131-_MG_9948.jpg",
  "132-_MG_9940.jpg",
  "133-_MG_9939.jpg",
  "134-_MG_9932.jpg",
  "135-_MG_9929.jpg",
  "136-_MG_9925.jpg",
  "137-_MG_9923.jpg",
  "138-_MG_9922.jpg",
  "139-_MG_9921.jpg",
  "140-_MG_9920.jpg",
  "141-_MG_9917.jpg",
  "142-_MG_9909.jpg",
  "143-_MG_9907.jpg",
  "144-_MG_9904.jpg",
  "145-_MG_9903.jpg",
  "146-_MG_9901.jpg",
  "147-_MG_9900.jpg",
  "148-_MG_9899.jpg",
  "149-_MG_9893.jpg",
  "150-_MG_9890.jpg",
  "151-_MG_9885.jpg",
  "152-_MG_9883.jpg",
  "153-_MG_9879.jpg",
  "154-_MG_9877.jpg",
  "155-_MG_9873.jpg",
  "156-_MG_9862.jpg",
  "157-_MG_9861.jpg",
  "158-_MG_9855.jpg",
  "159-_MG_9851.jpg",
  "160-_MG_9847.jpg",
  "161-_MG_9829.jpg",
  "162-_MG_9825.jpg",
  "163-_MG_9819.jpg",
  "164-_MG_9818.jpg",
  "165-_MG_9816.jpg",
  "166-_MG_9815.jpg",
  "167-_MG_9813.jpg",
  "168-_MG_9811.jpg",
  "169-_MG_9808.jpg",
  "170-_MG_9807.jpg",
  "171-_MG_9801.jpg",
  "172-_MG_9799.jpg",
  "173-_MG_9783.jpg",
  "174-_MG_9774.jpg",
  "175-_MG_9770.jpg",
  "176-_MG_9758.jpg",
  "177-_MG_9741.jpg",
  "178-_MG_9738.jpg",
  "179-_MG_9728.jpg",
  "180-_MG_3051.jpg",
  "181-_MG_3050.jpg",
  "182-_MG_3049.jpg",
  "183-_MG_3048.jpg",
  "184-_MG_3027.jpg",
  "185-_MG_3027.jpg",
  "186-_MG_3004.jpg",
  "187-_MG_3003.jpg",
  "188-_MG_3002.jpg",
  "189-_MG_3001.jpg",
  "191-_MG_2997.jpg",
  "192-_MG_2996.jpg",
  "193-_MG_2994.jpg",
  "194-_MG_2993.jpg",
  "195-_MG_2989.jpg",
  "196-_MG_2987.jpg",
  "197-_MG_2986.jpg",
  "198-_MG_2982.jpg",
  "199-_MG_2981.jpg",
  "200-_MG_2973.jpg",
  "201-Cópia de IMG_4412.jpg",
  "202-Cópia de IMG_4410.jpg",
  "203-Cópia de IMG_4407.jpg",
  "204-_MG_2564.jpg",
  "205-_MG_2563.jpg",
  "206-_MG_2562.jpg",
  "207-_MG_2558.jpg",
  "208-_MG_2555.jpg",
  "209-_MG_2554.jpg",
  "210-_MG_2553.jpg",
  "211-_MG_2552.jpg",
];

/** 6 fotos destaque pro carrossel da Home (config.ts), distribuídas ao longo do ensaio. */
const HOME_FILES = [
  "1-_MG_0656.jpg",
  "111-_MG_0075.jpg",
  "136-_MG_9925.jpg",
  "160-_MG_9847.jpg",
  "185-_MG_3027.jpg",
  "211-_MG_2552.jpg",
];

function toPhotos(files: string[]): GalleryPhoto[] {
  return files.map((file, i) => ({
    src: r2Url(R2_PAMELA_BASE, `fotos/${file}`),
    alt: `Dra. Pâmela Lande — foto ${String(i + 1).padStart(2, "0")}`,
  }));
}

/** Fotos do carrossel da Home (6 destaque). Fonte única reusada em `config.ts`. */
export const galleryPhotos: GalleryPhoto[] = toPhotos(HOME_FILES);

export const galleryFolderDefs: GalleryFolderDef[] = [
  {
    id: "galeria",
    label: "Galeria Dra. Pâmela",
    photos: toPhotos(PHOTO_FILES),
  },
];
