# Formato de intercambio liciba ⇄ liciba-cronometraje

Dos proyectos independientes, cero red entre ellos: todo el intercambio es
por archivo `.json`, descargado de uno y subido al otro a mano.

Fuente de verdad de los tipos TypeScript:
- liciba: `lib/domain/cronometraje-schema.ts`
- liciba-cronometraje: `src/types/liciba-schema.ts` (copia idéntica)

Si cambia el formato, **subir la versión** (`version: 2`, etc.) y actualizar
ambos archivos a la vez — nunca romper el formato anterior sin versionar.

## 1. Startlist (liciba admin → cronometraje)

Botón "Exportar corredores" en `/admin/carreras/[slug]`. Un archivo
`{slug}-startlist.json`:

```json
{
  "version": 1,
  "race": { "id": "uuid", "slug": "gran-fondo-x", "name": "...", "seasonId": "uuid", "type": "ruta", "laps": null },
  "categories": [{ "code": "juvenil_a", "name": "Juvenil A", "bibPrefix": "J" }],
  "entrants": [
    {
      "entryId": "uuid de entries.id",
      "riderId": "uuid de riders.id",
      "fullName": "...",
      "club": "..." ,
      "gender": "M",
      "categoryCode": "juvenil_a",
      "scoredCategoryCodes": ["juvenil_a", "elite_varonil"],
      "bib": 7,
      "bibsByCategory": { "juvenil_a": 7, "elite_varonil": 12 },
      "paid": true,
      "status": "confirmed"
    }
  ],
  "exportedAt": "2026-10-15T12:00:00.000Z"
}
```

Deliberadamente **sin** teléfono, contacto de emergencia ni datos de salud
— la laptop de cronometraje no necesita esa información.

`bib` es el dorsal oficial de temporada (categoría principal). El
cronometraje lo usa como **dorsal provisional** para corredores ya
inscritos — es el mismo número que llevan impreso.

`race.type` determina el modo de operación del cronometraje (grupos de
salida escalonados en "ruta", vueltas por categoría en "circuito").
`race.laps` es solo un default sugerido — el cronometraje permite editar
las vueltas por categoría antes de dar salida.

## 2. Resultados (cronometraje → liciba admin)

Botón "Exportar resultados" en la app de cronometraje. Un archivo
`{slug}-resultados.json`:

```json
{
  "version": 1,
  "race": { "id": "uuid", "slug": "gran-fondo-x" },
  "results": [
    {
      "kind": "existing",
      "entryId": "uuid de entries.id (del startlist)",
      "perCategory": [{ "categoryCode": "juvenil_a", "status": "OK", "netTimeMs": 5423000 }]
    },
    {
      "kind": "walkup",
      "provisionalBib": 231,
      "rider": { "fullName": "...", "firstName": "...", "lastName": "...", "club": null, "gender": "F" },
      "categoryCode": "principiantes",
      "scoredCategoryCodes": ["principiantes"],
      "paymentAmountMxn": 250,
      "perCategory": [{ "categoryCode": "principiantes", "status": "OK", "netTimeMs": 6120000 }]
    }
  ],
  "exportedAt": "2026-10-15T18:30:00.000Z"
}
```

Notas:
- **Sin `position`**: liciba la recalcula server-side ordenando por
  `netTimeMs` dentro de cada categoría — el cronometraje nunca tiene que
  acertar el ranking entre corredores de distintas categorías.
- `kind: "existing"` → ya tiene `entryId` real de Supabase (venía en el
  startlist). `kind: "walkup"` → corredor de último momento, no existe
  todavía en Supabase; liciba crea `riders` + `entries` + le asigna su
  dorsal OFICIAL de temporada al importar (puede ser distinto al
  `provisionalBib` que llevó puesto el día de la carrera — eso es
  intencional, ver `PLAN.md`).
- `perCategory` puede traer 2 entradas (categoría propia + Elite) para un
  corredor que puntúa doble.
