"use client";

import { track } from "@vercel/analytics";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";

type WhatsappConfig = { phoneDigits: string; message: string };

/** Footer — pedido explícito: extremamente simples, só marca + tagline + Instagram + WhatsApp.
 *  Sem navegação nenhuma. Reaproveita `ProcreatingMark`, o símbolo oficial já usado no ERP. */
export function ProsFooter({ whatsapp, instagramUrl, slug }: { whatsapp: WhatsappConfig; instagramUrl: string; slug: string }) {
  const whatsappHref = `https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(whatsapp.message)}`;
  return (
    <footer aria-label="Contato da Procreating" className="border-t border-white/10 bg-black px-6 py-14 lg:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 text-center">
        <ProcreatingMark className="size-8 text-white/70" />
        <p className="font-display text-lg">Procreating</p>
        <p className="text-sm text-white/40">Direção de conteúdo e estratégias digitais.</p>
        <div className="mt-2 flex items-center gap-6 text-sm text-white/50">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("pros_cta_click", { slug, location: "footer_instagram" })}
            className="rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Instagram
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("pros_cta_click", { slug, location: "footer_whatsapp" })}
            className="rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
