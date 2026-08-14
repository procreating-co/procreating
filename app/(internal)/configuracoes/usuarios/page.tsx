import type { Metadata } from "next";
import { UserCog } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Usuários — Procreating",
  robots: { index: false, follow: false },
};

export default function ConfiguracoesUsuariosPage() {
  return <ComingSoon icon={UserCog} title="Usuários" description="Gestão de quem tem acesso e com qual papel — hoje o cadastro é via allowlist em /admin/signup, sem tela de gestão ainda." />;
}
