-- Garantiza una sola temporada activa a la vez a nivel de base de datos
-- (antes esta invariante solo vivía en el código de las acciones de admin).
create unique index seasons_single_active_idx on seasons (is_active) where is_active;
