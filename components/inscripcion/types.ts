import type { RiderProfile } from "@/lib/domain/profile";

export interface InscripcionForm {
  nombre: string;
  apellidos: string;
  nac: string;
  sexo: "Varonil" | "Femenil";
  email: string;
  tel: string;
  club: string;
  talla: string;
  eNombre: string;
  eRel: string;
  eTel: string;
  sangre: string;
  salud: string;
}

export const EMPTY_FORM: InscripcionForm = {
  nombre: "",
  apellidos: "",
  nac: "",
  sexo: "Varonil",
  email: "",
  tel: "",
  club: "Independiente",
  talla: "M",
  eNombre: "",
  eRel: "",
  eTel: "",
  sangre: "O+",
  salud: "",
};

export function profileToForm(p: RiderProfile | null): InscripcionForm {
  if (!p) return EMPTY_FORM;
  return {
    nombre: p.first_name ?? "",
    apellidos: p.last_name ?? "",
    nac: p.birth_date ?? "",
    sexo: p.gender === "F" ? "Femenil" : "Varonil",
    email: p.email ?? "",
    tel: p.phone ?? "",
    club: p.club ?? "Independiente",
    talla: p.shirt_size ?? "M",
    eNombre: p.emergency_contact_name ?? "",
    eRel: p.emergency_contact_relationship ?? "",
    eTel: p.emergency_phone ?? "",
    sangre: p.blood_type ?? "O+",
    salud: p.health_notes ?? "",
  };
}
