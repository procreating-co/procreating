import { ProsHeader } from "@/components/pros/pros-header";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVideoShowcase } from "@/components/pros/pros-video-showcase";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";
import type { ProsContent } from "@/content/pros/oficinas";

/**
 * Página de prospecção `/pros/[slug]` — pedido explícito (reconstrução completa desta rodada):
 * "não quero aproveitar nada do que está aqui" + "quero replicar exatamente" a estrutura de
 * `/clients/pascoal/public` (Header, Hero, seção "Vídeos", Footer — as mesmas 4 seções de
 * `PascoalSetembroTemplate`), com copy própria da Procreating Co. Todo o design anterior desta
 * página (scroll/drag reveal, grid de 6 colunas, tipografia Sora) foi descartado.
 *
 * `ProsMobileStickyCta` (botão flutuante de WhatsApp, só ícone) mantido como contato persistente
 * além do que o Footer já oferece — não fazia parte do que precisava mudar nesta rodada.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHeader brandName={content.header.brandName} />
      <ProsHero videoSrc={content.hero.videoSrc} welcomeLines={content.hero.welcomeLines} />
      <ProsVideoShowcase eyebrow={content.videos.eyebrow} heading={content.videos.heading} rows={content.videos.rows} />
      <ProsFooter brandName={content.footer.brandName} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
    </main>
  );
}
