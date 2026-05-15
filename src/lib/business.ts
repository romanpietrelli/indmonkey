// ============================================================
// LÓGICA FINANCIERA Y DE NEGOCIO - IND MONKEY V2
// ============================================================

import type { GastoFijo, VarianteStock, VentaItem } from "./types";

// ─── Tipo de cambio (por defecto si no hay config en BD) ────
const TIPO_CAMBIO_FALLBACK = 1050;

/**
 * Convierte un monto a ARS usando el tipo de cambio provisto.
 */
export function convertirARS(
  monto: number,
  moneda: "ARS" | "USD",
  tipoCambio: number = TIPO_CAMBIO_FALLBACK
): number {
  return moneda === "USD" ? monto * tipoCambio : monto;
}

/**
 * Ganancia Bruta de un ítem de venta.
 * = (precio_venta - precio_costo_en_ARS) * cantidad
 */
export function calcularGananciaBrutaItem(
  item: VentaItem & {
    variante: VarianteStock;
  },
  tipoCambio: number = TIPO_CAMBIO_FALLBACK
): number {
  const costoARS = convertirARS(
    item.costo_unitario,
    item.variante.moneda_costo,
    tipoCambio
  );
  return (item.precio_unitario - costoARS) * item.cantidad;
}

/**
 * Suma los gastos fijos de un array, convertidos todos a ARS.
 */
export function calcularTotalGastosFijos(
  gastos: GastoFijo[],
  tipoCambio: number = TIPO_CAMBIO_FALLBACK
): number {
  return gastos.reduce((acc, g) => {
    return acc + convertirARS(g.monto, g.moneda, tipoCambio);
  }, 0);
}

/**
 * Ganancia Neta Mensual = Ganancia Bruta Total - Gastos Fijos Totales (en ARS)
 */
export function calcularGananciaNeta(
  gananciaBrutaTotal: number,
  gastos: GastoFijo[],
  tipoCambio: number = TIPO_CAMBIO_FALLBACK
): number {
  const totalGastos = calcularTotalGastosFijos(gastos, tipoCambio);
  return gananciaBrutaTotal - totalGastos;
}

/**
 * Formatea precio en ARS con separadores de miles.
 */
export function formatearPrecio(
  monto: number,
  moneda: "ARS" | "USD" = "ARS"
): string {
  if (moneda === "USD") {
    return `USD ${monto.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${monto.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// ─── Stock ───────────────────────────────────────────────────
export const STOCK_ALERTA_UMBRAL = 2;

/**
 * Retorna true si el stock de una variante es bajo (< umbral).
 */
export function esStockBajo(cantidad: number): boolean {
  return cantidad < STOCK_ALERTA_UMBRAL;
}
