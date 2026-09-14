import type { ProsGalleryVideo } from "@/content/pros/oficinas";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { Reveal } from "@/components/pros/reveal";

type CaseStudyProps = {
  eyebrow: string;
  title: string;
  intro: string;
  challenge: string;
  strategy: string;
  executionLabel: string;
  galleryLabel: string;
  galleryItems: ProsGalleryVideo[];
  resultNote: string;
  onOpenVideo: (src: string) => void;
};

/**
 * Case Pascoal Bombas — pedido explícito: desafio → estratégia → execução (materiais reais) →
 * resultado, tratado como estudo de caso, não uma referência solta. "Execução" reaproveita
 * `ProsVideoGallery` (mesmo componente/composição editorial já usado) em vez de um grid novo.
 * "Resultado" é honesto — sem métrica/depoimento inventado (nenhum foi fornecido); descreve o
 * foco real da fase 1 do projeto.
 */
export function ProsCaseStudy({ eyebrow, title, intro, challenge, strategy, executionLabel, galleryLabel, galleryItems, resultNote, onOpenVideo }: CaseStudyProps) {
  return (
    <section id="case" className="bg-black px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1800px]">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-white/40">{eyebrow}</p>
          <h2 className="mb-5 text-balance font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">{title}</h2>
          <p className="text-balance text-lg text-white/55 sm:text-xl">{intro}</p>
        </Reveal>

        <div className="mx-auto mb-16 flex max-w-4xl flex-col divide-y divide-white/10 border-y border-white/10 lg:mb-24">
          <Reveal className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-10">
            <span className="shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-white/40 sm:w-40">O desafio</span>
            <p className="text-balance text-lg leading-relaxed text-white/70">{challenge}</p>
          </Reveal>
          <Reveal delayMs={100} className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-10">
            <span className="shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-white/40 sm:w-40">A estratégia</span>
            <p className="text-balance text-lg leading-relaxed text-white/70">{strategy}</p>
          </Reveal>
        </div>

        <Reveal className="mb-8 text-center lg:mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">{executionLabel}</p>
        </Reveal>
        <ProsVideoGallery label={galleryLabel} items={galleryItems} onOpenVideo={onOpenVideo} bare />

        <Reveal className="mx-auto mt-16 max-w-2xl text-center lg:mt-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/40">O resultado</p>
          <p className="text-balance text-base leading-relaxed text-white/55">{resultNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
