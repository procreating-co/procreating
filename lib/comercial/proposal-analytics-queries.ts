import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProposalEvent, ProposalSectionType } from "@/lib/supabase/types/database";

export type SectionEngagement = { sectionType: ProposalSectionType; sessionsViewed: number; viewedPct: number };
export type VideoEngagement = { sectionType: ProposalSectionType; plays: number; completions: number; avgProgress: number | null };
export type ActivityEntry = { eventType: ProposalEvent["event_type"]; sectionType: ProposalSectionType | null; value: number | null; createdAt: string };

export type ProposalAnalyticsSummary = {
  uniqueVisitors: number;
  sessions: number;
  ctaClicks: number;
  /** "Mapa de calor" (brief §10) — não é heatmap de clique/posição de mouse (o tracking real não
   *  captura isso), é "dwell/reach map": % das sessões que chegaram a ver cada seção
   *  (`section_view`, IntersectionObserver ≥ 40% visível), na ordem real das seções na página. */
  sectionEngagement: SectionEngagement[];
  videoEngagement: VideoEngagement[];
  /** Últimos 50 eventos brutos, mais recente primeiro — mesmo espírito da lista "Histórico" já
   *  usada em `clientes/[id]/page.tsx`. */
  activity: ActivityEntry[];
};

const SECTION_ORDER: ProposalSectionType[] = ["hero", "pillars", "roadmap", "tv_program", "acquisition", "budget", "portfolio", "closing"];

/** Tracking granular (brief "Procreating Experiences", §9) — agregação em TS a partir de
 *  `proposal_events` (mesmo padrão do resto do projeto: join/agregação em TypeScript, não SQL
 *  complexo). Sem eventos ainda (proposta nunca aberta depois desta migration, ou tracking
 *  bloqueado por navegador) devolve tudo zerado — nunca "N/A" ou erro. */
export async function computeProposalAnalytics(proposalId: string): Promise<ProposalAnalyticsSummary> {
  const supabase = await createClient();
  const { data } = await supabase.from("proposal_events").select("*").eq("proposal_id", proposalId).order("created_at", { ascending: false });
  const events = data ?? [];

  const visitorIds = new Set(events.map((e) => e.visitor_id));
  const sessionIds = new Set(events.map((e) => e.session_id));
  const totalSessions = sessionIds.size;

  const ctaClicks = events.filter((e) => e.event_type === "cta_click").length;

  const sessionsBySection = new Map<ProposalSectionType, Set<string>>();
  for (const e of events) {
    if (e.event_type !== "section_view" || !e.section_type) continue;
    const set = sessionsBySection.get(e.section_type) ?? new Set<string>();
    set.add(e.session_id);
    sessionsBySection.set(e.section_type, set);
  }
  const sectionEngagement: SectionEngagement[] = SECTION_ORDER.filter((type) => sessionsBySection.has(type)).map((type) => {
    const sessionsViewed = sessionsBySection.get(type)!.size;
    return { sectionType: type, sessionsViewed, viewedPct: totalSessions > 0 ? Math.round((sessionsViewed / totalSessions) * 100) : 0 };
  });

  const videoStatsBySection = new Map<ProposalSectionType, { plays: number; completions: number; progressValues: number[] }>();
  for (const e of events) {
    if (!e.section_type || !["video_play", "video_progress", "video_complete"].includes(e.event_type)) continue;
    const entry = videoStatsBySection.get(e.section_type) ?? { plays: 0, completions: 0, progressValues: [] };
    if (e.event_type === "video_play") entry.plays += 1;
    if (e.event_type === "video_complete") entry.completions += 1;
    if (e.event_type === "video_progress" && e.value != null) entry.progressValues.push(Number(e.value));
    videoStatsBySection.set(e.section_type, entry);
  }
  // `avgProgress` = média dos marcos de `video_progress` registrados (25/50/75/100) — como cada
  // marco só é gravado uma vez por sessão (`useVideoTracking`, cliente), a média aproxima "quanto
  // do vídeo, em média, as pessoas assistem" sem precisar guardar o timestamp exato do vídeo.
  const videoEngagement: VideoEngagement[] = Array.from(videoStatsBySection.entries()).map(([sectionType, stats]) => ({
    sectionType,
    plays: stats.plays,
    completions: stats.completions,
    avgProgress: stats.progressValues.length > 0 ? Math.round(stats.progressValues.reduce((a, b) => a + b, 0) / stats.progressValues.length) : null,
  }));

  const activity: ActivityEntry[] = events.slice(0, 50).map((e) => ({
    eventType: e.event_type,
    sectionType: e.section_type,
    value: e.value != null ? Number(e.value) : null,
    createdAt: e.created_at,
  }));

  return {
    uniqueVisitors: visitorIds.size,
    sessions: totalSessions,
    ctaClicks,
    sectionEngagement,
    videoEngagement,
    activity,
  };
}
