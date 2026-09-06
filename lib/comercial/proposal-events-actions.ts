"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProposalEventType, ProposalSectionType } from "@/lib/supabase/types/database";

/**
 * Tracking granular (brief "Procreating Experiences") — wrapper fino em cima de
 * `record_proposal_event` (`SECURITY DEFINER`, migration `20260906010000_proposal_events.sql`),
 * mesmo padrão de `recordProposalViewAction`/`respondPublicProposalAction`
 * (`public-proposal-actions.ts`): sem sessão nenhuma (o visitante não tem conta no ERP), toda a
 * checagem de segurança (slug existe? status permite?) já acontece dentro da função de banco.
 */
export async function recordProposalEventAction(
  slug: string,
  visitorId: string,
  sessionId: string,
  eventType: ProposalEventType,
  sectionType?: ProposalSectionType,
  value?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("record_proposal_event", {
    p_slug: slug,
    p_visitor_id: visitorId,
    p_session_id: sessionId,
    p_event_type: eventType,
    p_section_type: sectionType,
    p_value: value,
    p_metadata: metadata ?? {},
  });
}
