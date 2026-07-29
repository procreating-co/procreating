import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/shell/coming-soon";

export const metadata: Metadata = { title: "Configurações | Painel Procreating" };

export default function AdminConfiguracoesPage() {
  return <ComingSoon title="Configurações" description="Preferências da plataforma e integrações (Supabase, R2)." />;
}
