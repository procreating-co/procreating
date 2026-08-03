import { notFound } from "next/navigation";
import { getGalleryFolders } from "@/lib/gallery-server";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getClientConfig, getClientGalleryFolderDefs } from "@/lib/clients";

export default async function ClientGaleriaPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const [config, folderDefs] = await Promise.all([getClientConfig(client), getClientGalleryFolderDefs(client)]);
  if (!config || !folderDefs) notFound();

  const folders = await getGalleryFolders(client, folderDefs);

  return (
    <GalleryExperience
      folders={folders}
      accessCodes={config.gallery.accessCodes}
      lockScreenTitle={config.gallery.lockScreenTitle}
      logo={config.logo}
      brandName={config.brandName}
      driveUrl={config.gallery.driveUrl}
      homeHref={`/clients/${client}`}
    />
  );
}
