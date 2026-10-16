// Fotos de stock (Unsplash, licencia libre) usadas como referencia visual mientras
// la liga no tiene banco de fotos propio. Reemplazar por fotos reales de cada carrera.
export const RACE_IMAGES: Record<string, string> = {
  "subida-el-tuito": "/images/race-climb.jpg",
  "criterium-malecon": "/images/race-night-criterium.jpg",
  "mtb-sierra-cuale": "/images/race-mtb-1.jpg",
  "clasica-bahia": "/images/race-sunrise-coastal.jpg",
  "gran-fondo-san-sebastian": "/images/race-group-asphalt.jpg",
  "circuito-marina": "/images/race-water-action.jpg",
  "vuelta-valle": "/images/hero-group-road.jpg",
  "mtb-las-palmas": "/images/race-mtb-2.jpg",
  "criterium-pitillal": "/images/race-group-asphalt.jpg",
  "clasica-bahia-2025": "/images/race-sunrise-coastal.jpg",
  "subida-el-tuito-2025": "/images/race-climb.jpg",
};

export const HERO_IMAGE = "/images/hero-group-road.jpg";
export const RIDER_IMAGE = "/images/rider-closeup.jpg";
export const ABOUT_IMAGES = {
  comunidad: "/images/about-group-bikes.jpg",
  voluntarios: "/images/race-water-action.jpg",
  clubDawn: "/images/about-club-street.jpg",
};

export function raceImage(slug: string): string | undefined {
  return RACE_IMAGES[slug];
}
