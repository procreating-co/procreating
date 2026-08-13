import type { ClientStatus } from "@/lib/supabase/types/database";

/**
 * Cliente do lado interno do ERP — espelha a linha de `public.clients` (Fase 1, Foundation).
 * Deliberadamente fora de `lib/clients/types.ts` (que é `ClientConfig`, o formato congelado da
 * plataforma pública de entrega — `/clients/[client]/**`, domínio que esta fase não toca).
 * `slug` é o valor compartilhado entre os dois lados — mesmo texto usado em
 * `lib/clients/registry.ts`/`workspace-registry.ts` — mas nesta fase cada lado ainda lê sua
 * própria fonte; só o valor já está alinhado, a leitura compartilhada fica pra quando esta
 * tabela estiver validada (ver "Auditoria Procreating OS", achado F.1, e a Seção G da mesma
 * auditoria).
 */
export type InternalClient = {
  id: string;
  name: string;
  slug: string;
  status: ClientStatus;
  document: string | null;
  segment: string | null;
  createdAt: string;
  updatedAt: string;
};
