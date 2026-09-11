"use client";

import { track } from "@vercel/analytics";
import { Reveal } from "@/components/pros/reveal";

type WhatsappConfig = { phoneDigits: string; message: string };

/** CTA final — pedido explícito: 1 botão só, pro WhatsApp, sem formulário/CTAs extras.
 *  `track()` reaproveita o Vercel Analytics já ligado em `app/layout.tsx` (`<Analytics/>`) —
 *  nenhuma ferramenta nova, só um evento custom no clique. */
export function ProsFinalCta({ headline, ctaLabel, whatsapp, slug }: { headline: string; ctaLabel: string; whatsapp: WhatsappConfig; slug: string }) {
  const href = `https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(whatsapp.message)}`;
  return (
    <section aria-label="Fale com a Procreating" className="bg-black px-6 py-32 lg:px-12 lg:py-44">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
        <Reveal>
          <h2 className="whitespace-pre-line text-balance font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">{headline}</h2>
        </Reveal>
        <Reveal delayMs={200}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("pros_cta_click", { slug, location: "final_cta" })}
            className="inline-flex items-center justify-center rounded-full bg-white px-9 py-4 text-base font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:px-11 sm:py-5 sm:text-lg"
          >
            {ctaLabel}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
