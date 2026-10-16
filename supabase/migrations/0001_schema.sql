-- LICIBA · esquema esencial (etapa 1, sin cronometraje/crossings todavía)
-- Ver PLAN.md §2 para el modelo completo al que esto escala.

create extension if not exists "pgcrypto";

create table seasons (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  short_name text not null,
  color text not null,
  min_age int,
  max_age int,
  gender text check (gender in ('M', 'F', 'X')),
  is_open boolean not null default false,
  sort_order int not null default 0
);

create table riders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  first_name text not null,
  last_name text not null,
  initials text not null,
  birth_date date,
  gender text check (gender in ('M', 'F', 'X')),
  club text,
  phone text,
  emergency_contact text,
  created_at timestamptz not null default now()
);

create table races (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete restrict,
  slug text not null unique,
  name text not null,
  race_date timestamptz not null,
  venue text not null,
  discipline text not null,
  type text not null check (type in ('ruta', 'circuito')),
  detail text,
  distance_km numeric,
  laps int,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'running', 'finished', 'published')),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  fee numeric not null default 0,
  capacity int not null default 0,
  fecha_n int,
  cover_image text,
  created_at timestamptz not null default now()
);

create table race_categories (
  race_id uuid not null references races (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  primary key (race_id, category_id)
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references races (id) on delete cascade,
  rider_id uuid not null references riders (id) on delete cascade,
  bib int,
  category_id uuid not null references categories (id) on delete restrict,
  scored_category_ids uuid[] not null default '{}',
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'dns', 'dnf', 'dsq')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (race_id, bib),
  unique (race_id, rider_id)
);

create table results (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  net_time_ms bigint,
  position int,
  points int not null default 0,
  status text not null default 'OK' check (status in ('OK', 'DNF', 'DNS', 'DSQ')),
  created_at timestamptz not null default now(),
  unique (entry_id, category_id)
);

create table standings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  rider_id uuid not null references riders (id) on delete cascade,
  total_points int not null default 0,
  races_counted int not null default 0,
  updated_at timestamptz not null default now(),
  unique (season_id, category_id, rider_id)
);

create index entries_race_id_idx on entries (race_id);
create index entries_rider_id_idx on entries (rider_id);
create index results_entry_id_idx on results (entry_id);
create index standings_season_category_idx on standings (season_id, category_id);
create index races_season_id_idx on races (season_id);
