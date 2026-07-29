"use server";

import { revalidatePath } from "next/cache";
import { deleteFile, uploadFile, STORAGE_CATEGORIES } from "@/lib/storage";
import type { StorageCategory } from "@/lib/storage";
import { mockProjects } from "@/lib/admin/projects/mock-data";

export type UploadFormState = { error: string } | { success: string } | undefined;

/**
 * Envia um arquivo pro `StorageProvider` mock (`lib/storage/mock-provider.ts`) — grava num Map
 * em memória do processo (não sobrevive a restart, não é R2 real ainda). `revalidatePath`
 * refaz a leitura de `listFiles` na página depois do envio.
 */
export async function uploadFileAction(_prevState: UploadFormState, formData: FormData): Promise<UploadFormState> {
  const projectSlug = String(formData.get("projectSlug") ?? "");
  const category = String(formData.get("category") ?? "");
  const file = formData.get("file");

  if (!mockProjects.some((project) => project.slug === projectSlug)) return { error: "Selecione um projeto válido." };
  if (!STORAGE_CATEGORIES.includes(category as StorageCategory)) return { error: "Selecione uma categoria válida." };
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo." };

  await uploadFile({ clientSlug: projectSlug, path: [category, file.name], file, contentType: file.type });
  revalidatePath("/admin/uploads");
  return { success: `"${file.name}" enviado.` };
}

export async function deleteFileAction(key: string): Promise<void> {
  await deleteFile(key);
  revalidatePath("/admin/uploads");
}
