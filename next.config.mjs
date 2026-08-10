/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/gallery/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async rewrites() {
    return [
      // Proposta de Continuidade da Pascoal: URL pública fica em /clients/pascoal/public/proposta,
      // mas a página física mora em app/pascoal-proposta/page.tsx — fora da árvore dinâmica
      // app/clients/[client]/**, que é compartilhada com a Elenita. Ver comentário em
      // app/pascoal-proposta/page.tsx para o motivo do isolamento.
      {
        source: "/clients/pascoal/public/proposta",
        destination: "/pascoal-proposta",
      },
    ];
  },
}

export default nextConfig
