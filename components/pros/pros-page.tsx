import { ProsHero } from "@/components/pros/pros-hero";
import { ProsWhatWeDo } from "@/components/pros/pros-what-we-do";
import { ProsSocialVideos } from "@/components/pros/pros-social-videos";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";
import type { ProsContent } from "@/content/pros/oficinas";

/**
 * Página de prospecção `/pros/[slug]` — sem header (removido — `pros-header.tsx` deletado), Hero
 * centralizado, e a seção de vídeos dividida em dois blocos: "O que fazemos" (institucional, 3
 * vídeos horizontais) → "Vídeos" (sociais, só o par vertical). Fecha com um footer sem CTA — o
 * único contato direto é o `ProsMobileStickyCta` flutuante.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} welcomeLines={content.hero.welcomeLines} />
      <ProsWhatWeDo
        eyebrow={content.whatWeDo.eyebrow}
        heading={content.whatWeDo.heading}
        videoLabel={content.whatWeDo.videoLabel}
        videos={content.whatWeDo.videos}
      />
      <ProsSocialVideos eyebrow={content.socialVideos.eyebrow} heading={content.socialVideos.heading} videos={content.socialVideos.videos} />
      <ProsFooter headline={content.footer.headline} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
    </main>
  );
}
