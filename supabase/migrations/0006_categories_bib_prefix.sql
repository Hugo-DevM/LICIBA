-- Letra de dorsal por categoría (p. ej. "JA" para Juvenil A, "MD" para
-- Master 50) tomada del flyer "Reto La Limonera" (Quinta fecha, serial
-- LICIBA 2026). min_age/max_age ya existían en el esquema; ahora se llenan
-- con datos reales en vez de quedar vacíos.
alter table categories add column bib_prefix text not null default '';
