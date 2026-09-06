"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { recordProposalEventAction } from "@/lib/comercial/proposal-events-actions";
import { getOrCreateVisitorId, createSessionId } from "@/lib/comercial/proposal-visitor";
import type { ProposalEventType, ProposalSectionType } from "@/lib/supabase/types/database";

type TrackFn = (eventType: ProposalEventType, sectionType?: ProposalSectionType, value?: number, metadata?: Record<string, unknown>) => void;

const ProposalTrackingContext = createContext<TrackFn | null>(null);

/** `useProposalTracking()` — hook pra qualquer componente aninhado disparar um evento (vídeo,
 *  clique de CTA) sem precisar receber `slug`/`visitorId`/`sessionId` como prop. `null` fora do
 *  Provider é um erro de uso (nunca deveria acontecer dentro de `ProposalPublicView`), não um
 *  estado esperado — por isso lança, ajuda a pegar o engano cedo em vez de silenciosamente não
 *  trackear nada. */
export function useProposalTracking(): TrackFn {
  const track = useContext(ProposalTrackingContext);
  if (!track) throw new Error("useProposalTracking precisa estar dentro de <ProposalTrackingProvider>");
  return track;
}

const SCROLL_MILESTONES = [25, 50, 75, 100];

/**
 * Provider — gera `visitorId` (cookie `pc_vid`, 1 ano) e `sessionId` (1 por carregamento, só em
 * memória) uma vez, expõe `trackEvent` via contexto, e já cuida sozinho do `scroll_depth`
 * (marco cruzado pela primeira vez nesta visita — 25/50/75/100% da altura da página).
 * `section_view`/`cta_click`/vídeo são disparados por quem usa `useProposalTracking()` em cada
 * ponto específico (`SectionViewObserver`, botão de aceitar, players de vídeo).
 */
export function ProposalTrackingProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const visitorIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const reachedMilestones = useRef<Set<number>>(new Set());

  if (typeof window !== "undefined" && visitorIdRef.current === null) {
    visitorIdRef.current = getOrCreateVisitorId();
    sessionIdRef.current = createSessionId();
  }

  const track: TrackFn = useMemo(
    () => (eventType, sectionType, value, metadata) => {
      if (!visitorIdRef.current || !sessionIdRef.current) return;
      void recordProposalEventAction(slug, visitorIdRef.current, sessionIdRef.current, eventType, sectionType, value, metadata);
    },
    [slug],
  );

  useEffect(() => {
    function onScroll() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollableHeight <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));
      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !reachedMilestones.current.has(milestone)) {
          reachedMilestones.current.add(milestone);
          track("scroll_depth", undefined, milestone);
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // proposta curta o suficiente pra já nascer com 100% visível, sem scroll nenhum
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ProposalTrackingContext.Provider value={track}>{children}</ProposalTrackingContext.Provider>;
}
