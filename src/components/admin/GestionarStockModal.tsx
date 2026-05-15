"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, RefreshCw, Save, Loader2, Search, CheckCircle2, Edit3, ChevronDown } from "lucide-react";
import { getAllVariantesStock, actualizarVariante, eliminarProducto } from "@/lib/actions";
import type { VarianteEditable } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";
import { EditarProductoModal } from "./EditarProductoModal";

const STOCK_UMBRAL_ROJO = 0;    // exactamente 0 → rojo
const STOCK_UMBRAL_NARANJA = 4; // < 4 → naranja

function stockColor(cantidad: number): string {
  if (cantidad === 0) return "#FF4444";
  if (cantidad < STOCK_UMBRAL_NARANJA) return "#F59E0B";
  return "hsl(0 0% 98%)";
}

function stockBg(cantidad: number): string {
  if (cantidad === 0) return "rgba(255,68,68,0.08)";
  if (cantidad < STOCK_UMBRAL_NARANJA) return "rgba(245,158,11,0.08)";
  return "transparent";
}

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

interface GestionarStockModalProps {
  open: boolean;
  onClose: () => void;
}

export function GestionarStockModal({ open, onClose }: GestionarStockModalProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<VarianteEditable[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const toggleCat = (cat: string) => {
    setCollapsedCats((prev) => {
      const copy = new Set(prev);
      if (copy.has(cat)) copy.delete(cat);
      else copy.add(cat);
      return copy;
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllVariantesStock();
    setRows(
      data.map((v) => ({
        ...v,
        cantidad_edit: v.cantidad,
        precio_venta_edit: v.precio_venta,
        precio_costo_edit: v.precio_costo,
        dirty: false,
      }))
    );
    setLoading(false);
    setSavedIds(new Set());
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      loadData();
    }
  }, [open, loadData]);

  function updateRow(
    id: string,
    field: "cantidad_edit" | "precio_venta_edit" | "precio_costo_edit",
    value: number
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.id_variante === id
          ? { ...r, [field]: value, dirty: true }
          : r
      )
    );
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // ─ Save single row ──────────────────────────────────────────
  function saveRow(row: VarianteEditable) {
    startTransition(async () => {
      const res = await actualizarVariante(row.id_variante, {
        cantidad: row.cantidad_edit,
        precio_venta: row.precio_venta_edit,
        precio_costo: row.precio_costo_edit,
      });
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.id_variante === row.id_variante
              ? {
                  ...r,
                  cantidad: r.cantidad_edit,
                  precio_venta: r.precio_venta_edit,
                  precio_costo: r.precio_costo_edit,
                  dirty: false,
                }
              : r
          )
        );
        setSavedIds((prev) => new Set([...prev, row.id_variante]));
        setTimeout(() => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(row.id_variante);
            return next;
          });
        }, 2000);
      } else {
        toast("error", res.error ?? "Error al actualizar.");
      }
    });
  }

  // ─ Save all dirty rows ──────────────────────────────────────
  function saveAllDirty() {
    const dirty = rows.filter((r) => r.dirty);
    if (dirty.length === 0) {
      toast("warning", "No hay cambios pendientes.");
      return;
    }
    startTransition(async () => {
      let ok = 0, fail = 0;
      for (const row of dirty) {
        const res = await actualizarVariante(row.id_variante, {
          cantidad: row.cantidad_edit,
          precio_venta: row.precio_venta_edit,
          precio_costo: row.precio_costo_edit,
        });
        if (res.ok) ok++;
        else fail++;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.dirty
            ? {
                ...r,
                cantidad: r.cantidad_edit,
                precio_venta: r.precio_venta_edit,
                precio_costo: r.precio_costo_edit,
                dirty: false,
              }
            : r
        )
      );
      if (fail === 0) toast("success", `${ok} variante${ok !== 1 ? "s" : ""} actualizada${ok !== 1 ? "s" : ""} correctamente.`);
      else toast("warning", `${ok} guardadas, ${fail} con error.`);
    });
  }

  // ─ Delete Product ──────────────────────────────────────────
  function handleDeleteProduct(producto_id: string, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}" y todas sus variantes? Esta acción no se puede deshacer.`)) return;
    
    startTransition(async () => {
      const res = await eliminarProducto(producto_id);
      if (res.ok) {
        toast("success", `Producto "${nombre}" eliminado.`);
        loadData();
      } else {
        toast("error", res.error ?? "Error al eliminar producto.");
      }
    });
  }

  // ─ Filtered rows ────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.producto_nombre.toLowerCase().includes(q) ||
      r.categoria_nombre?.toLowerCase().includes(q) ||
      r.talle.toLowerCase().includes(q)
    );
  });

  const dirtyCount = rows.filter((r) => r.dirty).length;

  // ─ Grouping ────────────────────────────────────────────────
  const groupedData = filtered.reduce((acc, row) => {
    const cat = row.categoria_nombre || "Sin Categoría";
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][row.producto_id]) acc[cat][row.producto_id] = { nombre: row.producto_nombre, variantes: [] };
    acc[cat][row.producto_id].variantes.push(row);
    return acc;
  }, {} as Record<string, Record<string, { nombre: string; variantes: VarianteEditable[] }>>);

  // ─ Number input cell component ──────────────────────────────
  function NumCell({
    value,
    onChange,
    isPrice = false,
  }: {
    value: number;
    onChange: (v: number) => void;
    isPrice?: boolean;
  }) {
    return (
      <input
        type="number"
        min={0}
        step={isPrice ? 100 : 1}
        value={value || ""}
        onChange={(e) => onChange(isPrice ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
        className="w-full px-2 py-1.5 text-xs font-bold tabular-nums text-center"
        style={{
          background: "transparent",
          border: "1px solid hsl(0 0% 16%)",
          color: "hsl(0 0% 90%)",
          width: "100%",
        }}
      />
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="stock-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            key="stock-modal"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
            style={{
              background: "#09090b",
              borderTop: "1px solid hsl(0 0% 18%)",
              maxHeight: "90vh",
            }}
          >
            {/* ─── Header ─────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid hsl(0 0% 14%)" }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 45%)" }}>
                  Inventario
                </p>
                <h2 className="text-lg font-black uppercase" style={{ letterSpacing: "-0.02em" }}>
                  Gestionar Stock
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Save all button */}
                <AnimatePresence>
                  {dirtyCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={saveAllDirty}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-30"
                      style={{ background: "hsl(0 0% 98%)", color: "#09090b" }}
                    >
                      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Guardar {dirtyCount} cambio{dirtyCount !== 1 ? "s" : ""}
                    </motion.button>
                  )}
                </AnimatePresence>
                <button onClick={loadData} className="p-1.5 transition-opacity hover:opacity-60" style={{ color: "hsl(0 0% 45%)" }}>
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={onClose} className="p-1.5 transition-opacity hover:opacity-60" style={{ color: "hsl(0 0% 45%)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── Search bar ─────────────────────────────── */}
            <div className="px-6 py-3 shrink-0" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(0 0% 40%)" }} />
                <input
                  type="search"
                  placeholder="Filtrar por producto o talle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-bold"
                  style={{
                    background: "hsl(0 0% 6%)",
                    border: "1px solid hsl(0 0% 16%)",
                    color: "hsl(0 0% 90%)",
                  }}
                />
              </div>
            </div>

            {/* ─── Table ──────────────────────────────────── */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(0 0% 40%)" }} />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-center py-12" style={{ color: "hsl(0 0% 40%)" }}>
                  {search ? "Sin resultados." : "No hay variantes de stock."}
                </p>
              ) : (
                <div className="flex flex-col pb-12">
                  {Object.entries(groupedData)
                    .sort(([catA], [catB]) => catA.localeCompare(catB))
                    .map(([categoria, productos]) => (
                    <div key={categoria} className="mb-6">
                      <div 
                        onClick={() => toggleCat(categoria)}
                        className="sticky top-0 z-10 px-6 py-2 bg-[#09090b]/90 backdrop-blur-md border-y border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer group"
                      >
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#4ADE80] transition-colors group-hover:text-green-300">
                          {categoria}
                        </h3>
                        <ChevronDown className={`w-4 h-4 text-[#4ADE80] transition-transform ${collapsedCats.has(categoria) ? "rotate-180" : ""}`} />
                      </div>
                      {!collapsedCats.has(categoria) && (
                        <div className="px-6 mt-4 flex flex-col gap-6">
                        {Object.entries(productos).map(([prodId, prodData], idx) => (
                          <div key={prodId} className="border border-zinc-800 rounded-md overflow-visible bg-zinc-950/50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black/40">
                              <div className="flex items-center gap-3">
                                {/* Imagen con Hover */}
                                <div className="relative group/img w-10 h-10 shrink-0 bg-zinc-900 border border-zinc-800 rounded overflow-visible">
                                  {prodData.variantes[0]?.imagen_url ? (
                                    <img 
                                      src={prodData.variantes[0].imagen_url} 
                                      alt={prodData.nombre}
                                      className="w-full h-full object-cover rounded transition-all duration-300 group-hover/img:scale-[2.5] group-hover/img:z-50 group-hover/img:shadow-2xl group-hover/img:relative"
                                      style={{ transformOrigin: 'center left' }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 font-bold uppercase">
                                      N/A
                                    </div>
                                  )}
                                </div>
                                <h4 className="font-bold uppercase text-sm tracking-wide text-zinc-200">
                                  {prodData.nombre}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingProductId(prodId)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors bg-white/5 text-white/50 hover:bg-white/10 hover:text-white rounded"
                                >
                                  <Edit3 className="w-3 h-3" /> Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prodId, prodData.nombre)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded"
                                >
                                  <Trash2 className="w-3 h-3" /> Borrar
                                </button>
                              </div>
                            </div>
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
                                  {["Talle", "Stock", "P. Venta", "P. Costo", ""].map((h) => (
                                    <th
                                      key={h}
                                      className="px-4 py-2 text-left font-bold uppercase tracking-wide text-zinc-500"
                                      style={{ whiteSpace: "nowrap" }}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {prodData.variantes.map((row) => {
                                  const isSaved = savedIds.has(row.id_variante);
                                  return (
                                    <tr
                                      key={row.id_variante}
                                      style={{
                                        borderBottom: "1px solid hsl(0 0% 10%)",
                                        background: row.dirty ? "rgba(255,255,255,0.025)" : stockBg(row.cantidad_edit),
                                        transition: "background 0.2s",
                                      }}
                                    >
                                      <td className="px-4 py-2.5 font-black text-center" style={{ color: "hsl(0 0% 70%)", width: 80 }}>
                                        {row.talle}
                                      </td>
                                      <td className="px-3 py-2" style={{ width: 90 }}>
                                        <input
                                          type="number"
                                          min={0}
                                          value={row.cantidad_edit || ""}
                                          onChange={(e) => updateRow(row.id_variante, "cantidad_edit", parseInt(e.target.value) || 0)}
                                          className="w-full px-2 py-1.5 text-xs font-black tabular-nums text-center"
                                          style={{
                                            background: "transparent",
                                            border: `1px solid ${row.cantidad_edit === 0 ? "rgba(255,68,68,0.4)" : row.cantidad_edit < 4 ? "rgba(245,158,11,0.4)" : "hsl(0 0% 16%)"}`,
                                            color: stockColor(row.cantidad_edit),
                                          }}
                                        />
                                      </td>
                                      <td className="px-3 py-2" style={{ width: 110 }}>
                                        <NumCell
                                          value={row.precio_venta_edit}
                                          onChange={(v) => updateRow(row.id_variante, "precio_venta_edit", v)}
                                          isPrice
                                        />
                                      </td>
                                      <td className="px-3 py-2" style={{ width: 110 }}>
                                        <NumCell
                                          value={row.precio_costo_edit}
                                          onChange={(v) => updateRow(row.id_variante, "precio_costo_edit", v)}
                                          isPrice
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-right" style={{ width: 80 }}>
                                        {isSaved ? (
                                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                            <CheckCircle2 className="w-4 h-4 inline" style={{ color: "#4ADE80" }} />
                                          </motion.span>
                                        ) : row.dirty ? (
                                          <button
                                            onClick={() => saveRow(row)}
                                            disabled={isPending}
                                            className="px-2 py-1 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-70 disabled:opacity-30 border border-zinc-600 text-zinc-400 rounded"
                                          >
                                            Guardar
                                          </button>
                                        ) : null}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Footer legend ───────────────────────────── */}
            <div
              className="flex items-center gap-6 px-6 py-3 shrink-0"
              style={{ borderTop: "1px solid hsl(0 0% 12%)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: "#FF4444" }} />
                <span className="text-xs" style={{ color: "hsl(0 0% 45%)" }}>Sin stock (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: "#F59E0B" }} />
                <span className="text-xs" style={{ color: "hsl(0 0% 45%)" }}>Stock bajo (&lt;4)</span>
              </div>
              {dirtyCount > 0 && (
                <span className="text-xs ml-auto" style={{ color: "#F59E0B" }}>
                  {dirtyCount} cambio{dirtyCount !== 1 ? "s" : ""} sin guardar
                </span>
              )}
            </div>
          </motion.div>
          <EditarProductoModal
            open={!!editingProductId}
            productoId={editingProductId}
            onClose={() => setEditingProductId(null)}
            onSuccess={loadData}
          />
        </>
      )}
    </AnimatePresence>
  );
}
