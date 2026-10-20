import { notFound } from "next/navigation";
import { ProspeccaoExperience } from "@/components/prospeccao/prospeccao-experience";
import { getClientConfig } from "@/lib/clients";
import { OFFLINE_CLIENT_SLUG } from "@offline/lib/offline-data";

/** Mesma página de `app/clients/[client]/public/prospeccao` (dados em memória, nenhuma API). */
export default async function OfflineProspeccaoPage() {
  const config = await getClientConfig(OFFLINE_CLIENT_SLUG);
  if (!config || !config.prospeccao) notFound();

  return (
    <ProspeccaoExperience
      accessCode={config.prospeccao.accessCode}
      title={config.prospeccao.title}
      logo={config.logo}
      brandName={config.brandName}
      homeHref={`/clients/${OFFLINE_CLIENT_SLUG}/public`}
    />
  );
}
