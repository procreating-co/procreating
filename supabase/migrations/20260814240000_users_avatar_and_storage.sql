-- Foto de perfil da conta — primeira vez que Storage do Supabase é usado neste projeto (o
-- `/admin/uploads` existente é só um mock em memória, sem bucket real por trás). Coluna nova
-- segue o mesmo padrão de `users.theme` (nullable, sem RLS nova — `users_update_own`, da
-- migration `20260814130000_users_update_own_row.sql`, já cobre update de qualquer coluna na
-- própria linha).

alter table public.users add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Mesmo padrão RLS coarse de sempre (`for all to authenticated using (true) with check (true)`),
-- só filtrado por bucket — não invento um esquema de autorização por pasta/dono de arquivo.
create policy avatars_all_authenticated on storage.objects for all to authenticated using (bucket_id = 'avatars') with check (bucket_id = 'avatars');
