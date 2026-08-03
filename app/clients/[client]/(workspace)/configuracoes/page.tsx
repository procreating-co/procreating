import { Settings } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceConfiguracoesPage() {
  return (
    <WorkspaceComingSoon
      icon={Settings}
      title="Configurações"
      description="Preferências deste workspace — tema, template, domínio."
    />
  );
}
