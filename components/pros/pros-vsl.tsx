import { Play } from "lucide-react";
import { Reveal } from "@/components/pros/reveal";

/**
 * VSL — pedido explícito: revela logo depois do Hero, sem seção de texto entre os dois, área
 * grande da tela. O arquivo real "será enviado posteriormente pela Procreating" — a estrutura
 * fica pronta (mesmo espaço/proporção que o vídeo real vai ocupar), placeholder honesto (rótulo
 * "Em produção", igual à convenção já usada em `videos-placeholder-section.tsx`), nunca um vídeo
 * inventado.
 */
export function ProsVsl({ label }: { label: string }) {
  return (
    <section className="relative bg-black px-6 py-20 lg:px-12 lg:py-28">
      <Reveal className="mx-auto max-w-[1400px]">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center sm:size-20">
            <span className="flex size-16 items-center justify-center rounded-full border border-white/25 text-white/40 sm:size-20">
              <Play className="ml-1 size-6 sm:size-7" />
            </span>
          </span>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-wide text-white/30">{label}</span>
        </div>
      </Reveal>
    </section>
  );
}
