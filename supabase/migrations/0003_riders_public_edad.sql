-- La UI muestra la edad del corredor (perfil público, tabla admin). Se agrega
-- como columna calculada a la vista pública en vez de exponer birth_date.
drop view riders_public;

create view riders_public as
  select id, full_name, first_name, last_name, initials, club, gender,
         date_part('year', age(birth_date))::int as edad
  from riders;

grant select on riders_public to anon, authenticated;
