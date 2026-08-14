"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";

export type UploadAvatarResult = { ok: true; avatarUrl: string } | { ok: false; error: string };

const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4MB — foto de perfil, não precisa de mais que isso.

/**
 * Sobe a foto pro bucket `avatars` (Supabase Storage — primeira vez que Storage é usado neste
 * projeto, ver a migration `20260814240000_users_avatar_and_storage.sql`) e grava a URL pública
 * em `users.avatar_url`. Caminho fixo por usuário (`<userId>.<ext>`) + `upsert: true` — troca a
 * foto no lugar, não acumula arquivo velho a cada novo upload.
 */
export async function uploadAvatarAction(formData: FormData): Promise<UploadAvatarResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione uma imagem." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "O arquivo precisa ser uma imagem." };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, error: "Imagem muito grande — no máximo 4MB." };

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${userId}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { ok: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust — mesmo `path` de antes, senão o navegador (e o Next Image, se algum dia usado)
  // segura a foto antiga em cache indefinidamente depois de um re-upload.
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", userId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/", "layout");
  return { ok: true, avatarUrl };
}
