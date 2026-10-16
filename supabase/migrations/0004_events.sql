-- LICIBA · eventos recreativos (rodadas, talleres, etc.)
-- A diferencia de las carreras: sin categorías, inscripción ni resultados.

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_date timestamptz not null,
  venue text not null,
  description text not null default '',
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create index events_event_date_idx on events (event_date);

alter table events enable row level security;

-- Lectura pública solo de eventos ya publicados; los borradores no se
-- anuncian. No hay policy de escritura: el admin escribe con la service
-- role key desde el servidor (bypassa RLS), igual que el resto del admin.
create policy events_select_public on events
  for select to anon, authenticated using (status = 'published');
