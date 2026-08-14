import type { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { OPERATIONS_TABS } from "@/components/dashboard/nav-config";

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav tabs={OPERATIONS_TABS} />
      {children}
    </>
  );
}
