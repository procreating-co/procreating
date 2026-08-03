import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = {
  title: "Operação — Procreating",
  robots: { index: false, follow: false },
};

export default function OperacaoPage() {
  return (
    <DashboardLayout>
      <EmptyState
        icon={Layers}
        title="Operação"
        description="Clientes, projetos, produção e equipe chegam aqui em breve."
      />
    </DashboardLayout>
  );
}
