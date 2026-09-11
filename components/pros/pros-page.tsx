"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsWhatWeDid } from "@/components/pros/pros-what-we-did";
import { ProsProblem } from "@/components/pros/pros-problem";
import { ProsFirstImpression } from "@/components/pros/pros-first-impression";
import { ProsNotAboutPosting } from "@/components/pros/pros-not-about-posting";
import { ProsCaseStudy } from "@/components/pros/pros-case-study";
import { ProsWhatCanBeShown } from "@/components/pros/pros-what-can-be-shown";
import { ProsIndustries } from "@/components/pros/pros-industries";
import { ProsAbout } from "@/components/pros/pros-about";
import { ProsHowItWorks } from "@/components/pros/pros-how-it-works";
import { ProsFinalCta } from "@/components/pros/pros-final-cta";
import { ProsFooter } from "@/components/pros/pros-footer";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Página de prospecção `/pros/[slug]` — composição de todas as seções (pedido explícito, ordem
 * fixa: Hero → VSL → O que fizemos → Problema → Primeira impressão → Não é sobre postar → Case →
 * O que pode ser mostrado → Indústrias → Procreating → Como funciona → CTA final → Footer). Sem
 * header/nav — a página começa direto no Hero.
 *
 * Estado do lightbox de vídeo fica aqui, no topo, porque 3 seções diferentes (O que fizemos, Case,
 * O que pode ser mostrado) abrem o MESMO player em tela cheia (`VideoLightbox`, reaproveitado de
 * `components/landing/video-lightbox.tsx` — nenhum player novo).
 */
export function ProsPage({ content }: { content: ProsContent }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const openVideo = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} headline={content.hero.headline} />
      <ProsVsl label={content.vsl.label} />
      <ProsWhatWeDid heading={content.whatWeDid.heading} items={content.whatWeDid.items} onOpenVideo={openVideo} />
      <ProsProblem headline={content.problem.headline} paragraph={content.problem.paragraph} />
      <ProsFirstImpression headline={content.firstImpression.headline} steps={content.firstImpression.steps} note={content.firstImpression.note} />
      <ProsNotAboutPosting lines={content.notAboutPosting.lines} />
      <ProsCaseStudy
        title={content.caseStudy.title}
        subtitle={content.caseStudy.subtitle}
        before={content.caseStudy.before}
        direction={content.caseStudy.direction}
        afterItems={content.caseStudy.afterItems}
        onOpenVideo={openVideo}
      />
      <ProsWhatCanBeShown headline={content.whatCanBeShown.headline} categories={content.whatCanBeShown.categories} onOpenVideo={openVideo} />
      <ProsIndustries headline={content.industries.headline} items={content.industries.items} />
      <ProsAbout headline={content.about.headline} paragraph={content.about.paragraph} pillars={content.about.pillars} />
      <ProsHowItWorks steps={content.howItWorks.steps} />
      <ProsFinalCta headline={content.finalCta.headline} ctaLabel={content.finalCta.ctaLabel} whatsapp={content.whatsapp} />
      <ProsFooter whatsapp={content.whatsapp} instagramUrl={content.instagramUrl} />
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </main>
  );
}
