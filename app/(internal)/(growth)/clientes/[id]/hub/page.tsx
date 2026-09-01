import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getClientBasic } from "@/lib/clientes/queries";
import { getClientGalleryFolderDefs } from "@/lib/clients";
import { getRecentGalleryFiles } from "@/lib/gallery-server";
import {
  getClientHubOverview,
  listClientContentCalendar,
  listClientScripts,
  listClientStories,
  listClientUpcomingDeliveries,
  listTeamUsers,
  type ProductionItemWithAssignee,
} from "@/lib/operacao/queries";
import { PageTabs, type PageTab } from "@/components/dashboard/page-tabs";
import { ClientHubHeader } from "@/components/clientes/hub/client-hub-header";
import { ClientHubOverviewSection } from "@/components/clientes/hub/client-hub-overview";
import { ClientHubItemList } from "@/components/clientes/hub/client-hub-item-list";
import { ClientHubGallery } from "@/components/clientes/hub/client-hub-gallery";

type Params = { id: string };
type SearchParams = { tab?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientBasic(id);
  return { title: client ? `Central do Cliente — ${client.name}` : "Central do Cliente — Procreating", robots: { index: false, follow: false } };
}

const HUB_TABS: PageTab[] = [
  { key: "overview", label: "Visão geral" },
  { key: "cronograma", label: "Cronograma" },
  { key: "roteiros", label: "Roteiros" },
  { key: "stories", label: "Stories" },
  { key: "galeria", label: "Galeria" },
];

function mostRecentUpdate(items: ProductionItemWithAssignee[], fallback: string): string {
  return items.reduce((latest, item) => (item.updated_at > latest ? item.updated_at : latest), fallback);
}

/**
 * Central do Cliente (Client Hub) — Operação > Clientes > [cliente] > Central do Cliente.
 * Rota genérica por `id` (uuid de `clients`), não hardcoded pra nenhum cliente — hoje só ativada
 * na prática pra Pascoal porque é o único cliente recorrente com dado real nas seções novas, mas
 * qualquer `/clientes/<id>/hub` funciona. A ficha cadastral em `/clientes/[id]` (contratos/
 * contatos/onboarding) continua intocada — este é um hub operacional separado, um clique dali.
 */
export default async function ClientHubPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = HUB_TABS.some((t) => t.key === tab) ? tab! : "overview";

  const client = await getClientBasic(id);
  if (!client) notFound();

  const [upcomingDeliveries, users, galleryDefs] = await Promise.all([
    listClientUpcomingDeliveries(client.id),
    listTeamUsers(),
    getClientGalleryFolderDefs(client.slug),
  ]);

  let lastUpdatedAt = client.updated_at;
  let content: ReactNode;

  if (activeTab === "cronograma") {
    const items = await listClientContentCalendar(client.id);
    lastUpdatedAt = mostRecentUpdate(items, lastUpdatedAt);
    content = <ClientHubItemList variant="calendar" clientId={client.id} items={items} users={users} />;
  } else if (activeTab === "roteiros") {
    const items = await listClientScripts(client.id);
    lastUpdatedAt = mostRecentUpdate(items, lastUpdatedAt);
    content = <ClientHubItemList variant="roteiro" clientId={client.id} items={items} users={users} />;
  } else if (activeTab === "stories") {
    const items = await listClientStories(client.id);
    lastUpdatedAt = mostRecentUpdate(items, lastUpdatedAt);
    content = <ClientHubItemList variant="story" clientId={client.id} items={items} users={users} />;
  } else if (activeTab === "galeria") {
    const files = galleryDefs ? await getRecentGalleryFiles(client.slug, galleryDefs, 500) : [];
    content = <ClientHubGallery files={files} folderLabels={galleryDefs?.map((def) => def.label) ?? []} />;
  } else {
    const [overview, recentMedia] = await Promise.all([
      getClientHubOverview(client.id),
      galleryDefs ? getRecentGalleryFiles(client.slug, galleryDefs, 8) : Promise.resolve([]),
    ]);
    content = (
      <ClientHubOverviewSection overview={overview} recentMedia={recentMedia} upcomingDeliveries={upcomingDeliveries} publicUrl={`/clients/${client.slug}/public`} />
    );
  }

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <ClientHubHeader client={client} nextDelivery={upcomingDeliveries[0] ?? null} lastUpdatedAt={lastUpdatedAt} />
      <div className="flex flex-col gap-6">
        <div className="overflow-x-auto">
          <PageTabs tabs={HUB_TABS} activeKey={activeTab} />
        </div>
        {content}
      </div>
    </main>
  );
}
