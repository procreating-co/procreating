import type { PresentationContent } from "@/lib/clients/presentation-types";

/**
 * Primeira versão — honesta sobre não estar completa (sem fotos/vídeos/textos finais ainda),
 * mas com identidade visual própria da Elenita, nada copiado da Pascoal. Mesmo `accentColor` já
 * usado no Workspace (`content/clients/elenita/workspace.ts`) — a mesma cor de identidade em
 * ambos os lugares onde o nome dela aparece.
 */
export const elenitaPresentation: PresentationContent = {
  slug: "elenita",
  brandName: "Dra. Elenita Luzardo",
  positioning: "Autoridade e presença digital para uma trajetória de confiança.",
  heroNote: "Apresentação em construção — fotos, vídeos e textos finais chegam nas próximas etapas.",
  accentColor: "#b76e79",
  metaTitle: "Dra. Elenita Luzardo",
  metaDescription: "Posicionamento digital de Dra. Elenita Luzardo.",
  sections: [
    { key: "sobre", title: "Sobre", body: "Apresentação pessoal e trajetória — a ser definida com a cliente." },
    { key: "projeto", title: "Projeto", body: "Resumo do projeto de posicionamento em desenvolvimento pela Procreating." },
    { key: "conteudos", title: "Conteúdos", body: "Textos e materiais escritos preparados especificamente para esta apresentação." },
    { key: "fotos", title: "Fotos", body: "Galeria de fotos — reservada para quando o material for entregue." },
    { key: "videos", title: "Vídeos", body: "Vídeo institucional e de apresentação — reservado para quando o material for entregue." },
    { key: "estrategia", title: "Estratégia", body: "Posicionamento estratégico da marca pessoal, alinhado com a cliente." },
  ],
};
