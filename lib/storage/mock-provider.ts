import "server-only";
import { buildObjectKey, buildObjectUrl, clientStructurePrefixes } from "@/lib/storage/path";
import type {
  GenerateClientStructureOptions,
  GenerateClientStructureResult,
  StorageFile,
  StorageProvider,
  UploadFileInput,
  UploadFileResult,
} from "@/lib/storage/types";

/**
 * URL base do bucket público — igual espírito do `R2_PUBLIC_BASE` em `data/<slug>/videos.ts`,
 * só que vindo de env var em vez de literal (ninguém pode hardcodar URL de bucket neste módulo).
 * Sem a env var, `getFileUrl` cai num placeholder óbvio (`/mock-storage/...`) que nunca
 * resolve de verdade — deixa claro visualmente que é mock.
 */
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? "";

/**
 * Implementação MOCK e TEMPORÁRIA do `StorageProvider` — guarda os arquivos "enviados" num
 * Map em memória (só dura enquanto o processo do servidor Next estiver de pé; não sobrevive a
 * um redeploy nem é compartilhado entre instâncias). Existe pra dar algo funcional pra testar
 * o fluxo de upload/list/delete antes do R2 estar conectado de verdade — não é um mock "burro"
 * que só lança erro, mas também não é persistência real.
 *
 * Troque por uma implementação real (ex.: `@aws-sdk/client-s3` contra o endpoint S3-compatível
 * do R2) satisfazendo a mesma interface quando for conectar de verdade.
 */
const memoryStore = new Map<string, { size: number; lastModified: string; contentType?: string }>();

export const mockStorageProvider: StorageProvider = {
  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const key = buildObjectKey(input.clientSlug, input.path);
    const size = input.file instanceof Blob ? input.file.size : input.file.byteLength;
    memoryStore.set(key, { size, lastModified: new Date().toISOString(), contentType: input.contentType });
    return { key, url: mockStorageProvider.getFileUrl(key) };
  },

  async deleteFile(key: string): Promise<void> {
    memoryStore.delete(key);
  },

  getFileUrl(key: string): string {
    if (!R2_PUBLIC_BASE_URL) return `/mock-storage/${key}`;
    return buildObjectUrl(R2_PUBLIC_BASE_URL, key);
  },

  async listFiles(prefix: string): Promise<StorageFile[]> {
    const results: StorageFile[] = [];
    for (const [key, meta] of memoryStore.entries()) {
      if (key.startsWith(prefix)) {
        results.push({ key, url: mockStorageProvider.getFileUrl(key), size: meta.size, lastModified: meta.lastModified });
      }
    }
    return results;
  },

  async generateClientStructure(
    clientSlug: string,
    options?: GenerateClientStructureOptions,
  ): Promise<GenerateClientStructureResult> {
    // Storage S3-compatível (R2 incluso) não tem "pasta" como objeto de primeira classe —
    // prefixos existem implicitamente a partir do primeiro upload dentro deles. Esta função
    // não precisa criar nada de verdade num R2 real; ela só computa e devolve os prefixos
    // esperados, pra UI do admin já mostrar a estrutura antes do primeiro upload.
    return { prefixes: clientStructurePrefixes(clientSlug, options?.photoFolders) };
  },
};
