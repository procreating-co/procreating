import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/shell/coming-soon";

export const metadata: Metadata = { title: "Analytics | Painel Procreating" };

export default function AdminAnalyticsPage() {
  return <ComingSoon title="Analytics" description="Visualizações, downloads, dispositivos e origem de acesso por projeto." />;
}
