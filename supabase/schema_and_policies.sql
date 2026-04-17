-- =====================================================
-- SUPABASE: normalized schema + RLS for Validade de Bebidas
-- =====================================================

-- SETTINGS (theme/current logged user)
create table if not exists public.app_settings (
  id text primary key,
  theme text not null default 'light',
  current_user_data jsonb,
  updated_at timestamptz not null default now()
);

-- USERS APPROVED
create table if not exists public.app_users (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- USERS PENDING
create table if not exists public.app_pending_users (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- USERS REJECTED
create table if not exists public.app_rejected_users (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- BEVERAGES
create table if not exists public.app_bebidas (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- LOTS
create table if not exists public.app_lotes (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
alter table public.app_users enable row level security;
alter table public.app_pending_users enable row level security;
alter table public.app_rejected_users enable row level security;
alter table public.app_bebidas enable row level security;
alter table public.app_lotes enable row level security;

-- -----------------------------------------------------
-- MODO A (compativel com o app atual, sem Supabase Auth)
-- -----------------------------------------------------
-- AVISO: esta configuracao permite acesso da chave anon.
-- Use apenas em ambiente interno/confiavel.

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

create policy "app_settings_select_anon" on public.app_settings for select to anon, authenticated using (true);
create policy "app_settings_insert_anon" on public.app_settings for insert to anon, authenticated with check (true);
create policy "app_settings_update_anon" on public.app_settings for update to anon, authenticated using (true) with check (true);
create policy "app_settings_delete_anon" on public.app_settings for delete to anon, authenticated using (true);

create policy "app_users_select_anon" on public.app_users for select to anon, authenticated using (true);
create policy "app_users_insert_anon" on public.app_users for insert to anon, authenticated with check (true);
create policy "app_users_update_anon" on public.app_users for update to anon, authenticated using (true) with check (true);
create policy "app_users_delete_anon" on public.app_users for delete to anon, authenticated using (true);

create policy "app_pending_users_select_anon" on public.app_pending_users for select to anon, authenticated using (true);
create policy "app_pending_users_insert_anon" on public.app_pending_users for insert to anon, authenticated with check (true);
create policy "app_pending_users_update_anon" on public.app_pending_users for update to anon, authenticated using (true) with check (true);
create policy "app_pending_users_delete_anon" on public.app_pending_users for delete to anon, authenticated using (true);

create policy "app_rejected_users_select_anon" on public.app_rejected_users for select to anon, authenticated using (true);
create policy "app_rejected_users_insert_anon" on public.app_rejected_users for insert to anon, authenticated with check (true);
create policy "app_rejected_users_update_anon" on public.app_rejected_users for update to anon, authenticated using (true) with check (true);
create policy "app_rejected_users_delete_anon" on public.app_rejected_users for delete to anon, authenticated using (true);

create policy "app_bebidas_select_anon" on public.app_bebidas for select to anon, authenticated using (true);
create policy "app_bebidas_insert_anon" on public.app_bebidas for insert to anon, authenticated with check (true);
create policy "app_bebidas_update_anon" on public.app_bebidas for update to anon, authenticated using (true) with check (true);
create policy "app_bebidas_delete_anon" on public.app_bebidas for delete to anon, authenticated using (true);

create policy "app_lotes_select_anon" on public.app_lotes for select to anon, authenticated using (true);
create policy "app_lotes_insert_anon" on public.app_lotes for insert to anon, authenticated with check (true);
create policy "app_lotes_update_anon" on public.app_lotes for update to anon, authenticated using (true) with check (true);
create policy "app_lotes_delete_anon" on public.app_lotes for delete to anon, authenticated using (true);

-- -----------------------------------------------------
-- Legacy table kept for backward compatibility/read-only migration
-- -----------------------------------------------------
create table if not exists public.app_state (
  id text primary key,
  users jsonb not null default '[]'::jsonb,
  pending_users jsonb not null default '[]'::jsonb,
  rejected_users jsonb not null default '[]'::jsonb,
  theme text not null default 'light',
  bebidas jsonb not null default '[]'::jsonb,
  lotes jsonb not null default '[]'::jsonb,
  current_user_data jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select_anon" on public.app_state;
drop policy if exists "app_state_insert_anon" on public.app_state;
drop policy if exists "app_state_update_anon" on public.app_state;
drop policy if exists "app_state_delete_anon" on public.app_state;

create policy "app_state_select_anon" on public.app_state for select to anon, authenticated using (true);
create policy "app_state_insert_anon" on public.app_state for insert to anon, authenticated with check (true);
create policy "app_state_update_anon" on public.app_state for update to anon, authenticated using (true) with check (true);
create policy "app_state_delete_anon" on public.app_state for delete to anon, authenticated using (true);
