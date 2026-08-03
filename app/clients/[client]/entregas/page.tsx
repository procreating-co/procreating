import { PackageCheck } from "lucide-react";
import { WorkspaceComingSoon } from "@/components/workspace/workspace-coming-soon";

export default function WorkspaceEntregasPage() {
  return (
    <WorkspaceComingSoon
      icon={PackageCheck}
      title="Entregas"
      description="Histórico de publicações e deploys deste cliente."
    />
  );
}
