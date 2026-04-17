-- =====================================================
-- SUPABASE: hardening template (for future Auth upgrade)
-- =====================================================
-- Use este arquivo quando migrar para Supabase Auth e quiser
-- bloquear acesso anonimo.

-- 1) Garanta RLS habilitado
alter table public.app_state enable row level security;

-- 2) Remova policies anonimas
-- (execute apenas depois da migracao de auth)
drop policy if exists "app_state_select_anon" on public.app_state;
drop policy if exists "app_state_insert_anon" on public.app_state;
drop policy if exists "app_state_update_anon" on public.app_state;
drop policy if exists "app_state_delete_anon" on public.app_state;

-- 3) Policies somente para usuarios autenticados
create policy "app_state_select_auth"
on public.app_state
for select
to authenticated
using (true);

create policy "app_state_insert_auth"
on public.app_state
for insert
to authenticated
with check (true);

create policy "app_state_update_auth"
on public.app_state
for update
to authenticated
using (true)
with check (true);

-- delete opcional
create policy "app_state_delete_auth"
on public.app_state
for delete
to authenticated
using (true);