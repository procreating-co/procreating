import { notFound } from "next/navigation";
import { getClientConfig, getClientVideos } from "@/lib/clients";
import { getClientPresentation } from "@/lib/clients/presentation-registry";
import { PresentationTemplate } from "@/components/templates/presentation-template";
import { PosicionamentoProTemplate } from "@/components/templates/posicionamento-pro-template";

/**
 * Único ponto de entrada pra todo cliente público — passa sempre pelo `presentation-registry`
 * primeiro, nunca mais um caminho hardcoded/default. "posicionamento-pro" (hoje só Pascoal)
 * delega pro pipeline legado (`data/pascoal/**`, `lib/clients/registry.ts`,
 * `components/landing/**`) — nenhum desses arquivos foi tocado nesta migração, só passou a ser
 * chamado a partir daqui em vez de ser o `if` padrão da rota.
 */
export default async function ClientHome({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry) notFound();

  if (entry.template === "presentation") {
    return <PresentationTemplate content={entry.content} />;
  }

  const [config, videos] = await Promise.all([getClientConfig(entry.slug), getClientVideos(entry.slug)]);
  if (!config || !videos) notFound();

  return <PosicionamentoProTemplate slug={entry.slug} config={config} videos={videos} />;
}
