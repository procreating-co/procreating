"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHeader } from "@/components/pros/pros-header";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsProblem } from "@/components/pros/pros-problem";
import { ProsSolution } from "@/components/pros/pros-solution";
import { ProsCaseStudy } from "@/components/pros/pros-case-study";
import { ProsHowItWorks } from "@/components/pros/pros-how-it-works";
import { ProsDifferentiator } from "@/components/pros/pros-differentiator";
import { ProsFaq } from "@/components/pros/pros-faq";
import { ProsFinalCta } from "@/components/pros/pros-final-cta";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Página de prospecção `/pros/[slug]` — redesign completo (pedido explícito): Header → Hero →
 * bloco de scroll/drag reveal (VSL) → Problema → Solução → Case → Como funciona → Diferencial →
 * FAQ → CTA final → Footer. "Provas de Autoridade" foi omitida de propósito (ver
 * `content/pros/oficinas.ts`) — sem depoimento/métrica real pra preencher sem inventar.
 *
 * Estado do lightbox fica aqui, no topo: Hero, VSL e a galeria do Case abrem o MESMO player em
 * tela cheia ("todo vídeo clicável em fullscreen", pedido explícito) — um estado só.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const openVideo = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHeader brandName={content.header.brandName} nav={content.header.nav} ctaLabel={content.header.ctaLabel} ctaHref="#contato" />

      <ProsHero
        videoSrc={content.hero.videoSrc}
        headline={content.hero.headline}
        subheadline={content.hero.subheadline}
        primaryCta={content.hero.primaryCta}
        primaryCtaHref={`https://wa.me/${content.whatsapp.phoneDigits}?text=${encodeURIComponent(content.whatsapp.message)}`}
        secondaryCta={content.hero.secondaryCta}
        secondaryCtaHref={content.hero.secondaryCtaHref}
        onOpenVideo={openVideo}
      />

      <ProsVsl videoSrc={content.vsl.videoSrc} onOpenVideo={openVideo} />

      <ProsProblem eyebrow={content.problem.eyebrow} headline={content.problem.headline} paragraph={content.problem.paragraph} />

      <ProsSolution eyebrow={content.solution.eyebrow} headline={content.solution.headline} paragraph={content.solution.paragraph} pillars={content.solution.pillars} />

      <ProsCaseStudy
        eyebrow={content.caseStudy.eyebrow}
        title={content.caseStudy.title}
        intro={content.caseStudy.intro}
        challenge={content.caseStudy.challenge}
        strategy={content.caseStudy.strategy}
        executionLabel={content.caseStudy.executionLabel}
        galleryLabel={content.caseStudy.galleryLabel}
        galleryItems={content.caseStudy.galleryItems}
        resultNote={content.caseStudy.resultNote}
        onOpenVideo={openVideo}
      />

      <ProsHowItWorks eyebrow={content.howItWorks.eyebrow} headline={content.howItWorks.headline} steps={content.howItWorks.steps} />

      <ProsDifferentiator
        eyebrow={content.differentiator.eyebrow}
        headline={content.differentiator.headline}
        paragraph={content.differentiator.paragraph}
        points={content.differentiator.points}
      />

      <ProsFaq eyebrow={content.faq.eyebrow} items={content.faq.items} />

      <ProsFinalCta headline={content.finalCta.headline} paragraph={content.finalCta.paragraph} ctaLabel={content.finalCta.ctaLabel} whatsapp={content.whatsapp} slug={content.slug} />
      <ProsFooter whatsapp={content.whatsapp} instagramUrl={content.instagramUrl} slug={content.slug} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </main>
  );
}
