-- Campos de perfil del corredor para autorrellenar inscripciones futuras.
alter table riders
  add column email text,
  add column shirt_size text,
  add column emergency_contact_relationship text,
  add column emergency_phone text,
  add column blood_type text,
  add column health_notes text;

alter table riders rename column emergency_contact to emergency_contact_name;

alter table riders add constraint riders_user_id_key unique (user_id);
