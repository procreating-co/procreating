import { Video } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceVideosPage() {
  return (
    <WorkspaceComingSoon
      icon={Video}
      title="Vídeos"
      description="Vídeos de redes sociais e aquisição deste cliente."
    />
  );
}
