-- Dorsales asignados automáticamente al inscribirse (letra de la categoría +
-- consecutivo que empieza en 1 por carrera+categoría). Una tabla aparte
-- porque una inscripción puede puntuar en dos categorías (propia + Elite),
-- cada una con su propio consecutivo independiente.
create table entry_category_bibs (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries (id) on delete cascade,
  race_id uuid not null references races (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  bib int not null,
  created_at timestamptz not null default now(),
  unique (race_id, category_id, bib),
  unique (entry_id, category_id)
);

create index entry_category_bibs_entry_id_idx on entry_category_bibs (entry_id);

alter table entry_category_bibs enable row level security;

create policy entry_category_bibs_select_public on entry_category_bibs
  for select to anon, authenticated using (
    exists (select 1 from races where races.id = entry_category_bibs.race_id and races.status <> 'draft')
  );
