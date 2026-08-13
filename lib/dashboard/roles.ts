/**
 * Papéis previstos para a plataforma interna. Reexporta `UserRole`
 * (`lib/supabase/types/database.ts`, o mesmo valor gravado em `public.users.role` e usado por
 * `lib/admin/auth/types.ts`) em vez de manter uma lista própria — antes da Fase 1 (Foundation)
 * este arquivo tinha um vocabulário diferente (`owner/partner/manager/employee`), que nunca
 * chegou a ser gravado em lugar nenhum; unificado num só lugar pra não haver dois "papel de
 * usuário" divergentes no projeto.
 *
 * Ainda não há checagem de permissão em nenhuma rota — isto existe só para que
 * `DashboardSection`/`NavItem` já tenham onde pendurar um `roles?: Role[]` quando o controle de
 * acesso por módulo for implementado (fase futura, RBAC granular).
 */
export type { UserRole as Role } from "@/lib/supabase/types/database";
