"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { Categoria, CategoriaId } from "@/lib/domain/types";
import type { RiderProfile } from "@/lib/domain/profile";
import { submitInscripcion, type DorsalAsignado } from "@/lib/domain/inscripcion-actions";
import { PAGOS, PAGOS_LISTA, type PagoId } from "@/lib/domain/payment-info";
import { CATS_MENORES, CATS_SOLO_VARONIL, CATS_SOLO_FEMENIL } from "@/lib/domain/category-rules";
import { profileToForm, type InscripcionForm } from "./types";
import { FormField, type Field } from "./form-field";

const STEP_LABELS = ["Corredor", "Categoría", "Emergencia", "Pago"];
const STEP_TITLES: [string, string][] = [
  ["Datos del corredor", "En el siguiente paso eliges tu categoría."],
  ["Categoría", "Elige en qué categoría corres y, si quieres, también en Elite."],
  ["Emergencia y salud", "Obligatorio para correr. Se comparte solo con paramédicos."],
  ["Pago y reglamento", "Tu lugar se aparta 48 h mientras se confirma el pago."],
];

function edadTxt(k: { edadMin: number | null; edadMax: number | null }) {
  if (k.edadMin === null) return "Libre";
  if (k.edadMax === null) return `${k.edadMin}+ años`;
  return `${k.edadMin}-${k.edadMax} años`;
}

function motivoNoElegible(k: Categoria, edad: number | null, sexo: string): string | null {
  if (CATS_SOLO_VARONIL.includes(k.id) && sexo !== "Varonil") return "Solo rama Varonil";
  if (CATS_SOLO_FEMENIL.includes(k.id) && sexo !== "Femenil") return "Solo rama Femenil";
  if (edad !== null) {
    if (k.edadMin !== null && edad < k.edadMin) return `Necesitas ${edadTxt(k)}`;
    if (k.edadMax !== null && edad > k.edadMax) return `Necesitas ${edadTxt(k)}`;
  }
  return null;
}

export function InscripcionWizard({
  raceSlug,
  initialProfile,
  isLoggedIn,
}: {
  raceSlug: string;
  initialProfile: RiderProfile | null;
  isLoggedIn: boolean;
}) {
  const { CLUBS, carrera, cat: getCat, decorar } = useLeagueData();
  const c = decorar(carrera(raceSlug));

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState<InscripcionForm>(() => profileToForm(initialProfile));
  const [catId, setCatId] = useState<CategoriaId | null>(null);
  const [elite, setElite] = useState(false);
  const [pago, setPago] = useState<PagoId>("oxxo");
  const [reg, setReg] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, formAction, pending] = useActionState(submitInscripcion, null);
  const [dorsalTab, setDorsalTab] = useState(0);

  const submitError = result && !result.ok ? result.error : null;
  const folio = result?.ok ? result.folio : null;
  const dorsales: DorsalAsignado[] = result?.ok ? result.dorsales : [];

  const set = (k: keyof InscripcionForm) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const edad = f.nac ? c.temporada - Number(f.nac.slice(0, 4)) : null;
  const catSel: CategoriaId | null =
    catId && !motivoNoElegible(getCat(catId), edad, f.sexo) ? catId : null;

  const fieldsByStep: Field[][] = [
    [
      { kind: "input", fieldKey: "nombre", label: "Nombre(s)", value: f.nombre, onChange: set("nombre"), placeholder: "Mariana" },
      { kind: "input", fieldKey: "apellidos", label: "Apellidos", value: f.apellidos, onChange: set("apellidos"), placeholder: "Curiel Robles" },
      { kind: "input", fieldKey: "nac", label: "Fecha de nacimiento", value: f.nac, onChange: set("nac"), type: "date" },
      { kind: "select", fieldKey: "sexo", label: "Rama", value: f.sexo, onChange: set("sexo"), options: ["Varonil", "Femenil"] },
      { kind: "input", fieldKey: "email", label: "Correo electrónico", value: f.email, onChange: set("email"), type: "email", placeholder: "tu@correo.com" },
      { kind: "input", fieldKey: "tel", label: "Celular (WhatsApp)", value: f.tel, onChange: set("tel"), type: "tel", placeholder: "322 123 4567" },
      { kind: "select", fieldKey: "club", label: "Club / equipo", value: f.club, onChange: set("club"), options: CLUBS },
      { kind: "select", fieldKey: "talla", label: "Talla de playera", value: f.talla, onChange: set("talla"), options: ["XS", "S", "M", "L", "XL", "XXL"] },
    ],
    [],
    [
      { kind: "input", fieldKey: "eNombre", label: "Contacto de emergencia", value: f.eNombre, onChange: set("eNombre"), placeholder: "Nombre completo" },
      { kind: "input", fieldKey: "eRel", label: "Parentesco", value: f.eRel, onChange: set("eRel"), placeholder: "Esposa, padre…" },
      { kind: "input", fieldKey: "eTel", label: "Teléfono de emergencia", value: f.eTel, onChange: set("eTel"), type: "tel", placeholder: "322 000 0000" },
      { kind: "select", fieldKey: "sangre", label: "Tipo de sangre", value: f.sangre, onChange: set("sangre"), options: ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−", "No sé"] },
      { kind: "area", fieldKey: "salud", label: "Alergias, medicamentos o condiciones", value: f.salud, onChange: set("salud"), full: true, placeholder: "Opcional. Solo lo verá el equipo médico." },
    ],
    [],
  ];

  const valid = [
    !!(f.nombre && f.apellidos && f.nac && f.email && f.tel),
    !!catSel,
    !!(f.eNombre && f.eTel),
    reg,
  ][step];

  const eliteTargetId: CategoriaId = f.sexo === "Femenil" ? "elite_femenil" : "elite_varonil";
  const esMenor = catSel ? CATS_MENORES.includes(catSel) : false;
  const eliteDis = !catSel || catSel === eliteTargetId || esMenor || !c.cats.includes(eliteTargetId);
  const eliteOn = elite && !eliteDis;

  const lines = [
    { k: "Categoría", v: catSel ? getCat(catSel).nombre : "—" },
    { k: esMenor ? "Cuota infantil/juvenil" : "Cuota general", v: `$${esMenor ? c.cuota - 250 : c.cuota}` },
    ...(eliteOn ? [{ k: `+ ${getCat(eliteTargetId).nombre}`, v: "$200" }] : []),
    { k: "Licencia anual", v: "$350" },
  ];
  const total = (esMenor ? c.cuota - 250 : c.cuota) + (eliteOn ? 200 : 0) + 350;
  const totalTxt = `$${total.toLocaleString("es-MX")} MXN`;

  const ref = PAGOS[pago].referencia;

  useEffect(() => {
    if (result?.ok) {
      setDorsalTab(0);
      setDone(true);
      window.scrollTo(0, 0);
    }
  }, [result]);

  const advance = () => {
    if (!valid || step >= 3) return;
    setStep(step + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => {
    setDone(false);
    setStep(0);
    setCatId(null);
    setElite(false);
    setReg(false);
    setCopied(false);
    setDorsalTab(0);
    setF(profileToForm(initialProfile));
  };
  const copiar = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(ref);
    setCopied(true);
  };

  if (done) {
    const pagoTitulo = PAGOS[pago].titulo;
    const pagoInstr = PAGOS[pago].instrucciones(total);
    const apartado = "por 48 horas mientras confirmamos tu pago";

    return (
      <section className="mx-auto flex max-w-[880px] flex-col gap-6 px-5 pb-20 pt-10">
        <div className="relative flex flex-col gap-3.5 overflow-hidden bg-liciba-green p-6 text-white md:p-10">
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#CFE7D8]">Folio {folio ?? "—"}</span>
          <h1 className="m-0 font-sans text-[48px] italic font-extrabold uppercase leading-[0.86] md:text-[80px]">
            ¡Estás dentro, {f.nombre || "corredor"}!
          </h1>
          <p className="m-0 max-w-[540px] text-[17px] leading-relaxed text-[#E3F0E8]">
            Te enviamos la confirmación a <strong>{f.email || "tu correo"}</strong>. Tu lugar queda apartado {apartado}.
          </p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))" }}>
          <div className="flex flex-col items-center gap-2.5 border border-liciba-border bg-white p-5 text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
              {dorsales.length > 1 ? "Tus dorsales" : "Tu dorsal"}
            </span>

            {dorsales.length > 1 && (
              <div className="flex border-2 border-liciba-ink">
                {dorsales.map((d, i) => (
                  <button
                    key={d.dorsal}
                    onClick={() => setDorsalTab(i)}
                    className="min-h-9 cursor-pointer whitespace-nowrap border-0 px-3 font-display text-xs font-bold uppercase tracking-wide"
                    style={{ background: dorsalTab === i ? "#13201B" : "#fff", color: dorsalTab === i ? "#fff" : "#13201B" }}
                  >
                    {d.categoria}
                  </button>
                ))}
              </div>
            )}

            <div className="flex aspect-[4/3] w-full max-w-[220px] flex-col items-center justify-center gap-1.5 border-[3px] border-liciba-ink bg-[#FAF9F6]">
              <span className="font-sans text-5xl italic font-extrabold text-liciba-ink">
                {dorsales[dorsalTab]?.dorsal ?? "—"}
              </span>
              <span className="font-display text-[13px] font-bold uppercase tracking-wide text-[#1E6B43] bg-[#E1F0E6] px-2 py-1.5">
                Asignado
              </span>
            </div>
            <span className="text-sm leading-snug text-liciba-muted">
              {dorsales[dorsalTab]?.categoria}
              {dorsales.length > 1 ? " · puntúa doble (tu categoría + Elite)." : ""} Recógelo con tu INE en el kit de
              corredor.
            </span>
          </div>
          <div className="flex flex-col gap-2.5 border border-liciba-border bg-white p-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Resumen</span>
            <div className="font-sans text-[26px] italic font-extrabold uppercase leading-[0.95]">{c.nombre}</div>
            <div className="text-sm text-liciba-muted">{c.fechaLarga}</div>
            {lines.map((l) => (
              <div key={l.k} className="flex justify-between gap-2.5 border-t border-liciba-border-soft pt-2 text-sm">
                <span className="text-liciba-muted">{l.k}</span>
                <span className="font-mono text-sm font-medium">{l.v}</span>
              </div>
            ))}
            <div className="flex justify-between border-t-2 border-liciba-ink pt-2.5">
              <span className="font-display text-[17px] font-extrabold uppercase">Total</span>
              <span className="font-mono text-[17px] font-semibold">{totalTxt}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[18px] bg-liciba-ink p-5 text-white">
          <div className="flex flex-1 basis-[260px] flex-col gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-amber">{pagoTitulo}</span>
            <span className="break-all font-mono text-2xl font-semibold tracking-wide md:text-[30px]">{ref}</span>
            <span className="text-sm text-liciba-muted-dark">{pagoInstr}</span>
          </div>
          <button
            onClick={copiar}
            className="min-h-12 cursor-pointer border-2 border-white bg-transparent px-[18px] font-display text-base font-extrabold uppercase tracking-wide text-white"
          >
            {copied ? "Copiado ✓" : "Copiar referencia"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={c.href}
            className="inline-flex min-h-[52px] items-center bg-liciba-orange px-[22px] font-display text-lg font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            Ver lista de inscritos
          </Link>
          <button
            onClick={restart}
            className="min-h-[52px] cursor-pointer border-2 border-liciba-ink bg-white px-[22px] font-display text-lg font-extrabold uppercase tracking-wide"
          >
            Inscribir a otra persona
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 pb-[72px] pt-8">
      <div className="flex flex-col gap-2">
        <Link href={c.href} className="font-mono text-xs font-semibold uppercase tracking-wide">
          ← {c.nombre}
        </Link>
        <h1 className="m-0 font-sans text-[44px] italic font-extrabold uppercase leading-[0.88] md:text-[76px]">
          Inscripción
        </h1>
      </div>

      <ol className="m-0 grid list-none grid-cols-4 gap-1 p-0">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-col gap-1.5">
            <span className="block h-1.5" style={{ background: i < step ? "#1E6B43" : i === step ? "#F2661C" : "#E2E0D8" }} />
            <button
              onClick={() => i < step && setStep(i)}
              className="flex items-baseline gap-1.5 border-0 bg-transparent p-0 text-left"
              style={{ cursor: i < step ? "pointer" : "default", color: i <= step ? "#13201B" : "#8A968F" }}
            >
              <span className="font-mono text-[11px]">0{i + 1}</span>
              <span className="font-display text-[15px] font-bold uppercase tracking-wide">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {!isLoggedIn && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-[#E7EEE8] px-4 py-3 text-sm text-[#2E3B35]">
          <span>
            Vas a inscribirte como invitado: llena tus datos y listo, sin crear cuenta.
          </span>
          <span className="text-liciba-muted">
            ¿Vas a correr seguido?{" "}
            <Link href={`/cuenta/login?next=/inscripcion/${raceSlug}`} className="font-semibold text-liciba-ink underline">
              Inicia sesión
            </Link>{" "}
            o{" "}
            <Link href={`/cuenta/registro?next=/inscripcion/${raceSlug}`} className="font-semibold text-liciba-ink underline">
              crea tu cuenta
            </Link>{" "}
            para no volver a escribir tus datos.
          </span>
        </div>
      )}

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={formAction} className="flex min-w-0 flex-col gap-[22px] border border-liciba-border bg-white p-[18px] md:p-8">
          <input type="hidden" name="raceSlug" value={raceSlug} />
          <input type="hidden" name="nombre" value={f.nombre} />
          <input type="hidden" name="apellidos" value={f.apellidos} />
          <input type="hidden" name="nac" value={f.nac} />
          <input type="hidden" name="sexo" value={f.sexo} />
          <input type="hidden" name="email" value={f.email} />
          <input type="hidden" name="tel" value={f.tel} />
          <input type="hidden" name="club" value={f.club} />
          <input type="hidden" name="talla" value={f.talla} />
          <input type="hidden" name="categoryCode" value={catSel ?? ""} />
          <input type="hidden" name="elite" value={eliteOn ? "true" : "false"} />
          <input type="hidden" name="eNombre" value={f.eNombre} />
          <input type="hidden" name="eRel" value={f.eRel} />
          <input type="hidden" name="eTel" value={f.eTel} />
          <input type="hidden" name="sangre" value={f.sangre} />
          <input type="hidden" name="salud" value={f.salud} />
          <input type="hidden" name="pago" value={pago} />

          <div>
            <h2 className="m-0 font-sans text-[32px] italic font-extrabold uppercase leading-none">{STEP_TITLES[step][0]}</h2>
            <p className="mt-1.5 mb-0 text-[15px] text-liciba-muted">{STEP_TITLES[step][1]}</p>
          </div>

          {fieldsByStep[step].length > 0 && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))" }}>
              {fieldsByStep[step].map((field) => (
                <FormField key={field.fieldKey} {...field} />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
                Categoría en la que corres
              </span>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,200px),1fr))" }}>
                {c.catsB.map((k) => {
                  const motivo = motivoNoElegible(k, edad, f.sexo);
                  const elegible = !motivo;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => elegible && setCatId(k.id)}
                      disabled={!elegible}
                      title={motivo ?? undefined}
                      className="flex min-h-[52px] items-center gap-2.5 bg-white px-3.5 text-left font-sans text-[15px] font-semibold text-liciba-ink"
                      style={{
                        border: `2px solid ${k.id === catSel ? "#13201B" : "#E2E0D8"}`,
                        opacity: elegible ? 1 : 0.45,
                        cursor: elegible ? "pointer" : "not-allowed",
                      }}
                    >
                      <span className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 border-liciba-ink">
                        <span className="h-2 w-2 rounded-full" style={{ background: k.id === catSel ? "#F2661C" : "transparent" }} />
                      </span>
                      <span className="h-2.5 w-2.5 flex-none" style={{ background: k.color }} />
                      <span className="flex min-w-0 flex-col leading-tight">
                        {k.nombre}
                        <span className="font-mono text-[11px] font-normal text-liciba-muted">
                          {motivo ?? edadTxt(k)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setElite((v) => !v)}
                disabled={eliteDis}
                className="flex items-start gap-3.5 p-4 text-left"
                style={{
                  border: `2px solid ${eliteOn ? "#13201B" : "#E2E0D8"}`,
                  background: eliteOn ? "#FFF8EE" : "#fff",
                  cursor: eliteDis ? "default" : "pointer",
                  opacity: eliteDis ? 0.5 : 1,
                }}
              >
                <span
                  className="flex h-6 w-6 flex-none items-center justify-center border-2 border-liciba-ink font-sans text-sm font-bold text-white"
                  style={{ background: eliteOn ? "#13201B" : "#fff" }}
                >
                  {eliteOn ? "✓" : ""}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-lg font-extrabold uppercase text-liciba-ink">
                    Correr también en {getCat(eliteTargetId).nombre} · +$200
                  </span>
                  <span className="text-sm leading-snug text-liciba-muted">
                    Sales con el grupo {getCat(eliteTargetId).nombre} y puntúas en ambos rankings: tu categoría y Elite
                    (puntos dobles).{" "}
                    {esMenor
                      ? "No disponible para categorías infantiles/juveniles."
                      : catSel === eliteTargetId
                        ? "Ya corres en Elite."
                        : ""}
                  </span>
                </span>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
                Método de pago
              </span>
              {PAGOS_LISTA.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPago(p.id)}
                  className="flex min-h-[64px] items-center gap-3.5 bg-white px-4 py-3.5 text-left"
                  style={{ border: `2px solid ${pago === p.id ? "#13201B" : "#D6D3CA"}` }}
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-liciba-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: pago === p.id ? "#F2661C" : "transparent" }} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-extrabold uppercase leading-tight text-liciba-ink">{p.nombre}</span>
                    <span className="mt-0.5 block text-sm text-liciba-muted">{p.descripcion}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReg((v) => !v)}
                className="mt-1.5 flex items-start gap-3.5 bg-white p-4 text-left"
                style={{ border: `2px solid ${reg ? "#13201B" : "#E2E0D8"}` }}
              >
                <span
                  className="flex h-6 w-6 flex-none items-center justify-center border-2 border-liciba-ink font-sans text-sm font-bold text-white"
                  style={{ background: reg ? "#13201B" : "#fff" }}
                >
                  {reg ? "✓" : ""}
                </span>
                <span className="text-[15px] leading-snug text-liciba-ink">
                  He leído y acepto el <a href="#" className="font-bold">reglamento de la liga</a> y la carta responsiva.
                  Uso de casco obligatorio; menores de 18 requieren firma del tutor.
                </span>
              </button>
            </div>
          )}

          {submitError && (
            <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{submitError}</div>
          )}

          <div className="flex justify-between gap-2.5 border-t border-liciba-border-soft pt-[18px]">
            <button
              type="button"
              onClick={back}
              className="min-h-[52px] cursor-pointer border-2 border-liciba-ink bg-white px-5 font-display text-[17px] font-extrabold uppercase tracking-wide"
              style={{ visibility: step ? "visible" : "hidden" }}
            >
              ← Atrás
            </button>
            <button
              type={step === 3 ? "submit" : "button"}
              onClick={step === 3 ? undefined : advance}
              disabled={!valid || pending}
              className="max-w-[320px] flex-1 min-h-[52px] px-5 font-display text-[19px] font-extrabold uppercase tracking-wide"
              style={{
                background: valid && !pending ? "#F2661C" : "#ECEAE3",
                color: valid && !pending ? "#13201B" : "#8A968F",
                cursor: valid && !pending ? "pointer" : "default",
                border: 0,
              }}
            >
              {pending ? "Enviando…" : step === 3 ? "Confirmar inscripción" : "Continuar →"}
            </button>
          </div>
        </form>

        <aside className="static flex flex-col bg-liciba-ink text-white lg:sticky lg:top-[90px]">
          <div className="flex h-[5px]">
            <div className="flex-[3] bg-liciba-green" />
            <div className="flex-[2] bg-liciba-blue" />
            <div className="flex-1 bg-liciba-orange" />
          </div>
          <div className="flex flex-col gap-3.5 p-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-amber">Resumen</span>
            <div>
              <div className="font-sans text-[26px] italic font-extrabold uppercase leading-[0.95]">{c.nombre}</div>
              <div className="mt-1.5 text-sm text-liciba-muted-dark">
                {c.fechaTxt} · {c.sede}
              </div>
            </div>
            {lines.map((l) => (
              <div key={l.k} className="flex justify-between gap-2.5 border-t border-white/10 pt-2.5 text-sm">
                <span className="text-[#C9D1CC]">{l.k}</span>
                <span className="font-mono text-sm font-medium">{l.v}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t-2 border-liciba-orange pt-3">
              <span className="font-display text-lg font-extrabold uppercase">Total</span>
              <span className="font-sans text-[34px] italic font-extrabold text-liciba-amber">{totalTxt}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
