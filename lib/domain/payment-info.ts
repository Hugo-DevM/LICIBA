// Referencias reales de pago de la liga (flyer "Reto La Limonera"). Única
// fuente — usada tanto en la confirmación del wizard como en "Mi cuenta".
export type PagoId = "oxxo" | "spei";

export interface PagoInfo {
  id: PagoId;
  titulo: string;
  nombre: string;
  descripcion: string;
  referencia: string;
  instrucciones: (total: number) => string;
}

export const PAGOS: Record<PagoId, PagoInfo> = {
  oxxo: {
    id: "oxxo",
    titulo: "Depósito en OXXO (Spin)",
    nombre: "Depósito en OXXO (Spin)",
    descripcion: "Deposita en efectivo en cualquier OXXO a esta tarjeta Spin.",
    referencia: "2236 4217 4700 5338 · Spin OXXO",
    instrucciones: (total) => `Deposita $${total} en efectivo en cualquier OXXO. Conserva tu ticket.`,
  },
  spei: {
    id: "spei",
    titulo: "Transferencia · Banco Azteca",
    nombre: "Transferencia · Banco Azteca",
    descripcion: "Transferencia o depósito a la cuenta de la liga.",
    referencia: "4027 6658 7165 · Cuenta 5537 · Banco Azteca",
    instrucciones: () => "Banco Azteca · Titular: LICIBA.",
  },
};

export const PAGOS_LISTA = [PAGOS.oxxo, PAGOS.spei];
