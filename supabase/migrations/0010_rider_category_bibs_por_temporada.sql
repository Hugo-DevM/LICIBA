-- El dorsal es del corredor para TODA la temporada (liga), no por carrera:
-- una vez asignado, lo conserva en todas las carreras de esa categoría
-- dentro de la misma liga/temporada. Al abrir una liga nueva (season_id
-- distinto) la numeración puede reiniciar.
drop table entry_category_bibs;

create table rider_category_bibs (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  rider_id uuid not null references riders (id) on delete cascade,
  bib int not null,
  created_at timestamptz not null default now(),
  unique (season_id, category_id, bib),
  unique (season_id, category_id, rider_id)
);

create index rider_category_bibs_rider_idx on rider_category_bibs (rider_id);

alter table rider_category_bibs enable row level security;

create policy rider_category_bibs_select_public on rider_category_bibs
  for select to anon, authenticated using (true);
