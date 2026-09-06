"use client";

import { useEffect, useRef } from "react";
import { useProposalTracking } from "@/components/proposal-public/proposal-tracking-context";
import type { ProposalSectionType } from "@/lib/supabase/types/database";

/**
 * Envolve cada seção pública (Hero/Pillars/Roadmap/...) sem alterar nada dentro dela — só um
 * `<div>` com `IntersectionObserver`, dispara `section_view` na primeira vez que 40% da seção
 * entra na viewport (mesmo threshold já usado pelos `whileInView` do Framer Motion nas seções,
 * consistência de "quando uma seção conta como vista"), uma vez só por carregamento.
 */
export function SectionViewObserver({ sectionType, children }: { sectionType: ProposalSectionType; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useProposalTracking();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            track("section_view", sectionType);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionType]);

  return <div ref={ref}>{children}</div>;
}
