import type { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { GROWTH_TABS } from "@/components/dashboard/nav-config";

/**
 * Layout compartilhado por 3 segmentos de rota que continuam com URLs próprias e inalteradas
 * (`/comercial/**`, `/marketing/**`, `/clientes/**`) — o route group `(growth)` só agrupa o
 * `layout.tsx`, é invisível na URL. Isso é o que permite um `TopNav` só (as abas do grupo
 * Growth da sidebar) cobrir as três áreas sem duplicar o componente em cada uma.
 */
export default function GrowthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav tabs={GROWTH_TABS} />
      {children}
    </>
  );
}
