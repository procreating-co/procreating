"use client";

import { motion } from "framer-motion";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import { useVideoTracking } from "@/components/proposal-public/use-video-tracking";
import type { ProposalVideo } from "@/lib/comercial/proposal-content-types";

/**
 * Portfólio — até 5 vídeos (limite aplicado no editor), orientação detectada no upload
 * (`video-upload-field.tsx`), nunca recalculada aqui. Seção nova, não existe no template
 * original da Elenita — só aparece quando `videos.length > 0` (uma proposta que nunca adicionou
 * a seção, ou adicionou vazia, não renderiza nada aqui).
 *
 * Horizontais empilham full-width (`aspect-video`, como se assistisse um reel de trabalho);
 * verticais ficam num grid mais denso (`aspect-[9/16]`, formato retrato de rede social) —
 * grupos separados em vez de um grid único com spans variáveis, pra não depender de quantos
 * vídeos de cada orientação existem numa proposta específica.
 */
/** Um card de vídeo, com tracking próprio (brief "Procreating Experiences") — extraído do
 *  `.map()` porque `useVideoTracking` é um hook: precisa de um componente por vídeo (nunca
 *  chamado dentro do próprio callback do `.map`), senão o "já assistiu X%"/"já deu play" de um
 *  vídeo vazaria pros outros (estado compartilhado por engano). */
function PortfolioVideoCard({ video, aspectClass, index }: { video: ProposalVideo; aspectClass: string; index: number }) {
  const tracking = useVideoTracking("portfolio");
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="overflow-hidden rounded-xl border border-white/10"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={video.url}
        controls
        preload="metadata"
        className={`w-full bg-black object-cover ${aspectClass}`}
        onPlay={tracking.onPlay}
        onTimeUpdate={tracking.onTimeUpdate}
        onEnded={tracking.onEnded}
      />
    </motion.div>
  );
}

export function ProposalPortfolio({ content, accent }: { content: { eyebrow: string; heading: string; subtitle: string; videos: ProposalVideo[] }; accent: string }) {
  if (!content.videos || content.videos.length === 0) return null;

  const horizontal = content.videos.filter((v) => v.orientation === "horizontal");
  const vertical = content.videos.filter((v) => v.orientation === "vertical");

  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <ProposalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
      {content.subtitle && <p className="mx-auto mt-6 max-w-lg text-balance text-center text-base leading-relaxed text-white/55">{content.subtitle}</p>}

      {horizontal.length > 0 && (
        <div className="mx-auto mt-14 flex max-w-4xl flex-col gap-6">
          {horizontal.map((video, index) => (
            <PortfolioVideoCard key={video.url} video={video} aspectClass="aspect-video" index={index} />
          ))}
        </div>
      )}

      {vertical.length > 0 && (
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {vertical.map((video, index) => (
            <PortfolioVideoCard key={video.url} video={video} aspectClass="aspect-[9/16]" index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
