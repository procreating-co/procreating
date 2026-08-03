import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = {
  title: "Administração — Procreating",
  robots: { index: false, follow: false },
};

export default function AdministracaoPage() {
  return (
    <DashboardLayout>
      <EmptyState
        icon={Building2}
        title="Administração"
        description="Financeiro, indicadores, marketing e planejamento chegam aqui em breve."
      />
    </DashboardLayout>
  );
}
