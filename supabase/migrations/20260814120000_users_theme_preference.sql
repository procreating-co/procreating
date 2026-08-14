-- Preferência de tema (light/dark) por conta — persistência real entre dispositivos pro toggle
-- da nova sidebar do Procreating OS. Nullable, sem default: null = "sem preferência salva ainda",
-- resolvido em runtime (cookie > users.theme > "dark", o visual atual) — nunca inventa uma
-- preferência que o usuário não escolheu.
alter table public.users
  add column theme text check (theme in ('light', 'dark'));
