-- =====================================================
-- SUPABASE: hardening template (for future Auth upgrade)
-- =====================================================
-- Use este arquivo quando migrar para Supabase Auth e quiser
-- bloquear acesso anonimo.

alter table public.app_settings enable row level security;
alter table public.app_users enable row level security;
alter table public.app_pending_users enable row level security;
alter table public.app_rejected_users enable row level security;
alter table public.app_bebidas enable row level security;
alter table public.app_lotes enable row level security;
alter table public.app_state enable row level security;

-- Remove policies anonimas
drop policy if exists "app_settings_select_anon" on public.app_settings;
drop policy if exists "app_settings_insert_anon" on public.app_settings;
drop policy if exists "app_settings_update_anon" on public.app_settings;
drop policy if exists "app_settings_delete_anon" on public.app_settings;

drop policy if exists "app_users_select_anon" on public.app_users;
drop policy if exists "app_users_insert_anon" on public.app_users;
drop policy if exists "app_users_update_anon" on public.app_users;
drop policy if exists "app_users_delete_anon" on public.app_users;

drop policy if exists "app_pending_users_select_anon" on public.app_pending_users;
drop policy if exists "app_pending_users_insert_anon" on public.app_pending_users;
drop policy if exists "app_pending_users_update_anon" on public.app_pending_users;
drop policy if exists "app_pending_users_delete_anon" on public.app_pending_users;

drop policy if exists "app_rejected_users_select_anon" on public.app_rejected_users;
drop policy if exists "app_rejected_users_insert_anon" on public.app_rejected_users;
drop policy if exists "app_rejected_users_update_anon" on public.app_rejected_users;
drop policy if exists "app_rejected_users_delete_anon" on public.app_rejected_users;

drop policy if exists "app_bebidas_select_anon" on public.app_bebidas;
drop policy if exists "app_bebidas_insert_anon" on public.app_bebidas;
drop policy if exists "app_bebidas_update_anon" on public.app_bebidas;
drop policy if exists "app_bebidas_delete_anon" on public.app_bebidas;

drop policy if exists "app_lotes_select_anon" on public.app_lotes;
drop policy if exists "app_lotes_insert_anon" on public.app_lotes;
drop policy if exists "app_lotes_update_anon" on public.app_lotes;
drop policy if exists "app_lotes_delete_anon" on public.app_lotes;

drop policy if exists "app_state_select_anon" on public.app_state;
drop policy if exists "app_state_insert_anon" on public.app_state;
drop policy if exists "app_state_update_anon" on public.app_state;
drop policy if exists "app_state_delete_anon" on public.app_state;

-- Policies somente para usuarios autenticados
create policy "app_settings_select_auth" on public.app_settings for select to authenticated using (true);
create policy "app_settings_insert_auth" on public.app_settings for insert to authenticated with check (true);
create policy "app_settings_update_auth" on public.app_settings for update to authenticated using (true) with check (true);
create policy "app_settings_delete_auth" on public.app_settings for delete to authenticated using (true);

create policy "app_users_select_auth" on public.app_users for select to authenticated using (true);
create policy "app_users_insert_auth" on public.app_users for insert to authenticated with check (true);
create policy "app_users_update_auth" on public.app_users for update to authenticated using (true) with check (true);
create policy "app_users_delete_auth" on public.app_users for delete to authenticated using (true);

create policy "app_pending_users_select_auth" on public.app_pending_users for select to authenticated using (true);
create policy "app_pending_users_insert_auth" on public.app_pending_users for insert to authenticated with check (true);
create policy "app_pending_users_update_auth" on public.app_pending_users for update to authenticated using (true) with check (true);
create policy "app_pending_users_delete_auth" on public.app_pending_users for delete to authenticated using (true);

create policy "app_rejected_users_select_auth" on public.app_rejected_users for select to authenticated using (true);
create policy "app_rejected_users_insert_auth" on public.app_rejected_users for insert to authenticated with check (true);
create policy "app_rejected_users_update_auth" on public.app_rejected_users for update to authenticated using (true) with check (true);
create policy "app_rejected_users_delete_auth" on public.app_rejected_users for delete to authenticated using (true);

create policy "app_bebidas_select_auth" on public.app_bebidas for select to authenticated using (true);
create policy "app_bebidas_insert_auth" on public.app_bebidas for insert to authenticated with check (true);
create policy "app_bebidas_update_auth" on public.app_bebidas for update to authenticated using (true) with check (true);
create policy "app_bebidas_delete_auth" on public.app_bebidas for delete to authenticated using (true);

create policy "app_lotes_select_auth" on public.app_lotes for select to authenticated using (true);
create policy "app_lotes_insert_auth" on public.app_lotes for insert to authenticated with check (true);
create policy "app_lotes_update_auth" on public.app_lotes for update to authenticated using (true) with check (true);
create policy "app_lotes_delete_auth" on public.app_lotes for delete to authenticated using (true);
