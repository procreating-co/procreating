import type { StorageCategory } from "@/lib/storage/types";

/** Monta a chave do objeto no bucket a partir do slug do cliente + segmentos de caminho. */
export function buildObjectKey(clientSlug: string, path: string[]): string {
  return ["clients", clientSlug, ...path].join("/");
}

/**
 * Monta a URL pública a partir da chave, com percent-encoding por segmento — preserva as `/`
 * como separadoras (diferente de `lib/r2.ts`'s `r2Url`, que assume um único segmento de
 * filename; aqui a chave já vem com múltiplos segmentos, ex.: `clients/pascoal/videos/x.mp4`).
 */
export function buildObjectUrl(baseUrl: string, key: string): string {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

export function clientStructurePrefixes(clientSlug: string, photoFolders: string[] = []): string[] {
  const base = `clients/${clientSlug}`;
  const prefixes = [`${base}/videos/`, `${base}/logo/`, `${base}/og-image/`];
  for (const folder of photoFolders) {
    prefixes.push(`${base}/photos/${folder}/`);
  }
  return prefixes;
}

export const STORAGE_CATEGORIES: StorageCategory[] = ["videos", "photos", "logo", "og-image"];
