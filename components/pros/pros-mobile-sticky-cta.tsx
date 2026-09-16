"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";

type WhatsappConfig = { phoneDigits: string; message: string };

/**
 * Botão de contato flutuante — só um ícone, sem texto visível. O Header e o Footer da página não
 * têm nenhum CTA/link de contato (réplica do site do cliente, que também não tem), então este
 * continua sendo o único jeito direto de falar com a Procreating — por isso aparece em qualquer
 * tamanho de tela. Some enquanto o Hero ocupa a tela, aparece só depois que o usuário rola além
 * dele.
 *
 * Micro-bounce (item aprovado da proposta): na PRIMEIRA vez que o botão aparece, a transição de
 * entrada usa um easing com overshoot (`cubic-bezier(0.34,1.56,0.64,1)` — passa um pouco do
 * tamanho final e volta, sem precisar de keyframes customizados). Aparições seguintes (usuário
 * rola pra cima e pra baixo de novo) usam a transição normal, sem bounce — só a primeira chamada
 * atenção. Desativado com `prefers-reduced-motion` (aparece direto, sem overshoot).
 */
export function ProsMobileStickyCta({ whatsapp, slug }: { whatsapp: WhatsappConfig; slug: string }) {
  const [visible, setVisible] = useState(false);
  const [bounce, setBounce] = useState(false);
  const hasAppearedRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > window.innerHeight * 0.9;
        setVisible(next);
        if (next && !hasAppearedRef.current) {
          hasAppearedRef.current = true;
          if (!reduceMotion) {
            setBounce(true);
            setTimeout(() => setBounce(false), 600);
          }
        }
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
      className={`fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/40 transition-all motion-reduce:transition-none ${
        bounce ? "duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "duration-300"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
