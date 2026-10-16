-- Corredores de último momento pagan en efectivo el día de la carrera
-- (alta desde la app de cronometraje, importada después al admin).
alter table entries drop constraint entries_payment_method_check;
alter table entries add constraint entries_payment_method_check
  check (payment_method in ('oxxo', 'spei', 'efectivo'));
