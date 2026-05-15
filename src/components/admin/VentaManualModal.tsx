"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { getProductosParaVenta, registrarVentaManual } from "@/lib/actions";
import type { ProductoParaVenta, VarianteParaVenta, MetodoPago } from "@/lib/types";

const METODOS_PAGO: MetodoPago[] = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "MercadoPago",
  "Crypto",
];

interface VentaManualModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // para refrescar los KPIs
}

export function VentaManualModal({
  open,
  onClose,
  onSuccess,
}: VentaManualModalProps) {
  const [productos, setProductos] = useState<ProductoParaVenta[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Selecciones del formulario
  const [productoId, setProductoId] = useState("");
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Efectivo");

  // Estado de envío
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar productos al abrir
  useEffect(() => {
    if (!open) return;
    setLoadingProductos(true);
    getProductosParaVenta().then((data) => {
      setProductos(data);
      setLoadingProductos(false);
    });
    // Reset form
    setProductoId("");
    setVarianteId("");
    setCantidad(1);
    setMetodoPago("Efectivo");
    setErrorMsg(null);
    setSuccess(false);
  }, [open]);

  // Derivados
  const productoSeleccionado = productos.find((p) => p.id === productoId);
  const variantesDisponibles: VarianteParaVenta[] =
    productoSeleccionado?.variantes ?? [];
  const varianteSeleccionada = variantesDisponibles.find(
    (v) => v.id_variante === varianteId
  );

  const cantidadMax = varianteSeleccionada?.cantidad ?? 1;
  const precioUnit = varianteSeleccionada?.precio_venta ?? 0;
  const costoUnit = varianteSeleccionada?.precio_costo ?? 0;
  const totalVenta = precioUnit * cantidad;
  const totalCosto = costoUnit * cantidad;
  const gananciaBruta = totalVenta - totalCosto;

  function handleProductoChange(id: string) {
    setProductoId(id);
    setVarianteId("");
    setCantidad(1);
  }

  function handleVarianteChange(id: string) {
    setVarianteId(id);
    setCantidad(1);
  }

  function handleSubmit() {
    if (!varianteId || cantidad < 1) return;
    setErrorMsg(null);

    startTransition(async () => {
      const result = await registrarVentaManual({
        metodo_pago: metodoPago,
        items: [
          {
            variante_id: varianteId,
            cantidad,
            precio_unitario: precioUnit,
            costo_unitario: costoUnit,
          },
        ],
      });

      if (!result.ok) {
        setErrorMsg(result.error ?? "Error desconocido");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    });
  }

  function formatARS(n: number) {
    return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-lg"
              style={{
                pointerEvents: "all",
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} />
                  <h2 className="text-xs font-black uppercase tracking-widest">
                    Cargar Venta Manual
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-5">
                {/* Success state */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-3"
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color: "#4ADE80" }} />
                    <p className="text-sm font-black uppercase tracking-widest" style={{ color: "#4ADE80" }}>
                      Venta registrada
                    </p>
                  </motion.div>
                )}

                {!success && (
                  <>
                    {/* Producto */}
                    <div>
                      <Label>Producto</Label>
                      {loadingProductos ? (
                        <div className="flex items-center gap-2 py-3">
                          <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--color-muted-foreground)" }} />
                          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            Cargando...
                          </span>
                        </div>
                      ) : (
                        <ProductSelector
                          value={productoId}
                          onChange={handleProductoChange}
                          placeholder="— Seleccioná un producto —"
                          productos={productos}
                        />
                      )}
                    </div>

                    {/* Variante / Talle */}
                    {productoId && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Label>Talle / Variante</Label>
                        <SelectField
                          value={varianteId}
                          onChange={handleVarianteChange}
                          placeholder="— Seleccioná el talle —"
                          options={variantesDisponibles.map((v) => ({
                            value: v.id_variante,
                            label: `${v.talle} — Stock: ${v.cantidad} — ${formatARS(v.precio_venta)}`,
                          }))}
                        />
                      </motion.div>
                    )}

                    {/* Cantidad */}
                    {varianteId && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Label>Cantidad</Label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                            className="w-8 h-8 flex items-center justify-center text-lg font-black transition-colors hover:bg-white/10"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            −
                          </button>
                          <span className="text-2xl font-black tabular-nums w-8 text-center">
                            {cantidad}
                          </span>
                          <button
                            onClick={() => setCantidad((c) => Math.min(cantidadMax, c + 1))}
                            className="w-8 h-8 flex items-center justify-center text-lg font-black transition-colors hover:bg-white/10"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            +
                          </button>
                          <span className="text-xs ml-2" style={{ color: "var(--color-muted-foreground)" }}>
                            máx. {cantidadMax}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Método de pago */}
                    <div>
                      <Label>Método de Pago</Label>
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

                    {/* Resumen de totales */}
                    {varianteId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4"
                        style={{
                          background: "var(--color-background)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <p
                          className="text-xs font-bold uppercase tracking-widest mb-3"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          Resumen
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <Row label="Total Venta" value={formatARS(totalVenta)} />
                          <Row
                            label="Costo Mercadería"
                            value={formatARS(totalCosto)}
                            muted
                          />
                          <div
                            className="my-1"
                            style={{ borderTop: "1px solid var(--color-border)" }}
                          />
                          <Row
                            label="Ganancia Bruta"
                            value={formatARS(gananciaBruta)}
                            accent={gananciaBruta >= 0 ? "green" : "red"}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    {errorMsg && (
                      <p
                        className="text-xs font-bold"
                        style={{ color: "#FF4444" }}
                      >
                        ✕ {errorMsg}
                      </p>
                    )}

                    {/* CTA */}
                    <button
                      onClick={handleSubmit}
                      disabled={!varianteId || isPending}
                      className="w-full py-3 text-sm font-black uppercase tracking-widest transition-opacity disabled:opacity-30 flex items-center justify-center gap-2"
                      style={{
                        background: varianteId ? "var(--color-foreground)" : "var(--color-muted)",
                        color: varianteId ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                      }}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        "Registrar Venta"
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-2"
      style={{ color: "var(--color-muted-foreground)" }}
    >
      {children}
    </p>
  );
}

function ProductSelector({
  value,
  onChange,
  productos,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  productos: ProductoParaVenta[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = productos.find((p) => p.id === value);

  // Filtrado y agrupación
  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria_nombre.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.categoria_nombre]) acc[p.categoria_nombre] = [];
    acc[p.categoria_nombre].push(p);
    return acc;
  }, {} as Record<string, ProductoParaVenta[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between text-left transition-all"
        style={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border)",
          color: selected ? "var(--color-foreground)" : "var(--color-muted-foreground)",
        }}
      >
        <div className="flex items-center gap-2">
          {selected && selected.imagen_url && (
            <img src={selected.imagen_url} alt="" className="w-5 h-5 object-cover rounded-sm" />
          )}
          <span>{selected ? selected.nombre : placeholder}</span>
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute left-0 right-0 top-full mt-1 z-[70] max-h-80 overflow-y-auto shadow-2xl border"
              style={{
                background: "#141414",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Search */}
              <div className="sticky top-0 p-2 bg-[#141414] border-b border-zinc-800">
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold bg-zinc-900 border border-zinc-800 outline-none focus:border-zinc-600"
                />
              </div>

              {/* List */}
              <div className="py-2">
                {Object.entries(grouped).map(([cat, prods]) => (
                  <div key={cat}>
                    <div className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 bg-zinc-900/30">
                      {cat}
                    </div>
                    {prods.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onChange(p.id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 shrink-0 bg-zinc-900 rounded overflow-hidden">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700">N/A</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold uppercase tracking-wide group-hover:text-white transition-colors">
                            {p.nombre}
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            {p.variantes.length} talles disponibles
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="px-3 py-8 text-center text-xs text-zinc-600 uppercase font-black">
                    Sin resultados
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-xs font-bold appearance-none pr-8"
        style={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border)",
          color: value ? "var(--color-foreground)" : "var(--color-muted-foreground)",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#141414" }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
        style={{ color: "var(--color-muted-foreground)" }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: "green" | "red";
}) {
  const color = accent === "green"
    ? "#4ADE80"
    : accent === "red"
    ? "#FF4444"
    : muted
    ? "var(--color-muted-foreground)"
    : "var(--color-foreground)";

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <span className="text-sm font-black tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
