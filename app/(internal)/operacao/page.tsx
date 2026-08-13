import type { Metadata } from "next";
import { ModuleGrid } from "@/components/dashboard/module-grid";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";

export const metadata: Metadata = {
  title: "Operação — Procreating",
  robots: { index: false, follow: false },
};

const section = DASHBOARD_SECTIONS.find((item) => item.key === "operacao")!;

export default function OperacaoPage() {
  return <ModuleGrid section={section} />;
}
