import type { Asset } from "@/lib/supabase/types/database";

/**
 * Asset Manifest — a forma organizada que um projeto expõe sua mídia. Componentes nunca devem
 * conhecer a organização física do bucket R2 (chave, prefixo, convenção de pasta) — sempre
 * consomem o Manifest, que já vem agrupado por categoria de uso.
 *
 * `photos` é um mapa categoria→lista (ex.: `{ equipe: [...], "zona-sul": [...] }`) — a mesma
 * ideia de pasta de galeria de hoje, só que a categoria vem do campo `Asset.category`
 * (`"gallery:<pasta>"`) em vez de existir como uma tabela de pasta separada.
 */
export type AssetManifest = {
  hero: Asset | null;
  logo: Asset | null;
  ogImage: Asset | null;
  photos: Record<string, Asset[]>;
  videos: {
    social: Asset[];
    acquisition: Asset | null;
    presentation: Asset | null;
  };
  pdfs: Asset[];
  documents: Asset[];
  files: Asset[];
};

const GALLERY_PREFIX = "gallery:";

/**
 * Agrupa uma lista plana de `Asset` (como viria de uma query `WHERE project_id = ... AND
 * status = 'ready'`) no formato que os componentes consomem. Pura — sem I/O, sem R2, sem
 * banco — testável isoladamente.
 */
export function buildAssetManifest(assets: Asset[]): AssetManifest {
  const manifest: AssetManifest = {
    hero: null,
    logo: null,
    ogImage: null,
    photos: {},
    videos: { social: [], acquisition: null, presentation: null },
    pdfs: [],
    documents: [],
    files: [],
  };

  const ready = assets.filter((asset) => asset.status === "ready").sort((a, b) => a.sort_order - b.sort_order);

  for (const asset of ready) {
    if (asset.category === "hero") {
      manifest.hero = asset;
    } else if (asset.category === "logo") {
      manifest.logo = asset;
    } else if (asset.category === "og_image") {
      manifest.ogImage = asset;
    } else if (asset.category.startsWith(GALLERY_PREFIX)) {
      const folder = asset.category.slice(GALLERY_PREFIX.length);
      manifest.photos[folder] = [...(manifest.photos[folder] ?? []), asset];
    } else if (asset.category === "social") {
      manifest.videos.social.push(asset);
    } else if (asset.category === "acquisition") {
      manifest.videos.acquisition = asset;
    } else if (asset.category === "presentation") {
      manifest.videos.presentation = asset;
    } else if (asset.type === "PDF") {
      manifest.pdfs.push(asset);
    } else if (asset.type === "DOCUMENT") {
      manifest.documents.push(asset);
    } else {
      manifest.files.push(asset);
    }
  }

  return manifest;
}
