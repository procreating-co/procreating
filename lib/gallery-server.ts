import fs from "node:fs";
import path from "node:path";
import type { GalleryFolder, GalleryFolderDef } from "@/lib/gallery";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Lê as fotos de cada pasta em `public/gallery/<clientSlug>/<id>/`. Basta soltar
 * novos arquivos de imagem dentro da pasta correspondente — eles aparecem
 * automaticamente na Galeria, sem editar nenhum componente.
 *
 * Server-only: usa `fs`/`path`, por isso fica separado de `lib/gallery.ts` (que é
 * seguro para importar em componentes "use client"). Só importe este arquivo a
 * partir de Server Components (ex.: `app/clients/[client]/galeria/page.tsx`).
 *
 * Migração futura para Supabase Storage/R2: troque apenas o corpo desta função
 * (ex.: `await supabase.storage.from("gallery").list(`${clientSlug}/${id}`)`),
 * mantendo a mesma assinatura `Promise<GalleryFolder[]>`. Nenhum componente
 * de UI precisa mudar — todos consomem `GalleryFolder`/`GalleryPhoto`.
 */
export async function getGalleryFolders(clientSlug: string, folderDefs: GalleryFolderDef[]): Promise<GalleryFolder[]> {
  const galleryRoot = path.join(process.cwd(), "public", "gallery", clientSlug);

  return folderDefs.map(({ id, label }) => {
    let files: string[] = [];
    try {
      files = fs
        .readdirSync(path.join(galleryRoot, id))
        .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
    } catch {
      files = [];
    }
    files.sort();

    const photos = files.map((file) => ({ src: `/gallery/${clientSlug}/${id}/${file}`, alt: `${label} — ${file}` }));
    return { id, label, photos };
  });
}
