import { redirect } from "next/navigation";
import { getLeagueData } from "@/lib/domain/queries";

export default async function InscripcionIndex() {
  const data = await getLeagueData();
  const open = data.races.filter((x) => x.estado === "abierta");
  if (open.length === 0) redirect("/carreras");
  redirect(`/inscripcion/${open[0].slug}`);
}
