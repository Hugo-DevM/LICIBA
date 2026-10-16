import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Sube un archivo recibido en un Server Action (File de FormData) a
// Cloudinary y regresa su URL pública. Nunca expone el API secret al
// cliente — la subida siempre corre en el servidor.
export async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error || !result) reject(error ?? new Error("Cloudinary no regresó resultado."));
      else resolve(result);
    });
    stream.end(buffer);
  });

  return result.secure_url;
}
