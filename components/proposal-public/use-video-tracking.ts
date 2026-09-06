"use client";

import { useRef } from "react";
import { useProposalTracking } from "@/components/proposal-public/proposal-tracking-context";
import type { ProposalSectionType } from "@/lib/supabase/types/database";

const PROGRESS_MILESTONES = [25, 50, 75, 100];

/**
 * Handlers de vídeo instrumentados (brief "Procreating Experiences", §9) — `onPlay`/
 * `onTimeUpdate`/`onEnded` nativos do HTML5 `<video>`, sem nenhuma lib nova. `onTimeUpdate`
 * amostra os marcos de 25/50/75/100% do `duration`, cada um disparando só na primeira vez que é
 * cruzado (não um evento por tick). Um `<video>` sem controles/autoplay/loop (a maioria das
 * seções, ambiente) nunca dispara `onPlay` de verdade uma única vez visível pro usuário decidir —
 * ainda assim é seguro plugar em qualquer `<video>`, só não produz sinal útil se ninguém jamais
 * pausa/retoma.
 */
export function useVideoTracking(sectionType: ProposalSectionType) {
  const track = useProposalTracking();
  const reached = useRef<Set<number>>(new Set());
  const started = useRef(false);

  function onPlay() {
    if (started.current) return;
    started.current = true;
    track("video_play", sectionType);
  }

  function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget;
    if (!video.duration || Number.isNaN(video.duration)) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);
    for (const milestone of PROGRESS_MILESTONES) {
      if (pct >= milestone && !reached.current.has(milestone)) {
        reached.current.add(milestone);
        track("video_progress", sectionType, milestone);
      }
    }
  }

  function onEnded() {
    track("video_complete", sectionType);
  }

  return { onPlay, onTimeUpdate, onEnded };
}
