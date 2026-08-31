"use client";

import { motion } from "framer-motion";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
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
            <motion.div
              key={video.url}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={video.url} controls preload="metadata" className="aspect-video w-full bg-black object-cover" />
            </motion.div>
          ))}
        </div>
      )}

      {vertical.length > 0 && (
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {vertical.map((video, index) => (
            <motion.div
              key={video.url}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={video.url} controls preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
