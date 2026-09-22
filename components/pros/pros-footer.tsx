import Image from "next/image";
import { Reveal } from "@/components/pros/reveal";

/**
 * Footer — só imagem de fundo + headline (sem botão de CTA; o único contato direto da página é o
 * `ProsMobileStickyCta` flutuante). Sem marca/atribuição embaixo (excluído: "Procreating Co." e
 * "Planejado e Executado por...").
 */
export function ProsFooter({ headline }: { headline: string }) {
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
        </Reveal>
      </div>
    </footer>
  );
}
