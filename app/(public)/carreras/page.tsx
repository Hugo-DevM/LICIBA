import { Suspense } from "react";
import type { Metadata } from "next";
import { CarrerasClient } from "@/components/carreras/carreras-client";

export const metadata: Metadata = {
  title: "Carreras · LICIBA",
};

export default function CarrerasPage() {
  return (
    <Suspense>
      <CarrerasClient />
    </Suspense>
  );
}
