import type { AdminTemplate } from "@/lib/admin/templates/types";

/**
 * Dados mockados. `blocks` espelha as seções de `ClientConfig` (`lib/clients/types.ts`) que a
 * Pascoal já usa hoje — é literalmente o template que a Pascoal roda, só que agora nomeado.
 */
export const mockTemplates: AdminTemplate[] = [
  {
    id: "posicionamento-pro",
    slug: "posicionamento-pro",
    name: "PosicionamentoPRO",
    description: "Hero, fotos em destaque, vídeos de redes sociais e aquisição, galeria com senha, prospecção opcional.",
    blocks: ["hero", "features", "videosSection", "gallery", "prospeccao", "footer"],
  },
];

export function getMockTemplateById(id: string): AdminTemplate | null {
  return mockTemplates.find((template) => template.id === id) ?? null;
}
