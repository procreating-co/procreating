import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Inbox — Procreating OS",
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return <ComingSoon icon={Inbox} title="Inbox" description="Notificações e menções centralizadas — ainda não existe sistema de notificação no produto." />;
}
