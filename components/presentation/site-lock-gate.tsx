"use client";

import { useState, type ReactNode } from "react";
import { LockScreen } from "@/components/gallery/lock-screen";

/**
 * Gate de senha pra Home inteira de um cliente — reaproveita o `LockScreen` da Galeria
 * (mesmo componente, mesma UX) em vez de duplicar. Usado só quando `ClientConfig.siteLock`
 * está presente (ver `lib/clients/types.ts`); ausente pra maioria dos clientes (ex.: Pascoal),
 * que mantêm a Home aberta.
 */
export function SiteLockGate({
  accessCodes,
  title,
  logo,
  brandName,
  children,
}: {
  accessCodes: string[];
  title: string;
  logo: string;
  brandName: string;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} accessCodes={accessCodes} title={title} logo={logo} brandName={brandName} />;
  }

  return <>{children}</>;
}
