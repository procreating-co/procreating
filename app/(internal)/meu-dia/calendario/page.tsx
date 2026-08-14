import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata: Metadata = {
  title: "Calendário — Procreating OS",
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return <ComingSoon icon={Calendar} title="Calendário" description="Agenda pessoal e de reuniões — ainda não existe integração nem entidade de evento no produto." />;
}
