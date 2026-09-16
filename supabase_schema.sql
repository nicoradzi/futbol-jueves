-- FÚTBOL DEL JUEVES · ESQUEMA SUPABASE
-- Ejecutar completo en Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  skill int not null check (skill between 1 and 5),
  stamina int not null check (stamina between 1 and 5),
  position_1 text not null check (position_1 in ('ARQ','DEF','MED','DEL')),
  position_2 text check (position_2 is null or position_2 in ('ARQ','DEF','MED','DEL')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null unique,
  status text not null default 'OPEN' check (status in ('OPEN','PLAYED')),
  team_a_score int check (team_a_score is null or team_a_score >= 0),
  team_b_score int check (team_b_score is null or team_b_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches add column if not exists updated_at timestamptz not null default now();

create table if not exists public.attendance (
  match_id uuid references public.matches(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  confirmed boolean not null default false,
  primary key (match_id, player_id)
);

create table if not exists public.match_players (
  match_id uuid references public.matches(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  team text not null check (team in ('A','B')),
  position text,
  primary key (match_id, player_id)
);

alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.attendance enable row level security;
alter table public.match_players enable row level security;

drop policy if exists "public read players" on public.players;
create policy "public read players" on public.players for select using (true);
drop policy if exists "public read matches" on public.matches;
create policy "public read matches" on public.matches for select using (true);
drop policy if exists "public read attendance" on public.attendance;
create policy "public read attendance" on public.attendance for select using (true);
drop policy if exists "public read match_players" on public.match_players;
create policy "public read match_players" on public.match_players for select using (true);

drop policy if exists "auth write players" on public.players;
create policy "auth write players" on public.players for all to authenticated using (true) with check (true);
drop policy if exists "auth write matches" on public.matches;
create policy "auth write matches" on public.matches for all to authenticated using (true) with check (true);
drop policy if exists "auth write attendance" on public.attendance;
create policy "auth write attendance" on public.attendance for all to authenticated using (true) with check (true);
drop policy if exists "auth write match_players" on public.match_players;
create policy "auth write match_players" on public.match_players for all to authenticated using (true) with check (true);

create index if not exists players_active_idx on public.players(active);
create index if not exists attendance_match_idx on public.attendance(match_id);
create index if not exists match_players_match_idx on public.match_players(match_id);
create index if not exists match_players_player_idx on public.match_players(player_id);

-- La escritura está restringida a usuarios autenticados. No se habilita registro público.
