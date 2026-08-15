"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ContactFormInput = {
  name: string;
  roleTitle: string;
  email: string;
  whatsapp: string;
  isPrimary: boolean;
};

/** "Editar cliente" ficava incompleto sem isto — contato só nascia via onboarding
 *  (`close_lead_and_create_client`), sem nenhuma forma de adicionar/editar/remover depois. Se
 *  `isPrimary` for marcado, desmarca o principal anterior primeiro (nunca 2 principais ao mesmo
 *  tempo) — mesma regra implícita que `is_primary` sempre teve, só nunca tinha UI que pudesse
 *  violar. */
async function clearOtherPrimaries(clientId: string, exceptContactId?: string) {
  const supabase = await createClient();
  let query = supabase.from("client_contacts").update({ is_primary: false }).eq("client_id", clientId).eq("is_primary", true);
  if (exceptContactId) query = query.neq("id", exceptContactId);
  await query;
}

export async function createContactAction(clientId: string, input: ContactFormInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome do contato." };

  const supabase = await createClient();
  if (input.isPrimary) await clearOtherPrimaries(clientId);

  const { error } = await supabase.from("client_contacts").insert({
    client_id: clientId,
    name: input.name.trim(),
    role_title: input.roleTitle || null,
    email: input.email || null,
    whatsapp: input.whatsapp || null,
    is_primary: input.isPrimary,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

export async function updateContactAction(contactId: string, clientId: string, input: ContactFormInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome do contato." };

  const supabase = await createClient();
  if (input.isPrimary) await clearOtherPrimaries(clientId, contactId);

  const { error } = await supabase
    .from("client_contacts")
    .update({
      name: input.name.trim(),
      role_title: input.roleTitle || null,
      email: input.email || null,
      whatsapp: input.whatsapp || null,
      is_primary: input.isPrimary,
    })
    .eq("id", contactId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

export async function deleteContactAction(contactId: string, clientId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("client_contacts").delete().eq("id", contactId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}
