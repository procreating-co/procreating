import type { MetadataRoute } from "next";

/**
 * As páginas de cliente (`/clients/<slug>`) são entregas privadas — nada aqui é conteúdo de
 * marketing público da Procreating. Bloqueia indexação completamente; o meta `robots` por
 * página (`app/clients/[client]/layout.tsx`) reforça o mesmo sinal para quem ignora `robots.txt`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
