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
  async redirects() {
    return [
      // A Proposta de Continuidade da Elenita saiu de `content/clients/elenita/proposal.ts`
      // (registry hardcoded) e virou uma Proposal de verdade no banco (sistema genérico de
      // Propostas, `/propostas/[slug]`) — ver migration `20260901000000_proposal_elenita_template.sql`.
      // Redirect permanente pra não quebrar o link antigo que já circula.
      {
        source: "/clients/elenita/public/proposta",
        destination: "/propostas/elenita-luzardo",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles: precisa rodar ANTES do Next checar arquivos/páginas — inclusive as páginas
      // estáticas que app/clients/[client]/public/proposta/page.tsx pré-gera via
      // generateStaticParams (uma delas é /clients/pascoal/public/proposta, hoje um 404 estático,
      // já que o registry da proposta só tem a Elenita). Um rewrite normal (array simples) é
      // checado DEPOIS dessas páginas estáticas e perde pra esse 404 pré-gerado; beforeFiles
      // resolve isso sem tocar em nada da árvore compartilhada com a Elenita.
      beforeFiles: [
        // Proposta de Continuidade da Pascoal: URL pública fica em /clients/pascoal/public/proposta,
        // mas a página física mora em app/pascoal-proposta/page.tsx — fora da árvore dinâmica
        // app/clients/[client]/**, que é compartilhada com a Elenita. Ver comentário em
        // app/pascoal-proposta/page.tsx para o motivo do isolamento.
        {
          source: "/clients/pascoal/public/proposta",
          destination: "/pascoal-proposta",
        },
      ],
    };
  },
}

export default nextConfig
