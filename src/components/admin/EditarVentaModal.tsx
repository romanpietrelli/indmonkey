"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { editarVenta } from "@/lib/actions";
import type { VentaConItems, MetodoPago } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

const METODOS_PAGO: MetodoPago[] = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "MercadoPago",
  "Crypto",
];

interface EditarVentaModalProps {
  venta: VentaConItems | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditarVentaModal({ venta, onClose, onSuccess }: EditarVentaModalProps) {
  const { toast } = useToast();
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Efectivo");
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  // Sincronizar cuando cambia la venta seleccionada
  const [lastVentaId, setLastVentaId] = useState<string | null>(null);
  if (venta && venta.id !== lastVentaId) {
    setLastVentaId(venta.id);
    setMetodoPago(venta.metodo_pago);
    const cantInit: Record<string, number> = {};
    for (const item of venta.items) cantInit[item.variante_id] = item.cantidad;
    setCantidades(cantInit);
  }

  if (!venta) return null;

  function handleSave() {
    if (!venta) return;
    const items_cantidad = venta.items
      .filter((item) => cantidades[item.variante_id] !== item.cantidad)
      .map((item) => ({
        variante_id: item.variante_id,
        nueva_cantidad: cantidades[item.variante_id] ?? item.cantidad,
        cantidad_anterior: item.cantidad,
      }));

    const metodoCambio = metodoPago !== venta.metodo_pago ? metodoPago : undefined;

    if (!metodoCambio && items_cantidad.length === 0) {
      toast("warning", "No hay cambios que guardar.");
      return;
    }

    startTransition(async () => {
      const res = await editarVenta({
        venta_id: venta.id,
        metodo_pago: metodoCambio,
        items_cantidad: items_cantidad.length > 0 ? items_cantidad : undefined,
      });
      if (res.ok) {
        toast("success", "Venta actualizada correctamente.");
        onSuccess();
        onClose();
      } else {
        toast("error", res.error ?? "Error al editar venta.");
      }
    });
  }

  function formatARS(n: number) {
    return `$${n.toLocaleString("es-AR")}`;
  }

  return (
    <AnimatePresence>
      {venta && (
        <>
          <motion.div
            key="edit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            key="edit-modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed inset-0 z-[51] flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-md"
              style={{ pointerEvents: "all", background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                    Venta #{venta.id.slice(-6).toUpperCase()}
                  </p>
                  <h2 className="text-sm font-black uppercase tracking-tight">Editar Venta</h2>
                </div>
                <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60" style={{ color: "var(--color-muted-foreground)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Método de pago */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-muted-foreground)" }}>
                    Método de Pago
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {METODOS_PAGO.map((mp) => (
                      <button
                        key={mp}
                        onClick={() => setMetodoPago(mp)}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all"
                        style={{
                          border: `1px solid ${metodoPago === mp ? "rgba(255,255,255,0.5)" : "var(--color-border)"}`,
                          background: metodoPago === mp ? "var(--color-muted)" : "transparent",
                          color: metodoPago === mp ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                        }}
                      >
                        {mp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ítems + cantidades */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted-foreground)" }}>
                    Ítems
                  </p>
                  <div className="flex flex-col gap-2">
                    {venta.items.map((item) => {
                      const cant = cantidades[item.variante_id] ?? item.cantidad;
                      return (
                        <div
                          key={item.variante_id}
                          className="flex items-center justify-between p-3"
                          style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase truncate">{item.nombre_producto}</p>
                            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                              Talle {item.talle} · {formatARS(item.precio_unitario)}
                            </p>
                          </div>
                          {/* Cantidad stepper */}
                          <div className="flex items-center gap-2 ml-3 shrink-0">
                            <button
                              onClick={() =>
                                setCantidades((prev) => ({
                                  ...prev,
                                  [item.variante_id]: Math.max(1, (prev[item.variante_id] ?? item.cantidad) - 1),
                                }))
                              }
                              className="w-6 h-6 flex items-center justify-center text-sm font-black border transition-colors hover:bg-white/10"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              −
                            </button>
                            <span
                              className="text-sm font-black tabular-nums w-5 text-center"
                              style={{ color: cant !== item.cantidad ? "#F59E0B" : "var(--color-foreground)" }}
                            >
                              {cant}
                            </span>
                            <button
                              onClick={() =>
                                setCantidades((prev) => ({
                                  ...prev,
                                  [item.variante_id]: (prev[item.variante_id] ?? item.cantidad) + 1,
                                }))
                              }
                              className="w-6 h-6 flex items-center justify-center text-sm font-black border transition-colors hover:bg-white/10"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-black uppercase tracking-widest transition-opacity disabled:opacity-30"
                  style={{ background: "var(--color-foreground)", color: "var(--color-primary-foreground)" }}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
