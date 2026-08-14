import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Empresa — Procreating",
  robots: { index: false, follow: false },
};

export default function ConfiguracoesEmpresaPage() {
  return <ComingSoon icon={Building2} title="Dados da empresa" description="Razão social, CNPJ, dados de faturamento da própria Procreating — pra alimentar contrato e documentos futuramente." />;
}
