import { FolderKanban } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceProjetosPage() {
  return (
    <WorkspaceComingSoon
      icon={FolderKanban}
      title="Projetos"
      description="Todos os projetos deste cliente — cada instância criada a partir de um template."
    />
  );
}
