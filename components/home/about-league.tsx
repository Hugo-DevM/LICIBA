import { ImagePlaceholder } from "@/components/image-placeholder";
import { ABOUT_IMAGES } from "@/lib/domain/race-images";

export function AboutLeague() {
  return (
    <section id="liga" className="bg-[#E7EEE8]">
      <div
        className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-[72px]"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))" }}
      >
        <div className="flex flex-col gap-5">
          <div className="font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
            Quiénes somos
          </div>
          <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[68px]">
            LICIBA: hecha por y para la bahía
          </h2>
          <p className="m-0 text-[17px] leading-relaxed text-[#2E3B35]">
            Nacimos en 2014 como un grupo de rodada dominical en el Malecón. Hoy organizamos el
            calendario amateur de ruta y montaña más grande de la costa de Jalisco y Nayarit, con
            jueces certificados, cronometraje por chip y seguro para cada corredor.
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            <div className="bg-white p-[18px]">
              <div className="mb-2 font-display text-lg font-extrabold uppercase tracking-wide text-liciba-blue">
                Misión
              </div>
              <p className="m-0 text-[15px] leading-normal text-[#2E3B35]">
                Competencias seguras, bien organizadas y accesibles para cualquier ciclista de la
                región, desde juveniles hasta master 50+.
              </p>
            </div>
            <div className="bg-white p-[18px]">
              <div className="mb-2 font-display text-lg font-extrabold uppercase tracking-wide text-liciba-blue">
                Comunidad
              </div>
              <p className="m-0 text-[15px] leading-normal text-[#2E3B35]">
                Clubes, familias y voluntarios que cierran calles, dan agua y gritan en cada
                subida. Sin ellos no hay carrera.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2" style={{ gridTemplateRows: "200px 200px" }}>
          <ImagePlaceholder
            label="Comunidad · podio / familias"
            src={ABOUT_IMAGES.comunidad}
            sizes="(min-width: 1024px) 190px, 45vw"
            className="relative row-span-2"
          />
          <ImagePlaceholder
            label="Voluntarios en avituallamiento"
            src={ABOUT_IMAGES.voluntarios}
            sizes="(min-width: 1024px) 190px, 45vw"
            className="relative"
          />
          <ImagePlaceholder
            label="Rodada de club al amanecer"
            src={ABOUT_IMAGES.clubDawn}
            sizes="(min-width: 1024px) 190px, 45vw"
            className="relative"
          />
        </div>
      </div>
    </section>
  );
}
