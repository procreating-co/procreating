import type { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { WORKSPACE_TABS } from "@/components/dashboard/nav-config";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav tabs={WORKSPACE_TABS} />
      {children}
    </>
  );
}
