import type { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { SETTINGS_TABS } from "@/components/dashboard/nav-config";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav tabs={SETTINGS_TABS} />
      {children}
    </>
  );
}
