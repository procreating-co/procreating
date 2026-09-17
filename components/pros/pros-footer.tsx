"use client";

import Image from "next/image";
import { track } from "@vercel/analytics";
import { Reveal } from "@/components/pros/reveal";

type WhatsappConfig = { phoneDigits: string; message: string };

/**
 * Footer — pedido explícito: headline + botão de CTA que abre o WhatsApp (número real passado
 * pelo usuário numa rodada anterior — ver `content/pros/oficinas.ts`). Sem marca/atribuição
 * embaixo (pedido explícito desta rodada: excluir "Procreating Co." e "Planejado e Executado
 * por..." — o footer agora é só a imagem de fundo + headline + CTA).
 */
export function ProsFooter({
  headline,
  ctaLabel,
  whatsapp,
  slug,
}: {
  headline: string;
  ctaLabel: string;
  whatsapp: WhatsappConfig;
  slug: string;
}) {
  const href = `https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(whatsapp.message)}`;

  return (
    <footer className="relative bg-black pt-14 text-white lg:pt-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[oklch(0.09_0.01_260)] via-black/70 to-black lg:h-20" />
      <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
        <Image src="/images/footer-earth-gradient.png" alt="Paisagem luminosa encerrando a página" fill sizes="100vw" loading="lazy" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-14 lg:px-12 lg:pb-20">
        <Reveal className="mx-auto max-w-3xl py-10 text-center">
          <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">{headline}</h2>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("pros_cta_click", { slug, location: "footer" })}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[var(--client-accent)] px-8 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-white"
          >
            {ctaLabel}
          </a>
        </Reveal>
      </div>
    </footer>
  );
}
