import { notFound } from "next/navigation";
import { WorkspaceOverview } from "@/components/workspace/workspace-overview";
import { mockLauncherClients } from "@/lib/clients/launcher-mock-data";

type Params = { client: string };

export default async function WorkspaceOverviewPage({ params }: { params: Promise<Params> }) {
  const { client: slug } = await params;
  const client = mockLauncherClients.find((c) => c.slug === slug);
  if (!client) notFound();

  return <WorkspaceOverview client={client} />;
}
