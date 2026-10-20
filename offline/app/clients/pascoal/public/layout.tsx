import type { CSSProperties, ReactNode } from "react";
import { getClientConfig } from "@/lib/clients";
import { OFFLINE_CLIENT_SLUG } from "@offline/lib/offline-data";

/** Mesmo wrapper de `app/clients/[client]/public/layout.tsx`: define `--client-accent` do cliente. */
export default async function OfflineClientLayout({ children }: { children: ReactNode }) {
  const config = await getClientConfig(OFFLINE_CLIENT_SLUG);
  return <div style={{ "--client-accent": config?.theme.accentColor } as CSSProperties}>{children}</div>;
}
