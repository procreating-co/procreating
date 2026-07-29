import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/shell/coming-soon";

export const metadata: Metadata = { title: "Usuários | Painel Procreating" };

export default function AdminUsuariosPage() {
  return <ComingSoon title="Usuários" description="Gestão de quem tem acesso ao painel, uma vez que o Supabase Auth estiver conectado." />;
}
