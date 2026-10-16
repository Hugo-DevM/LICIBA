import type { CategoriaId } from "./types";

// Categorías infantiles/juveniles: cuota reducida, no pueden sumar la
// opción de "correr también en Elite".
export const CATS_MENORES: CategoriaId[] = [
  "panales",
  "infantil_aa",
  "infantil_a",
  "infantil_b",
  "infantil_c",
  "juvenil_a",
  "juvenil_b",
  "juvenil_c",
];

// Únicas categorías con rama explícita en el nombre (Varonil/Femenil); el
// resto son abiertas a cualquier rama.
export const CATS_SOLO_VARONIL: CategoriaId[] = ["elite_varonil"];
export const CATS_SOLO_FEMENIL: CategoriaId[] = ["elite_femenil", "femenil_intermedio"];
