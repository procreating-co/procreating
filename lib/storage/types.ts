/**
 * Contrato da camada de storage — toda comunicação com arquivos de cliente (vídeos, fotos,
 * logo) passa por aqui, nunca por URL montada na mão em outro lugar do admin. Hoje
 * implementado por um mock em memória (`mock-provider.ts`); a implementação real (Etapa
 * futura) fala com o Cloudflare R2 via API S3-compatível (`@aws-sdk/client-s3` contra o
 * endpoint do R2) satisfazendo esta mesma interface.
 *
 * Segue a convenção de pastas já documentada em `docs/r2.md`: `clients/<slug>/<categoria>/...`.
 * Não duplica nem substitui `lib/r2.ts` (helper simples de URL usado pelo template de
 * clientes, `data/_template/videos.ts`) — este módulo é a camada operacional do admin
 * (upload/delete/list), aquele é só string-building pra config estática.
 */

export type StorageCategory = "videos" | "photos" | "logo" | "og-image";

export type UploadFileInput = {
  clientSlug: string;
  /** Segmentos do caminho dentro de `clients/<slug>/` — ex.: `["photos", "equipe", "foto-01.jpg"]`
   *  ou `["videos", "social-01.mp4"]`. O primeiro segmento deveria ser um `StorageCategory`. */
  path: string[];
  file: Blob | Buffer;
  contentType?: string;
};

export type UploadFileResult = {
  /** Chave completa no bucket, ex.: `clients/pascoal/videos/social-01.mp4`. */
  key: string;
  url: string;
};

export type StorageFile = {
  key: string;
  url: string;
  size: number;
  /** ISO 8601 */
  lastModified: string;
};

export type GenerateClientStructureOptions = {
  /** Slugs das pastas de galeria já definidas pro cliente — ex.: `["equipe", "zona-sul"]`. */
  photoFolders?: string[];
};

export type GenerateClientStructureResult = {
  /** Prefixos que passam a existir pro cliente — útil pra UI do admin pré-visualizar a
   *  estrutura antes de qualquer upload real acontecer. */
  prefixes: string[];
};

export interface StorageProvider {
  uploadFile(input: UploadFileInput): Promise<UploadFileResult>;
  deleteFile(key: string): Promise<void>;
  /** Pura — só monta a URL, não confirma que o arquivo existe. */
  getFileUrl(key: string): string;
  listFiles(prefix: string): Promise<StorageFile[]>;
  /** Prepara (ou, no mock, só calcula) os prefixos de pasta de um cliente novo — ver nota em
   *  `mock-provider.ts` sobre por que isso é essencially um no-op num storage S3-compatível. */
  generateClientStructure(clientSlug: string, options?: GenerateClientStructureOptions): Promise<GenerateClientStructureResult>;
}
