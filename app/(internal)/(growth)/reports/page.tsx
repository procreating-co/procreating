import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Reports — Procreating OS",
  robots: { index: false, follow: false },
};

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Relatórios consolidados de Growth — funil, estratégias, simulações. Ainda não existe: hoje os números reais vivem espalhados em Overview, CRM e Simulators."
    />
  );
}
