-- =====================================================
-- SUPABASE: schema + RLS for Validade de Bebidas
-- =====================================================

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

-- Remove policies antigas (idempotente)
drop policy if exists "app_state_select_anon" on public.app_state;
drop policy if exists "app_state_insert_anon" on public.app_state;
drop policy if exists "app_state_update_anon" on public.app_state;
drop policy if exists "app_state_delete_anon" on public.app_state;

-- -----------------------------------------------------
-- MODO A (compativel com o app atual, sem Supabase Auth)
-- -----------------------------------------------------
-- AVISO: esta configuracao permite acesso da chave anon.
-- Use apenas em ambiente interno/confiavel.

create policy "app_state_select_anon"
on public.app_state
for select
to anon, authenticated
using (true);

create policy "app_state_insert_anon"
on public.app_state
for insert
to anon, authenticated
with check (true);

create policy "app_state_update_anon"
on public.app_state
for update
to anon, authenticated
using (true)
with check (true);

-- opcional: geralmente nao precisa delete para este app
create policy "app_state_delete_anon"
on public.app_state
for delete
to anon, authenticated
using (true);
