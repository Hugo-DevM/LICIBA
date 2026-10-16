-- LICIBA · RLS (etapa 1)
-- Lectura pública de datos no sensibles; nada de escritura por anon/authenticated
-- todavía (no hay Supabase Auth en el admin). Las escrituras del admin se harán
-- desde el servidor con la service role key, que ignora RLS.

alter table seasons enable row level security;
alter table categories enable row level security;
alter table riders enable row level security;
alter table races enable row level security;
alter table race_categories enable row level security;
alter table entries enable row level security;
alter table results enable row level security;
alter table standings enable row level security;

-- Referencia pública: temporadas y categorías siempre visibles.
create policy seasons_select_public on seasons
  for select to anon, authenticated using (true);

create policy categories_select_public on categories
  for select to anon, authenticated using (true);

-- Carreras: ocultar borradores (todavía no anunciadas).
create policy races_select_public on races
  for select to anon, authenticated using (status <> 'draft');

create policy race_categories_select_public on race_categories
  for select to anon, authenticated using (
    exists (
      select 1 from races
      where races.id = race_categories.race_id
        and races.status <> 'draft'
    )
  );

-- Inscripciones: visibles solo si la carrera ya se anunció.
create policy entries_select_public on entries
  for select to anon, authenticated using (
    exists (
      select 1 from races
      where races.id = entries.race_id
        and races.status <> 'draft'
    )
  );

-- Resultados: visibles solo cuando el admin publica la carrera.
create policy results_select_public on results
  for select to anon, authenticated using (
    exists (
      select 1 from entries
      join races on races.id = entries.race_id
      where entries.id = results.entry_id
        and races.status = 'published'
    )
  );

-- Clasificación de temporada: siempre es resultado ya publicado/agregado.
create policy standings_select_public on standings
  for select to anon, authenticated using (true);

-- riders no lleva policy de select: contiene teléfono y contacto de emergencia.
-- Se expone una vista pública con solo los campos no sensibles.
create view riders_public as
  select id, full_name, first_name, last_name, initials, club, gender
  from riders;

grant select on riders_public to anon, authenticated;
