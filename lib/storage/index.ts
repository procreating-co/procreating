import { mockStorageProvider } from "@/lib/storage/mock-provider";
import type { StorageProvider } from "@/lib/storage/types";

export type {
  StorageProvider,
  StorageCategory,
  StorageFile,
  UploadFileInput,
  UploadFileResult,
  GenerateClientStructureOptions,
  GenerateClientStructureResult,
} from "@/lib/storage/types";
export { STORAGE_CATEGORIES } from "@/lib/storage/path";

/** Única linha que muda quando o R2 for conectado de verdade — mesma ideia de
 *  `lib/admin/auth/index.ts` e `lib/clients/registry.ts`. */
const storageProvider: StorageProvider = mockStorageProvider;

export const uploadFile = storageProvider.uploadFile;
export const deleteFile = storageProvider.deleteFile;
export const getFileUrl = storageProvider.getFileUrl;
export const listFiles = storageProvider.listFiles;
export const generateClientStructure = storageProvider.generateClientStructure;
