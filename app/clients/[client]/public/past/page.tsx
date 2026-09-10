import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientConfig, getClientVideos } from "@/lib/clients";
import { getClientPresentation } from "@/lib/clients/presentation-registry";
import { PosicionamentoProTemplate } from "@/components/templates/posicionamento-pro-template";
import { SiteLockGate } from "@/components/presentation/site-lock-gate";
import { getSession } from "@/lib/admin/auth";

/**
 * `/clients/pascoal/public/past` — a apresentação ORIGINAL da Pascoal ("Projeto Inicial": fotos,
 * vídeos da Home, prospecção). Conteúdo idêntico ao que `/clients/pascoal/public` renderizava
 * antes de setembro/26; foi só movido pra cá quando a Home virou a apresentação de setembro. É
 * este o destino do botão "Acessar Projeto Inicial". Exclusivo da Pascoal.
 */

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry || entry.template !== "posicionamento-pro" || entry.slug !== "pascoal") return {};
  const config = await getClientConfig(entry.slug);
  if (!config) return {};
  return {
    title: `${config.brandName} | Projeto Inicial`,
    description: config.metadata.description,
    alternates: { canonical: `/clients/${entry.slug}/public/past` },
    robots: { index: false, follow: false },
  };
}

export default async function PascoalPast({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry || entry.template !== "posicionamento-pro" || entry.slug !== "pascoal") notFound();

  const [config, videos] = await Promise.all([getClientConfig(entry.slug), getClientVideos(entry.slug)]);
  if (!config || !videos) notFound();

  const site = <PosicionamentoProTemplate slug={entry.slug} config={config} videos={videos} />;

  if (config.siteLock) {
    const session = await getSession();
    return (
      <SiteLockGate
        accessCodes={config.siteLock.accessCodes}
        title={config.siteLock.lockScreenTitle}
        logo={config.logo}
        brandName={config.brandName}
        skipLock={Boolean(session)}
      >
        {site}
      </SiteLockGate>
    );
  }

  return site;
}
