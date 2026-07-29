import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/shell/coming-soon";

export const metadata: Metadata = { title: "Uploads | Painel Procreating" };

export default function AdminUploadsPage() {
  return <ComingSoon title="Uploads" description="Central de upload de vídeos e fotos por projeto, usando lib/storage." />;
}
