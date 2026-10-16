# Liga de Ciclismo Puerto Vallarta — Plan técnico

> Documento de diseño. Etapa 1 = sitio público + inscripciones + admin manual.
> Etapa 2 = sistema de cronometraje offline con sincronización automática.

---

## 1. Decisión arquitectónica central

**El problema difícil no es la landing, es el cronometraje.** Y la decisión más
importante se toma *ahora*, en la etapa 1: **la base de datos se diseña desde el
día uno para la etapa 2.**

Concretamente: los resultados **no se guardan como resultados**, se guardan como
un **log de eventos de cruce** (`crossings`) y el resultado/ranking se *calcula*
a partir de ellos.

```
crossings (append-only)  →  results (vista/materializada)  →  standings (liga)
```

En etapa 1 esos eventos los crea el admin a mano desde el dashboard.
En etapa 2 los crea la app offline y se sincronizan.
**Mismo destino, misma tabla, cero migración.** Si en cambio en etapa 1 guardas
"posición 1, tiempo 1:02:33" en una tabla plana, la etapa 2 te obliga a rehacer todo.

Reglas del log de eventos:
- Cada evento trae un **UUID generado en el cliente** → el `upsert` es idempotente,
  puedes reenviar el mismo evento 10 veces sin duplicar.
- Es **append-only**: nunca se edita ni se borra. Una corrección es un evento nuevo
  que anula el anterior (`voided_by_id`). Esto da trazabilidad para disputas
  ("el juez dice que llegué antes") y hace que mezclar datos de varios dispositivos
  sea trivial.
- Cada evento guarda `device_id` + `recorded_at` (hora de liga, ver §3) + `source`
  (`manual_admin` | `timing_app` | `import_csv`).

---

## 2. Modelo de datos (Supabase / Postgres)

```
seasons            id, year, name, is_active, points_scale_id
categories         id, season_id, code, name, min_age, max_age, gender,
                   is_open (Elite = true → sin límite de edad)
riders             id, user_id?, full_name, birth_date, gender, club, phone, emergency_contact
races              id, season_id, slug, name, date, venue, type (circuit|p2p),
                   laps?, distance_km, status (draft|open|closed|running|finished|published),
                   registration_opens_at, registration_closes_at, fee, cover_image
race_categories    race_id, category_id, laps_override?, distance_override?
rounds             id, race_id, number, name, scheduled_at
start_groups       id, round_id, order, category_ids[], scheduled_offset_sec,
                   actual_start_at (null hasta que arranca)
entries            id, race_id, rider_id, bib, start_group_id,
                   scored_categories[]  ← aquí vive la regla Elite (§4)
                   status (pending_payment|confirmed|dns|dnf|dsq), paid_at
crossings          id (uuid cliente), entry_id?, bib?, race_id, lap_number,
                   recorded_at, device_id, source, voided_by_id, note
results            entry_id, category_id, net_time_ms, position, points   ← derivado
standings          season_id, category_id, rider_id, total_points, races_counted ← derivado
points_scale       id, name, rules jsonb  (ej. {1:25, 2:20, 3:16, ...}, drop_worst:1)
devices            id, name, last_seen_at, clock_offset_ms   (etapa 2)
```

RLS de Supabase:
- `riders`, `entries`: el corredor ve y edita lo suyo.
- `races`, `results`, `standings`: lectura pública **solo** si `status = 'published'`.
- Todo lo de escritura de admin/juez: por `profiles.role in ('admin','judge')`.
- La app de cronometraje escribe **solo** en `crossings` y `start_groups.actual_start_at`.

---

## 3. Los tres problemas offline y su solución

### 3.1 No hay internet en el lugar de la carrera
**PWA instalable** (`/cronometraje`), no app nativa — mismo repo Next.js, service
worker con [Serwist](https://serwist.pages.dev/), datos locales en **IndexedDB** (Dexie).

Flujo obligatorio:
1. **En la ciudad, con internet**: el juez abre la PWA y pulsa
   *"Descargar carrera"* → se baja el roster completo (dorsales, nombres,
   categorías, rondas, grupos de salida) a IndexedDB. La app queda bloqueada
   para operar esa carrera aunque pierda la red.
2. **En la carrera, sin internet**: todo se escribe en IndexedDB en una cola
   (*outbox*).
3. **Al volver la señal**: se vacía la cola contra Supabase. Idempotente por UUID,
   así que reintentar es seguro. Indicador visible: `23 eventos pendientes`.

Nunca se depende de que haya red para operar. La red es solo para cargar antes
y descargar después.

### 3.2 No se sabe a qué hora salieron del punto A (carreras A→B)
Dos capas:

**(a) Reloj de liga compartido.** Cuando cualquier dispositivo tiene internet,
pide la hora al servidor y guarda `clock_offset_ms = server_time - device_time`.
A partir de ahí **todos los timestamps se registran como `Date.now() + offset`**,
no como hora del teléfono. Teléfonos con hora automática están dentro de ~1s
entre sí; con el offset quedan prácticamente alineados y la deriva en 3-4 horas
es de milisegundos. Además se guarda `performance.now()` en paralelo para
**detectar si alguien cambió el reloj del sistema a mitad de carrera** (si el
monotónico y el de pared discrepan, la app avisa).

**(b) Transferencia de la hora de salida sin internet → código QR.**
El juez de salida pulsa `SALIDA` por cada grupo; la app guarda `actual_start_at`.
Al terminar las salidas, muestra un **QR** con un JSON diminuto:
`[{group_id, actual_start_at}, ...]`. El juez de meta lo **escanea con la cámara**
(BarcodeDetector API) y ya tiene las horas de salida reales, sin red.
Fallbacks en cascada, por si falla la cámara:
1. Entrada manual: son 6–9 horas (`08:00:12`), se teclean en 30 segundos.
2. Horario programado: si la salida fue puntual, se usan los
   `scheduled_offset_sec` ya cargados y solo se corrige el desfase global
   ("arrancamos 4 min tarde").
3. Radio/WhatsApp cuando hay señal en un punto.

Y siempre: **hoja de papel de respaldo** con las horas de salida. Esto no es
opcional en cronometraje real.

### 3.3 Capturar quién cruza, en bola, a mano
El error de diseño típico es pedir "escribe el dorsal" mientras pasan 5 ciclistas.
La solución correcta es **separar el tiempo de la identidad**:

> **Un botón gigante `MARCAR` que registra un timestamp inmediato, sin dorsal.**
> La asignación del dorsal se hace después, desde la lista de marcas pendientes.

- Pantalla de meta: botón `MARCAR` ocupando media pantalla + teclado numérico al
  lado. Si alcanzas a teclear el dorsal antes del cruce, queda asignado de una;
  si no, queda como marca huérfana y la resuelves 10 segundos después.
- Lista de marcas en vivo, editable, con *undo* y nota de voz opcional por marca.
- **Circuitos**: la app sabe cuántas vueltas lleva cada dorsal y marca
  automáticamente `lap_number`; avisa cuando un dorsal completó la distancia.
- **Modo multi-juez**: dos o tres teléfonos marcando a la vez. Como todo es un log
  de eventos con `device_id`, el servidor los mezcla y detecta duplicados
  (mismo dorsal, misma vuelta, < 3s de diferencia → se marca para revisión del admin).
- Respaldo de video: recomendar grabar la meta con un celular fijo. Es gratis y
  resuelve el 100% de las protestas.

---

## 4. Reglas de negocio que hay que modelar bien

### Categorías por edad + Elite
Regla: un corredor **solo** puede inscribirse en la categoría que le corresponde
por edad, **y además** puede inscribirse en Elite (sin límite de edad).

Modelado: el corredor **corre una sola vez** con **un solo dorsal**, pero su
`entry` tiene `scored_categories = [su_categoría_edad, elite]`. El tiempo se
captura **una vez** y se puntúa en **dos clasificaciones independientes**.
Esto evita el error de duplicar la inscripción (que obligaría a correr dos veces
y rompería el ranking).

Edad: se calcula con **año de la temporada − año de nacimiento** (criterio UCI),
no con la fecha exacta. Se valida en el formulario de inscripción y en un
`check constraint`/trigger en la BD, no solo en el front.

> ⚠️ Pendiente de confirmar: si Elite sale en un grupo/ronda distinto al de su
> categoría de edad, entonces sí tendría que correr dos veces y el modelo cambia
> (dos `entries`, dos dorsales). Ver §7.

### Rondas y salidas escalonadas
```
Carrera
└── Ronda 1
    ├── Grupo A (cat. X)      offset 0 s
    ├── Grupo B (cat. Y)      offset 60 s
    └── Grupo C (cat. Z)      offset 120 s
└── Ronda 2
    ├── Grupo D ...           offset 0 s (relativo a la ronda)
    └── ...
```
**Tiempo neto = `crossing.recorded_at` − `start_group.actual_start_at`.**
Nunca se usa la hora de salida de la ronda ni la del primer grupo. Cada grupo
tiene su propia hora de salida real; de ahí la importancia del §3.2.

### Puntos y ranking de liga
- Tabla de puntos configurable (`points_scale.rules`) para no hardcodear.
- Clasificación **por categoría**, por temporada (año).
- Desempates, en orden: (1) más victorias, (2) mejor posición en la última carrera,
  (3) suma de tiempos netos.
- Soporte opcional para "se descartan las N peores carreras" (`drop_worst`).
- Cada temporada es independiente: ranking de 2025 ≠ ranking de 2026. Ya está
  cubierto con `seasons`.

---

## 5. Stack y estructura

- **Next.js 16 App Router** + **Tailwind** + **shadcn/ui** (acelera mucho el admin).
- **Supabase**: Postgres + Auth + Storage (fotos de carrera, comprobantes de pago)
  + RLS. Migraciones versionadas con Supabase CLI, no clicks en el dashboard.
- **Zod** para validación compartida cliente/servidor.
- **TanStack Query** solo dentro de la PWA de cronometraje (caché offline);
  en el sitio público, Server Components y `revalidateTag`.
- **Deploy**: Vercel. ISR/revalidación por tag para resultados y ranking.
- **Serwist + Dexie** para la PWA de la etapa 2.

```
app/
  (public)/            page.tsx, carreras/, carreras/[slug]/, resultados/,
                       ranking/[year]/, corredores/[id]/, nosotros/, contacto/
  (auth)/              login, registro, mi-cuenta/, mis-inscripciones/
  (admin)/admin/       temporadas/, carreras/[id]/ (rondas, grupos, inscritos,
                       dorsales, cruces, publicar), categorias/, corredores/,
                       puntos/, revision/   ← cruces duplicados o huérfanos
  (timing)/cronometraje/  ← etapa 2, shell offline propio
lib/
  domain/              scoring.ts, categories.ts, timing.ts   ← lógica pura, testeada
  supabase/            client.ts, server.ts, queries/
supabase/migrations/
```

**`lib/domain/` es lógica pura sin dependencias de Supabase ni React**
(cálculo de edad/categoría, tiempo neto, puntos, desempates). Es la única parte
del proyecto que **necesita tests unitarios** — un error ahí significa un ranking
mal calculado y un conflicto con los corredores. El resto se puede probar a mano.

---

## 6. Etapas de entrega

### Etapa 1 — Sitio + inscripciones + admin manual
Orden de construcción (cada paso deja algo usable):

1. Esquema completo de BD + RLS + seed con datos reales de una carrera pasada.
   *(Primero esto. Todo lo demás depende de que el modelo esté bien.)*
2. `lib/domain/` + tests: edad→categoría, tiempo neto, puntos, desempates.
3. Auth + perfil de corredor (alta con fecha de nacimiento, categoría sugerida).
4. Admin: temporadas, categorías, carreras, rondas y grupos de salida.
5. Público: home, listado de carreras próximas/pasadas, detalle de carrera.
6. Inscripción a carrera: valida edad vs categoría, aplica regla Elite,
   asigna dorsal, estado de pago.
7. Admin: captura manual de tiempos (una tabla editable rápida, tipo hoja de
   cálculo, y además **importación CSV** — ahorra horas) + publicación.
8. Público: resultados por carrera y por categoría, ranking de liga por año,
   perfil de corredor con su historial.
9. Pulido: SEO, OG images, responsive, fotos.

### Etapa 2 — Cronometraje offline

> **Actualización 2026-10-15:** se descartó el enfoque de PWA dentro de
> este repo con sincronización automática (outbox) descrito abajo. En su
> lugar se construyó `liciba-cronometraje` como proyecto Vite+React+TS
> completamente separado, offline-first con IndexedDB, que intercambia
> datos con este sitio exclusivamente por archivo JSON (exportar
> corredores → importar en cronometraje → exportar resultados → importar
> aquí). Más simple, cero dependencia de red incluso al terminar la
> carrera. Ver `docs/cronometraje-json-schema.md` y
> `lib/domain/cronometraje-actions.ts`. El resto de esta sección queda
> como registro histórico de la idea original, no como plan vigente.

1. PWA shell + instalable + descarga de carrera a IndexedDB.
2. Reloj de liga (offset + detección de cambio de reloj).
3. Pantalla de **salida**: botón por grupo + generación de QR.
4. Pantalla de **meta**: `MARCAR` + asignación posterior + vueltas + multi-juez.
5. Escaneo de QR / entrada manual de horas de salida.
6. Outbox + sincronización idempotente + indicador de pendientes.
7. Pantalla de **revisión** en el admin: duplicados, huérfanos, conflictos.
8. Prueba de campo real en una carrera, **en paralelo con el papel**. No se jubila
   el papel hasta que dos carreras salgan limpias.

### Etapa 3 (opcional, futuro)
Chips RFID / transpondedores si la liga crece. El modelo de eventos de cruce ya
lo soporta: un lector RFID es simplemente otro `source` escribiendo en `crossings`.
Por eso conviene el diseño de §1.

---

## 7. Dudas que cambian el diseño

1. **Elite**: ¿el corredor de Elite + su categoría de edad **corre una sola vez**
   (un dorsal, dos clasificaciones) o **corre dos veces** en grupos distintos
   (dos dorsales)? Esto cambia `entries` y la UI de inscripción.
2. **Pago de inscripción**: ¿efectivo/transferencia el día de la carrera
   (admin confirma), o pago en línea (Stripe / Mercado Pago)? Afecta el flujo
   de inscripción y si hay integración externa.
3. **Sistema de puntos**: ¿cuál es la tabla exacta? ¿Se descartan las peores
   carreras? ¿Hay puntos por asistencia o por meta volante?
4. **Precisión requerida**: ¿décimas de segundo o el segundo entero es suficiente?
   Con captura manual, lo honesto es **el segundo entero**; prometer décimas
   invita a disputas que no se pueden sostener.
5. **Cuántos jueces** hay en meta típicamente, y cuántos corredores por carrera.
   Define si el modo multi-juez es imprescindible o un extra.
6. ¿Hay **carreras por etapas** (varios días, tiempo acumulado) o cada carrera
   es independiente?

---

## 8. Asunciones mientras no haya respuesta

- Elite = una sola salida, dos clasificaciones (opción 1 de §7.1).
- Pago fuera de línea, confirmado por el admin. Sin pasarela en etapa 1.
- Precisión al segundo entero.
- Carreras independientes, sin clasificación por etapas.
- Idioma: español. Zona horaria: `America/Mexico_City`,
  pero **todo se guarda en UTC** en la BD.
