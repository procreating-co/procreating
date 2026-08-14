import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Marketing — Procreating",
  robots: { index: false, follow: false },
};

export default function MarketingPage() {
  return <ComingSoon icon={Megaphone} title="Dashboard de Marketing" description="Campanhas, posicionamento e crescimento — visão de longo prazo do produto. O que já existe hoje é o Simulador, em Marketing → Simuladores." />;
}
