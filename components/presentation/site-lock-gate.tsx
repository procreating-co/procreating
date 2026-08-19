"use client";

import { useState, type ReactNode } from "react";
import { LockScreen } from "@/components/gallery/lock-screen";

/**
 * Gate de senha pra Home inteira de um cliente — reaproveita o `LockScreen` da Galeria
 * (mesmo componente, mesma UX) em vez de duplicar. Usado só quando `ClientConfig.siteLock`
 * está presente (ver `lib/clients/types.ts`); ausente pra maioria dos clientes (ex.: Pascoal),
 * que mantêm a Home aberta.
 *
 * `skipLock` — pedido explícito: quem já está logado no Procreating OS (ERP) não precisa digitar
 * a senha de novo. Decidido no SERVIDOR por quem chama (`app/clients/[client]/public/page.tsx`,
 * via `getSession()` — a mesma validação real que todo `(internal)/**` usa), nunca aqui: este
 * componente é `"use client"` e não tem acesso a cookie de sessão nenhum (o cookie do ERP é
 * `httpOnly`, JS não consegue ler mesmo se tentasse) — receber a decisão já pronta evita
 * qualquer tentativa de checar sessão no cliente, que seria menos seguro e mais frágil. Estado
 * inicial já nasce correto (`useState(skipLock)`), sem flash do `LockScreen` pra quem tem
 * sessão.
 */
export function SiteLockGate({
  accessCodes,
  title,
  logo,
  brandName,
  skipLock = false,
  children,
}: {
  accessCodes: string[];
  title: string;
  logo: string;
  brandName: string;
  skipLock?: boolean;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(skipLock);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} accessCodes={accessCodes} title={title} logo={logo} brandName={brandName} />;
  }

  return <>{children}</>;
}
