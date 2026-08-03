import { notFound } from "next/navigation";
import { ProspeccaoExperience } from "@/components/prospeccao/prospeccao-experience";
import { getClientConfig } from "@/lib/clients";

export default async function ClientProspeccaoPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const config = await getClientConfig(client);
  if (!config || !config.prospeccao) notFound();

  return (
    <ProspeccaoExperience
      accessCode={config.prospeccao.accessCode}
      title={config.prospeccao.title}
      logo={config.logo}
      brandName={config.brandName}
      homeHref={`/clients/${client}/public`}
    />
  );
}
