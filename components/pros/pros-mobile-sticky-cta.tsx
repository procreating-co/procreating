"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";

type WhatsappConfig = { phoneDigits: string; message: string };

/**
 * Botão de contato flutuante — só um ícone, sem texto visível. O Header e o Footer da página não
 * têm nenhum CTA/link de contato (réplica do site do cliente, que também não tem), então este
 * continua sendo o único jeito direto de falar com a Procreating — por isso aparece em qualquer
 * tamanho de tela. Some enquanto o Hero ocupa a tela, aparece só depois que o usuário rola além
 * dele.
 */
export function ProsMobileStickyCta({ whatsapp, slug }: { whatsapp: WhatsappConfig; slug: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > window.innerHeight * 0.9);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = `https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(whatsapp.message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("pros_cta_click", { slug, location: "mobile_sticky" })}
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
