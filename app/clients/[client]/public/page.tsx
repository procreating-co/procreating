import { notFound } from "next/navigation";
import { getClientConfig, getClientVideos } from "@/lib/clients";
import { getClientPresentation } from "@/lib/clients/presentation-registry";
import { PresentationTemplate } from "@/components/templates/presentation-template";
import { PosicionamentoProTemplate } from "@/components/templates/posicionamento-pro-template";
import { PascoalSetembroTemplate } from "@/components/templates/pascoal-setembro-template";
import { SiteLockGate } from "@/components/presentation/site-lock-gate";
import { getSession } from "@/lib/admin/auth";

/**
 * Único ponto de entrada pra todo cliente público — passa sempre pelo `presentation-registry`
 * primeiro, nunca mais um caminho hardcoded/default. "posicionamento-pro" (hoje Pascoal e
 * Elenita) delega pro pipeline legado (`data/<slug>/**`, `lib/clients/registry.ts`,
 * `components/landing/**`) — nenhum desses arquivos foi tocado, só passou a ser chamado a partir
 * daqui.
 *
 * Pascoal: desde setembro/26 a Home é a apresentação de setembro (`PascoalSetembroTemplate`); a
 * antiga foi movida pra `/clients/pascoal/public/past` (`past/page.tsx`), com o conteúdo
 * idêntico ao que esta rota renderizava antes.
 */
export default async function ClientHome({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry) notFound();

  if (entry.template === "presentation") {
    return <PresentationTemplate content={entry.content} />;
  }

  if (entry.slug === "pascoal") {
    const config = await getClientConfig(entry.slug);
    if (!config) notFound();
    return <PascoalSetembroTemplate slug={entry.slug} config={config} />;
  }

  const [config, videos] = await Promise.all([getClientConfig(entry.slug), getClientVideos(entry.slug)]);
  if (!config || !videos) notFound();

  const site = <PosicionamentoProTemplate slug={entry.slug} config={config} videos={videos} />;

  if (config.siteLock) {
    // Pedido explícito: quem já está logado no Procreating OS (ERP) não precisa da senha da
    // Home pública — a sessão do ERP já verificada aqui, no servidor (`getSession()`, a mesma
    // checagem real que todo `(internal)/**` usa — revalida contra o Supabase Auth, não confia
    // em cookie decodificado localmente), evita o gate inteiro. Sem sessão, o comportamento pra
    // qualquer visitante público continua idêntico a antes.
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
