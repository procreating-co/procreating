import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Proposal, ProposalSection, ProposalTemplate, ProposalVersion } from "@/lib/supabase/types/database";

export type ProposalWithSections = Proposal & { sections: ProposalSection[]; template: ProposalTemplate };

/** Propostas de um lead (drawer, §16 do plano) — mesmo padrão de `listQuotesForLead`
 *  (`lib/comercial/quotes.ts`), join manual em TS. */
export async function listProposalsForLead(leadId: string): Promise<Proposal[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("proposals").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  return data ?? [];
}

export async function listProposalTemplates(): Promise<ProposalTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("proposal_templates").select("*").order("title");
  return data ?? [];
}

/** Proposta completa pro editor (`/comercial/propostas/[id]`) — seções ordenadas + template
 *  (accent color/título do molde). */
export async function getProposalForEditor(proposalId: string): Promise<ProposalWithSections | null> {
  const supabase = await createClient();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("id", proposalId).maybeSingle();
  if (!proposal) return null;

  const [{ data: sections }, { data: template }] = await Promise.all([
    supabase.from("proposal_sections").select("*").eq("proposal_id", proposalId).order("position"),
    supabase.from("proposal_templates").select("*").eq("id", proposal.template_id).maybeSingle(),
  ]);

  if (!template) return null;
  return { ...proposal, sections: sections ?? [], template };
}

export async function listProposalVersions(proposalId: string): Promise<ProposalVersion[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("proposal_versions").select("*").eq("proposal_id", proposalId).order("version_number", { ascending: false });
  return data ?? [];
}

/** Nome do lead/cliente dono da proposta — o editor mostra "Proposta para {nome}" sem precisar
 *  buscar o lead inteiro. */
export async function getProposalOwnerName(proposal: Proposal): Promise<string | null> {
  const supabase = await createClient();
  if (proposal.lead_id) {
    const { data } = await supabase.from("leads").select("company_name").eq("id", proposal.lead_id).maybeSingle();
    return data?.company_name ?? null;
  }
  if (proposal.client_id) {
    const { data } = await supabase.from("clients").select("name").eq("id", proposal.client_id).maybeSingle();
    return data?.name ?? null;
  }
  return null;
}
