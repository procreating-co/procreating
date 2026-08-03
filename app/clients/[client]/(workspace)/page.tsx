import { notFound } from "next/navigation";
import { WorkspaceOverview } from "@/components/workspace/workspace-overview";
import { getClientWorkspace } from "@/lib/clients/workspace-registry";

type Params = { client: string };

export default async function WorkspaceOverviewPage({ params }: { params: Promise<Params> }) {
  const { client: slug } = await params;
  const client = getClientWorkspace(slug);
  if (!client) notFound();

  return <WorkspaceOverview client={client} />;
}
