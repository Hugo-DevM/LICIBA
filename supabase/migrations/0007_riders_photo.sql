-- Foto de perfil del corredor, subida a Cloudinary desde /cuenta.
alter table riders add column photo_url text;

drop view riders_public;

create view riders_public as
  select id, full_name, first_name, last_name, initials, club, gender,
         date_part('year', age(birth_date))::int as edad,
         photo_url
  from riders;

grant select on riders_public to anon, authenticated;
