-- Continuação de `20260814270000_security_fixes.sql` — `revoke ... from public` não bastou.
-- Supabase concede `EXECUTE ON ALL FUNCTIONS IN SCHEMA public` a `anon`/`authenticated` por
-- default privilege no nível do schema (não por função) na hora que o projeto é criado — é um
-- grant direto a `anon`, não herdado via PUBLIC, então `revoke ... from public` não o atinge.
-- Confirmado por query direta em `information_schema.role_routine_grants` depois da migration
-- anterior: `anon` continuava com EXECUTE. Revoga explicitamente da role.

revoke execute on function public.close_lead_and_create_client(uuid, jsonb) from anon;
