"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Chamadas da página pública `/propostas/[slug]` — sem sessão nenhuma (o lead não tem conta no
 * ERP). Cada uma é um wrapper fino em cima de uma função `SECURITY DEFINER` (migration
 * `20260828000000_proposals.sql`), que já resolve slug + checa status no mesmo passo. Mesma
 * separação de `lib/portal/auth/invites.ts` (Client Portal): a função de banco faz a checagem
 * de verdade, o wrapper só existe porque `"use server"` não pode ficar dentro de um arquivo
 * `server-only` genérico.
 */
export type PublicProposal = { id: string; title: string; status: string; brandName: string; accentColor: string; sections: { sectionType: string; content: Record<string, unknown> }[] } | null;

export async function getPublicProposalAction(slug: string): Promise<PublicProposal> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_proposal", { p_slug: slug });
  return (data as PublicProposal) ?? null;
}

export async function recordProposalViewAction(slug: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("record_proposal_view", { p_slug: slug });
}

export async function respondPublicProposalAction(slug: string, response: "accepted" | "rejected"): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("respond_public_proposal", { p_slug: slug, p_response: response });
  return data ?? false;
}
