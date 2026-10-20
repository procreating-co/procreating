import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * App Next.js da APRESENTAÇÃO OFFLINE (ver OFFLINE_PRESENTATION.md). Totalmente separado do app
 * online (raiz do repo): outro diretório, outro build (`offline/.next`), outro `public/`. Reusa os
 * componentes e os dados do app online via alias `@/*` → raiz do repo, sem alterá-los.
 */
const offlineDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(offlineDir, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mesmos formatos do app online — o otimizador de imagens roda localmente (sharp), sem rede.
  images: {
    formats: ["image/avif", "image/webp"],
    // 85 = qualidade que o lightbox da galeria pede (`optimizedGallerySrc(src, 1920, 85)`). O Next 16
    // só aceita 75 por padrão e responde 400 pra q=85 — o app online tem esse mesmo problema hoje
    // (foto ampliada da galeria não carrega); aqui fica liberado pra funcionar na apresentação.
    qualities: [75, 85],
  },
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/assets/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
