import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ModuleGrid } from "@/components/dashboard/module-grid";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";

export const metadata: Metadata = {
  title: "Administração — Procreating",
  robots: { index: false, follow: false },
};

const section = DASHBOARD_SECTIONS.find((item) => item.key === "administracao")!;

export default function AdministracaoPage() {
  return (
    <DashboardLayout>
      <ModuleGrid section={section} />
    </DashboardLayout>
  );
}
