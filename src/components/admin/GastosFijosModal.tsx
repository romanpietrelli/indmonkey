"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import {
  crearGastoFijo,
  getGastosFijos,
  eliminarGastoFijo,
} from "@/lib/actions";
import type { GastoFijo, GastoFijoPayload, CategoriaGasto, Moneda } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

const CATEGORIAS: CategoriaGasto[] = [
  "Alquiler",
  "Servicios",
  "Internet",
  "Sueldos",
  "Impuestos",
  "Otros",
];

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface GastosFijosModalProps {
  open: boolean;
  onClose: () => void;
  dateFrom: string;
  dateTo: string;
  onGastoCreado?: () => void;
}

const EMPTY_FORM: GastoFijoPayload = {
  categoria: "Alquiler",
  monto: 0,
  moneda: "ARS",
  fecha_gasto: getToday(),
  descripcion: "",
  recurrente: false,
  dia_recurrencia: 1,
};

export function GastosFijosModal({
  open,
  onClose,
  dateFrom,
  dateTo,
  onGastoCreado,
}: GastosFijosModalProps) {
  const { toast } = useToast();
  const [gastos, setGastos] = useState<GastoFijo[]>([]);
  const [form, setForm] = useState<GastoFijoPayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingGastos, setLoadingGastos] = useState(false);

  function refreshGastos() {
    setLoadingGastos(true);
    getGastosFijos(dateFrom, dateTo).then((data) => {
      setGastos(data as GastoFijo[]);
      setLoadingGastos(false);
    });
  }

  useEffect(() => {
    if (open) {
      refreshGastos();
      setForm({ ...EMPTY_FORM, fecha_gasto: getToday() });
      setShowForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateFrom, dateTo]);

  function set<K extends keyof GastoFijoPayload>(key: K, value: GastoFijoPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.monto || form.monto <= 0) {
      toast("error", "El monto debe ser mayor a 0.");
      return;
    }
    startTransition(async () => {
      const res = await crearGastoFijo(form);
      if (res.ok) {
        toast("success", "Gasto registrado correctamente.");
        setForm({ ...EMPTY_FORM, fecha_gasto: getToday() });
        setShowForm(false);
        refreshGastos();
        onGastoCreado?.();
      } else {
        toast("error", res.error ?? "Error al guardar gasto.");
      }
    });
  }

  function handleEliminar(id: string) {
    startTransition(async () => {
      const res = await eliminarGastoFijo(id);
      if (res.ok) {
        toast("success", "Gasto eliminado.");
        refreshGastos();
        onGastoCreado?.();
      } else {
        toast("error", res.error ?? "Error al eliminar.");
      }
    });
  }

  function formatARS(n: number, moneda: Moneda) {
    if (moneda === "USD") return `USD ${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    return `$${n.toLocaleString("es-AR")}`;
  }

  const totalARS = gastos.reduce((acc, g) => {
    return acc + (g.moneda === "USD" ? g.monto * 1050 : g.monto);
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="gasto-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            key="gasto-modal"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: "var(--color-background)", borderLeft: "1px solid var(--color-border)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                  Administración
                </p>
                <h2 className="text-lg font-black uppercase" style={{ letterSpacing: "-0.02em" }}>
                  Gastos Fijos
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshGastos}
                  className="p-1.5 transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingGastos ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

              {/* Formulario toggle */}
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{
                  border: "1px dashed var(--color-border)",
                  padding: "10px 16px",
                  color: "var(--color-muted-foreground)",
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                {showForm ? "Cancelar" : "Agregar Gasto"}
              </button>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-4 flex flex-col gap-4"
                      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    >
                      {/* Categoría */}
                      <FormField label="Categoría">
                        <select
                          value={form.categoria}
                          onChange={(e) => set("categoria", e.target.value as CategoriaGasto)}
                          className="w-full px-3 py-2 text-xs font-bold"
                          style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                        >
                          {CATEGORIAS.map((c) => (
                            <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>
                          ))}
                        </select>
                      </FormField>

                      {/* Monto + Moneda */}
                      <div className="flex gap-2">
                        <FormField label="Monto" className="flex-1">
                          <input
                            type="number"
                            min={0}
                            value={form.monto || ""}
                            onChange={(e) => set("monto", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-xs font-bold"
                            style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                          />
                        </FormField>
                        <FormField label="Moneda">
                          <select
                            value={form.moneda}
                            onChange={(e) => set("moneda", e.target.value as Moneda)}
                            className="px-3 py-2 text-xs font-bold"
                            style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                          >
                            <option value="ARS" style={{ background: "#141414" }}>ARS</option>
                            <option value="USD" style={{ background: "#141414" }}>USD</option>
                          </select>
                        </FormField>
                      </div>

                      {/* Fecha */}
                      <FormField label="Fecha">
                        <input
                          type="date"
                          value={form.fecha_gasto}
                          onChange={(e) => set("fecha_gasto", e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold"
                          style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)", colorScheme: "dark" }}
                        />
                      </FormField>

                      {/* Descripción */}
                      <FormField label="Descripción (opcional)">
                        <input
                          type="text"
                          value={form.descripcion}
                          onChange={(e) => set("descripcion", e.target.value)}
                          placeholder="Ej: Factura Edesur Marzo"
                          className="w-full px-3 py-2 text-xs font-bold"
                          style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                        />
                      </FormField>

                      {/* Recurrente */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="recurrente"
                          checked={form.recurrente}
                          onChange={(e) => set("recurrente", e.target.checked)}
                          className="w-4 h-4 accent-white"
                        />
                        <label htmlFor="recurrente" className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-foreground)" }}>
                          ¿Es gasto recurrente?
                        </label>
                      </div>

                      {form.recurrente && (
                        <FormField label="Día del mes">
                          <select
                            value={form.dia_recurrencia ?? 1}
                            onChange={(e) => set("dia_recurrencia", parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-xs font-bold"
                            style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                          >
                            {DIAS.map((d) => (
                              <option key={d} value={d} style={{ background: "#141414" }}>Día {d}</option>
                            ))}
                          </select>
                        </FormField>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-black uppercase tracking-widest transition-opacity disabled:opacity-40"
                        style={{ background: "var(--color-foreground)", color: "var(--color-primary-foreground)" }}
                      >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Guardar Gasto
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Total */}
              <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                  Total ARS (período)
                </span>
                <span className="text-sm font-black tabular-nums">
                  ${totalARS.toLocaleString("es-AR")}
                </span>
              </div>

              {/* Lista */}
              {loadingGastos ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-muted-foreground)" }} />
                </div>
              ) : gastos.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
                  No hay gastos en este período.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {gastos.map((g) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 group"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-black uppercase tracking-widest px-2 py-0.5"
                            style={{ background: "var(--color-muted)", color: "var(--color-foreground)" }}
                          >
                            {g.categoria}
                          </span>
                          {g.recurrente && (
                            <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>↻</span>
                          )}
                        </div>
                        <p className="text-xs mt-1.5 font-black">{formatARS(g.monto, g.moneda)}</p>
                        {g.descripcion && (
                          <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                            {g.descripcion}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                          {g.fecha_gasto}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEliminar(g.id)}
                        disabled={isPending}
                        className="p-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 disabled:opacity-30"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-muted-foreground)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
