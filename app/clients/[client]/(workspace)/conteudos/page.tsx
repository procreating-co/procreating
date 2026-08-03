import { FileText } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceConteudosPage() {
  return (
    <WorkspaceComingSoon
      icon={FileText}
      title="Conteúdos"
      description="Textos, copy e materiais escritos preparados para este cliente."
    />
  );
}
