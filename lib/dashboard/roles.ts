/**
 * Papéis previstos para a plataforma interna. Ainda não há autenticação nem checagem de
 * permissão em nenhuma rota — isto existe só para que `DashboardSection`/`NavItem` já tenham
 * onde pendurar um `roles?: Role[]` quando o controle de acesso for implementado.
 */
export type Role = "owner" | "partner" | "manager" | "employee";
