"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, ChevronDown, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { borrarVenta } from "@/lib/actions";
import type { VentaConItems, MetodoPago } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

// ─── Colores por método de pago ───────────────────────────────
const METODO_COLOR: Record<MetodoPago, string> = {
  Efectivo: "#4ADE80",
  Transferencia: "#60A5FA",
  Tarjeta: "#A78BFA",
  MercadoPago: "#3B82F6",
  Crypto: "#F59E0B",
};

interface VentasTableProps {
  ventas: VentaConItems[];
  moneda: "ARS" | "USD";
  dolarBlue: number;
  onVentaBorrada: () => void;
  onEditarVenta: (venta: VentaConItems) => void;
}

export function VentasTable({
  ventas,
  moneda,
  dolarBlue,
  onVentaBorrada,
  onEditarVenta,
}: VentasTableProps) {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function formatValue(n: number) {
    const v = moneda === "USD" ? n / dolarBlue : n;
    if (moneda === "USD")
      return `USD ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${v.toLocaleString("es-AR")}`;
  }

  function handleBorrar(ventaId: string) {
    if (!confirm("¿Borrar esta venta? El stock será revertido automáticamente.")) return;
    setDeletingId(ventaId);
    startTransition(async () => {
      const res = await borrarVenta(ventaId);
      setDeletingId(null);
      if (res.ok) {
        toast(
          "success",
          `Venta eliminada. Stock revertido: ${res.itemsRevertidos} variante${res.itemsRevertidos !== 1 ? "s" : ""}.`
        );
        onVentaBorrada();
      } else {
        toast("error", res.error ?? "Error al borrar la venta.");
      }
    });
  }

  // --- Lógica del Sparkline ---
  const sparklinePoints = ventas.length > 1 ? [...ventas].reverse().map(v => v.total_venta) : [];
  const maxVal = Math.max(...sparklinePoints, 1);
  const minVal = Math.min(...sparklinePoints, 0);
  const range = maxVal - minVal;
  
  const pathData = sparklinePoints.length > 1
    ? sparklinePoints.map((val, i) => {
        const x = (i / (sparklinePoints.length - 1)) * 100;
        const y = 80 - ((val - minVal) / range) * 60; // 80 is bottom, 20 is top (approx)
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ")
    : "";

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: "var(--color-muted-foreground)" }}>
        <ShoppingBag className="w-8 h-8 opacity-30" />
        <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] opacity-40">Sin ventas en este período</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Sparkline Trend */}
      {pathData && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] z-0 overflow-hidden px-4 py-8">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
             <path
               d={pathData}
               fill="none"
               stroke="white"
               strokeWidth="0.5"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
           </svg>
        </div>
      )}

      <div className="flex flex-col gap-1 relative z-10">
        {ventas.map((venta, idx) => {
          const isExpanded = expandedId === venta.id;
          const isDeleting = deletingId === venta.id;

          return (
            <motion.div
              key={venta.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              style={{
                border: "1px solid rgba(39, 39, 42, 0.5)",
                background: isExpanded ? "rgba(24, 24, 27, 0.6)" : "rgba(9, 9, 11, 0.3)",
                opacity: isDeleting ? 0.4 : 1,
                transition: "opacity 0.2s, background 0.2s",
              }}
              className="hover:border-zinc-700 transition-colors group/row backdrop-blur-sm"
            >
              {/* Row principal */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : venta.id)}
                  className="shrink-0 transition-transform group-hover/row:scale-110"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                  }
                </button>

                {/* Fecha */}
                <p className="text-[10px] font-mono font-bold tabular-nums w-20 shrink-0 text-zinc-500">
                  {venta.fecha}
                </p>

                {/* Método de pago */}
                <span
                  className="text-[9px] font-mono font-black uppercase tracking-[0.1em] px-2 py-0.5 shrink-0"
                  style={{
                    background: `${METODO_COLOR[venta.metodo_pago]}15`,
                    color: METODO_COLOR[venta.metodo_pago],
                    border: `1px solid ${METODO_COLOR[venta.metodo_pago]}25`,
                  }}
                >
                  {venta.metodo_pago}
                </span>

                {/* Origen */}
                <span
                  className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 shrink-0 hidden sm:inline border border-zinc-800 text-zinc-600 bg-zinc-900/40"
                >
                  {venta.origen}
                </span>

                <div className="flex-1" />

                {/* Monto */}
                <p className="text-sm font-mono font-black tabular-nums shrink-0 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                  {formatValue(venta.total_venta)}
                </p>

                {/* Ganancia bruta */}
                <p
                  className="text-[10px] font-mono font-black tabular-nums shrink-0 hidden sm:block w-24 text-right"
                  style={{ 
                    color: venta.ganancia_bruta >= 0 ? "#4ADE80" : "#FF4444",
                    opacity: 0.8
                  }}
                >
                  {venta.ganancia_bruta >= 0 ? "+" : ""}{formatValue(venta.ganancia_bruta)}
                </p>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button
                    onClick={() => onEditarVenta(venta)}
                    disabled={isPending}
                    className="p-1.5 transition-all hover:bg-white/5 hover:text-white"
                    style={{ color: "var(--color-muted-foreground)" }}
                    title="Editar venta"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBorrar(venta.id)}
                    disabled={isPending}
                    className="p-1.5 transition-all hover:bg-red-500/10 hover:text-red-500"
                    style={{ color: "rgba(239, 68, 68, 0.4)" }}
                    title="Borrar venta"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Detalle expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-12 pb-4 flex flex-col gap-2 bg-black/40 border-t border-zinc-900"
                    >
                      {venta.customer_info && (
                        <>
                          <div className="flex items-center gap-2 mt-4 mb-3">
                             <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                             <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-green-500">
                               Detalles del Cliente (Web)
                             </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/50 p-4 border border-green-500/20 mb-4 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-green-500/5">
                              <ShoppingBag className="w-24 h-24" />
                            </div>
                            <div className="flex flex-col gap-2 relative z-10">
                              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Contacto</p>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white capitalize">{venta.customer_info.name}</span>
                                <span className="text-[11px] font-mono text-zinc-300">{venta.customer_info.email}</span>
                                <span className="text-[11px] font-mono text-zinc-300">Tel: {venta.customer_info.phone}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 relative z-10">
                              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Envío / Retiro</p>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white bg-green-500/10 px-2 py-0.5 border border-green-500/20 w-fit">{venta.customer_info.shipping_method}</span>
                                <span className="text-[11px] font-mono text-zinc-300 mt-1">{venta.customer_info.shipping_address}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-2 mt-3 mb-2">
                         <div className="w-1.5 h-1.5 bg-zinc-700" />
                         <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-500">
                           Desglose de Ítems
                         </p>
                      </div>
                      
                      {venta.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between group/item">
                          <p className="text-[11px] font-mono text-zinc-300">
                            <span className="text-zinc-600 mr-2">/</span>
                            {item.nombre_producto}
                            <span className="ml-3 font-bold text-zinc-500 uppercase">
                              [{item.talle}] × {item.cantidad}
                            </span>
                          </p>
                          <p className="text-[11px] font-mono font-black text-white px-2 py-0.5 border border-transparent group-hover/item:border-zinc-800 transition-colors">
                            {formatValue(item.precio_unitario * item.cantidad)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
