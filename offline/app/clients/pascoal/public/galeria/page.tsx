import { notFound } from "next/navigation";
import { getGalleryFolders } from "@/lib/gallery-server";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getClientConfig, getClientGalleryFolderDefs } from "@/lib/clients";
import { OFFLINE_CLIENT_SLUG } from "@offline/lib/offline-data";

/** Mesma página de `app/clients/[client]/public/galeria` — fotos servidas de `offline/public/gallery/`. */
export default async function OfflineGaleriaPage() {
  const [config, folderDefs] = await Promise.all([getClientConfig(OFFLINE_CLIENT_SLUG), getClientGalleryFolderDefs(OFFLINE_CLIENT_SLUG)]);
  if (!config || !folderDefs) notFound();

  const folders = await getGalleryFolders(OFFLINE_CLIENT_SLUG, folderDefs);

  return (
    <GalleryExperience
      folders={folders}
      accessCodes={config.gallery.accessCodes}
      lockScreenTitle={config.gallery.lockScreenTitle}
      logo={config.logo}
      brandName={config.brandName}
      driveUrl={config.gallery.driveUrl}
      homeHref={`/clients/${OFFLINE_CLIENT_SLUG}/public`}
    />
  );
}
