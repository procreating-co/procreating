import type { CapabilityKey } from "@/lib/supabase/types/database";

/**
 * Catálogo de capabilities disponíveis — o que um Template pode oferecer e um Projeto pode
 * contratar (`ProjectCapability`, `lib/supabase/types/database.ts`). Evolução do que antes era
 * "produto vendido" (Vídeos/Fotos/Prospecção Ativa/Tráfego Pago, específico do
 * PosicionamentoPRO) generalizado pra caber em qualquer tipo de produto futuro.
 *
 * Um Template consulta este catálogo pra saber quais capabilities pode oferecer; os
 * componentes nunca deveriam ter `if (product === "videos")` espalhado — sempre checam
 * `capabilities` do projeto.
 */
export type CapabilityDefinition = {
  key: CapabilityKey;
  label: string;
  description: string;
};

export const CAPABILITY_CATALOG: CapabilityDefinition[] = [
  { key: "gallery", label: "Galeria", description: "Fotos organizadas por pasta, com senha de acesso." },
  { key: "photos", label: "Fotos", description: "Fotos em destaque na Home." },
  { key: "videos", label: "Vídeos", description: "Vídeos de redes sociais e aquisição." },
  { key: "downloads", label: "Downloads", description: "Download de mídia (vídeo/foto) pelo visitante." },
  { key: "prospection", label: "Prospecção Ativa", description: "Central de prospecção com senha própria." },
  { key: "traffic", label: "Tráfego Pago", description: "Pixels/UTMs pra campanhas pagas." },
  { key: "analytics", label: "Analytics", description: "Coleta de visitantes/downloads/origem." },
  { key: "members_area", label: "Área de Membros", description: "Conteúdo restrito a usuários autenticados." },
  { key: "landing", label: "Landing", description: "Página única focada em conversão, sem os demais blocos." },
  { key: "password_protection", label: "Proteção por Senha", description: "Gate de senha genérico pra qualquer bloco." },
  { key: "custom_modules", label: "Módulos Personalizados", description: "Blocos sob medida fora do catálogo padrão." },
];
