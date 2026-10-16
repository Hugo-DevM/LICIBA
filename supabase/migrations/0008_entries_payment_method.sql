-- Guarda qué método de pago eligió el corredor al inscribirse, para poder
-- mostrarle su referencia exacta si vuelve después a pagar.
alter table entries
  add column payment_method text check (payment_method in ('oxxo', 'spei'));
