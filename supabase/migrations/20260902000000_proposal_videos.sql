-- Vídeos na Proposta (pedido explícito): vídeo de fundo no Hero (opcional, dentro do content
-- jsonb já existente — sem coluna nova) e uma nova seção "portfolio" (até 5 vídeos, limite
-- aplicado no editor, não aqui). Upload vai DIRETO do navegador pro Supabase Storage — nunca por
-- Server Action: o limite de payload de Function do Vercel é ~4.5MB, bem menor que um vídeo real.
-- Por isso a autorização mora inteiramente em RLS de storage.objects, não em código de servidor:
-- só staff ativo escreve (insert/update/delete), leitura é pública (bucket public) — mesma
-- composição já usada pra visualizar a proposta em si (RLS staff-only nas tabelas, função
-- SECURITY DEFINER pra leitura pública). `is_active_staff()` já existe desde o Client Portal
-- (Fase A), reaproveitada aqui sem duplicar lógica.
alter table public.proposal_sections drop constraint proposal_sections_section_type_check;
alter table public.proposal_sections add constraint proposal_sections_section_type_check
  check (section_type in ('hero', 'pillars', 'roadmap', 'tv_program', 'acquisition', 'budget', 'closing', 'portfolio'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proposal-videos', 'proposal-videos', true, 209715200, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

create policy proposal_videos_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'proposal-videos' and is_active_staff());
create policy proposal_videos_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'proposal-videos' and is_active_staff())
  with check (bucket_id = 'proposal-videos' and is_active_staff());
create policy proposal_videos_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'proposal-videos' and is_active_staff());
