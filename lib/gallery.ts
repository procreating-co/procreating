/**
 * Tipos da Galeria que podem ser importados tanto no servidor quanto no cliente. A leitura
 * de arquivos (que precisa de `fs`/`path`, só funciona no servidor) fica em
 * `lib/gallery-server.ts` — não importe esse outro arquivo a partir de um componente
 * "use client". Validação de código de acesso fica em `lib/access-code.ts`.
 */

export type { GalleryPhoto, GalleryFolder, GalleryFolderDef, GalleryVideo } from "@/lib/clients/types";

/**
 * As fotos da galeria são JPEGs de câmera (~1-2MB, resolução total) — pesados demais para
 * exibir em grades de thumbnail. Em vez de baixar o arquivo original, reaproveita o otimizador
 * de imagens embutido do Next.js (o mesmo endpoint que `next/image` já usa) para servir uma
 * versão redimensionada e em formato moderno (AVIF/WebP, configurado em `next.config.mjs`).
 */
export function optimizedGallerySrc(src: string, width: number, quality = 75) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
