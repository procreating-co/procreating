import { notFound } from "next/navigation";
import { getGalleryFolders } from "@/lib/gallery-server";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getClientConfig, getClientGalleryFolderDefs, getClientVideos } from "@/lib/clients";

export default async function ClientGaleriaPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const [config, folderDefs, videos] = await Promise.all([
    getClientConfig(client),
    getClientGalleryFolderDefs(client),
    getClientVideos(client),
  ]);
  if (!config || !folderDefs) notFound();

  const folders = await getGalleryFolders(client, folderDefs);

  return (
    <GalleryExperience
      folders={folders}
      videos={videos?.galleryVideos}
      accessCodes={config.gallery.accessCodes}
      lockScreenTitle={config.gallery.lockScreenTitle}
      logo={config.logo}
      brandName={config.brandName}
      driveUrl={config.gallery.driveUrl}
      allowDownload={config.gallery.allowDownload}
      homeHref={`/clients/${client}/public`}
    />
  );
}
