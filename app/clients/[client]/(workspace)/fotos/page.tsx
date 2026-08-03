import { Image as ImageIcon } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceFotosPage() {
  return (
    <WorkspaceComingSoon
      icon={ImageIcon}
      title="Fotos"
      description="Biblioteca de fotos deste cliente — a mesma mídia usada na galeria pública, gerenciável aqui."
    />
  );
}
