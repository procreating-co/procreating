/**
 * Template = o "molde" de um projeto — define quais blocos ele tem (hero, features,
 * videosSection, gallery, prospeccao...). Hoje só existe um (`PosicionamentoPRO`, o que a
 * Pascoal já é); futuramente: Landing, Evento, Curso, Área de Membros, Premium. Os
 * componentes React que renderizam cada bloco (`HeroSection`, `FeaturesSection` etc.) são os
 * mesmos pra todo template — o que muda por template é só quais blocos entram.
 */
export type AdminTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Chaves dos blocos que este template inclui (ex.: "hero", "features", "gallery"). */
  blocks: string[];
};
