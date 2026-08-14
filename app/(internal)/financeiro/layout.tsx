import type { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { FINANCE_TABS } from "@/components/dashboard/nav-config";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav tabs={FINANCE_TABS} />
      {children}
    </>
  );
}
