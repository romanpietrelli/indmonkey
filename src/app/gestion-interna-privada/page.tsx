"use client";

import {
  useState,
  useEffect,
  useTransition,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Plus,
  Receipt,
  Truck,
  List,
  LogOut,
  BellRing,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";

import { getKpisByRange, getVentasConItems } from "@/lib/actions";
import type { KpiDashboard, VentaConItems } from "@/lib/types";

import { KpiCard } from "@/components/admin/KpiCard";
import { CurrencyToggle, useDolarBlue } from "@/components/admin/CurrencyToggle";
import { DateRangePicker, type DateRange } from "@/components/admin/DateRangePicker";
import { StockAlerts } from "@/components/admin/StockAlerts";
import { VentaManualModal } from "@/components/admin/VentaManualModal";
import { GastosFijosModal } from "@/components/admin/GastosFijosModal";
import { ProveedoresModal } from "@/components/admin/ProveedoresModal";
import { VentasTable } from "@/components/admin/VentasTable";
import { EditarVentaModal } from "@/components/admin/EditarVentaModal";
import { AgregarProductoModal } from "@/components/admin/AgregarProductoModal";
import { GestionarStockModal } from "@/components/admin/GestionarStockModal";
import { ToastProvider } from "@/components/admin/Toast";

// ─── Helpers de fecha ─────────────────────────────────────────
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
function getStartOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

const EMPTY_KPIS: KpiDashboard = {
  ventasHoy: 0,
  gananciaBrutaMes: 0,
  gastosFijosMes: 0,
  gananciaNeta: 0,
  top3Productos: [],
  alertasStockBajo: [],
};

function AdminDashboardInner() {
  // ─ State ────────────────────────────────────────────────────
  const [kpis, setKpis] = useState<KpiDashboard>(EMPTY_KPIS);
  const [ventas, setVentas] = useState<VentaConItems[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: getStartOfMonth(),
    to: getToday(),
  });
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");

  // ─ Modales ──────────────────────────────────────────────────
  const [ventaModalOpen, setVentaModalOpen] = useState(false);
  const [gastosOpen, setGastosOpen] = useState(false);
  const [proveedoresOpen, setProveedoresOpen] = useState(false);
  const [agregarProductoOpen, setAgregarProductoOpen] = useState(false);
  const [gestionarStockOpen, setGestionarStockOpen] = useState(false);
  const [ventaEditando, setVentaEditando] = useState<VentaConItems | null>(null);
  const [showVentas, setShowVentas] = useState(false);
  const [nuevasVentasAlert, setNuevasVentasAlert] = useState<VentaConItems[]>([]);

  const [isPending, startTransition] = useTransition();

  // ─ Dólar Blue ───────────────────────────────────────────────
  const { dolarBlue } = useDolarBlue();
  const effectiveDolar = dolarBlue ?? 1050;

  // ─ Data fetching ────────────────────────────────────────────
  const loadAll = useCallback((range: DateRange) => {
    startTransition(async () => {
      const [kpisData, ventasData] = await Promise.all([
        getKpisByRange(range.from, range.to).catch(() => EMPTY_KPIS),
        getVentasConItems(range.from, range.to).catch(() => []),
      ]);
      setKpis(kpisData);
      setVentas(ventasData);

      // Check for new Web sales
      const webSales = ventasData.filter(v => v.origen === "Web");
      if (webSales.length > 0) {
        const lastSeenId = localStorage.getItem("last_seen_web_sale_id");
        if (lastSeenId) {
          const lastSeenIndex = webSales.findIndex(v => v.id === lastSeenId);
          if (lastSeenIndex > 0) {
            setNuevasVentasAlert(webSales.slice(0, lastSeenIndex));
          } else if (lastSeenIndex === -1 && webSales[0].id !== lastSeenId) {
            setNuevasVentasAlert([webSales[0]]);
          }
        }
        localStorage.setItem("last_seen_web_sale_id", webSales[0].id);
      }
    });
  }, []);

  useEffect(() => {
    loadAll(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDateChange(range: DateRange) {
    setDateRange(range);
    loadAll(range);
  }

  const esGananciaNegativa = kpis.gananciaNeta < 0;

  return (
    <div className="min-h-screen p-6 md:p-10 hq-grid" style={{ backgroundColor: "#020202", paddingTop: "120px" }}>
      <div className="max-w-7xl mx-auto">

        {/* ─── HQ CENTRALIZED HEADER — REFINED ───────────────── */}
        <div className="mb-16 flex flex-col items-center gap-10 border-b border-zinc-900 pb-12">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left: Technical Label */}
            <div className="flex-1 hidden md:flex flex-col items-start">
              <p className="text-2xl font-mono font-bold uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                PANEL DE CONTROL
              </p>
              <div className="h-0.5 w-12 bg-white/20 mt-1" />
            </div>

            {/* Center: Brand Identity (Logo) — SIGNIFICANTLY BIGGER */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-12 bg-white/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <img 
                  src="/logo.png" 
                  alt="Ind Monkey" 
                  className="h-40 w-auto relative grayscale contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]"
                />
              </div>
            </div>

            {/* Right: HQ Versioning + Logout */}
            <div className="flex-1 hidden md:flex flex-col items-end">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-xl font-mono font-bold uppercase tracking-tight text-white/90">
                  CATRIEL HQ | <span className="text-zinc-500">ADMIN v1.2</span>
                </p>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
              <span className="text-[9px] font-mono font-black tracking-widest text-zinc-600 uppercase">
                Secure_Terminal_Access
              </span>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 bg-zinc-950/50 p-2 border border-zinc-900 rounded-sm">
            <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
               <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase">Estado:</span>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
               <span className="text-[10px] font-mono text-zinc-400">ONLINE</span>
            </div>
            
            <DateRangePicker value={dateRange} onChange={handleDateChange} />
            <div className="h-4 w-px bg-zinc-800" />
            <CurrencyToggle moneda={moneda} dolarBlue={dolarBlue} onToggle={setMoneda} />
            
            {isPending && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse text-zinc-500">
                SYNCING_DATA...
              </span>
            )}
          </div>
        </div>

        {/* ─── KPIs ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <KpiCard index={0} icon={<ShoppingBag className="w-5 h-5" />} label="Ingresos (período)" rawValue={kpis.ventasHoy} moneda={moneda} dolarBlue={effectiveDolar} referenceMax={Math.max(kpis.ventasHoy, kpis.gananciaBrutaMes) || undefined} />
          <KpiCard index={1} icon={<TrendingUp className="w-5 h-5" />} label="Ganancia Bruta" rawValue={kpis.gananciaBrutaMes} moneda={moneda} dolarBlue={effectiveDolar} referenceMax={kpis.ventasHoy || undefined} />
          <KpiCard index={2} icon={<DollarSign className="w-5 h-5" />} label="Gastos Fijos" rawValue={kpis.gastosFijosMes} moneda={moneda} dolarBlue={effectiveDolar} muted referenceMax={kpis.gananciaBrutaMes || undefined} />
          <KpiCard index={3} icon={esGananciaNegativa ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />} label="Ganancia Neta" rawValue={kpis.gananciaNeta} moneda={moneda} dolarBlue={effectiveDolar} highlight negative={esGananciaNegativa} />
        </div>

        {/* ─── PANELES SECUNDARIOS ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 3 */}
          <div className="p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--color-muted-foreground)" }}>
              Top 3 Productos — Período
            </h2>
            {kpis.top3Productos.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Sin datos en este período.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {kpis.top3Productos.map((p, i) => {
                  const maxI = kpis.top3Productos[0].ingresos || 1;
                  const pct = (p.ingresos / maxI) * 100;
                  return (
                    <motion.div key={p.nombre} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black w-8" style={{ color: i === 0 ? "var(--color-foreground)" : "var(--color-muted-foreground)" }}>#{i + 1}</span>
                          <div>
                            <p className="text-sm font-bold uppercase">{p.nombre}</p>
                            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{p.unidades} unidades</p>
                          </div>
                        </div>
                        <p className="text-sm font-black tabular-nums">
                          {moneda === "USD" ? `USD ${(p.ingresos / effectiveDolar).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.ingresos.toLocaleString("es-AR")}`}
                        </p>
                      </div>
                      <div className="h-px w-full" style={{ background: "var(--color-border)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }} className="h-full" style={{ background: i === 0 ? "var(--color-foreground)" : "var(--color-muted-foreground)", opacity: 0.5 }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alertas de stock */}
          <StockAlerts alertas={kpis.alertasStockBajo} />
        </div>

        {/* ─── VENTAS RECIENTES ────────────────────────────── */}
        <div className="mb-6" style={{ border: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setShowVentas((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
            style={{ background: "var(--color-card)" }}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} />
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                Ventas del Período
              </h2>
              {ventas.length > 0 && (
                <span className="text-xs font-black px-2 py-0.5" style={{ background: "var(--color-muted)", color: "var(--color-foreground)" }}>
                  {ventas.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--color-muted-foreground)" }}>
              {showVentas ? "Ocultar ▲" : "Ver ▼"}
            </span>
          </button>

          {showVentas && (
            <div className="p-4">
              <VentasTable
                ventas={ventas}
                moneda={moneda}
                dolarBlue={effectiveDolar}
                onVentaBorrada={() => loadAll(dateRange)}
                onEditarVenta={setVentaEditando}
              />
            </div>
          )}
        </div>

        {/* ─── ACCESOS RÁPIDOS ─────────────────────────────── */}
        <div className="p-8 relative overflow-hidden group" style={{ background: "rgba(9, 9, 11, 0.8)", border: "1px solid rgba(39, 39, 42, 1)" }}>
          {/* Wireframe bg */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_0)] [background-size:20px_20px]" />
          
          <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-zinc-800" />
             ACCESOS RÁPIDOS
            <span className="w-full h-px bg-zinc-800" />
          </h2>

          <div className="flex flex-wrap gap-4 relative z-10">
            <button
              onClick={() => setVentaModalOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 transition-all hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
            >
              <ShoppingBag className="w-4 h-4 text-green-500/70 group-hover:text-green-500" /> 
              Cargar Venta Manual
            </button>
            <button
              onClick={() => setGastosOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 transition-all hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Receipt className="w-4 h-4 text-zinc-500 group-hover:text-white" /> 
              Gastos Fijos
            </button>
            <button
              onClick={() => setProveedoresOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 transition-all hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Truck className="w-4 h-4 text-zinc-500 group-hover:text-white" /> 
              Proveedores
            </button>
            <button
              onClick={() => setAgregarProductoOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 transition-all hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Plus className="w-4 h-4 text-zinc-500 group-hover:text-white" /> 
              Agregar Producto
            </button>
            <button
              onClick={() => setGestionarStockOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-zinc-800 bg-zinc-950 transition-all hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <List className="w-4 h-4 text-zinc-500 group-hover:text-white" /> 
              Gestionar Stock
            </button>
          </div>

          {/* Technical corner accents */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-700 opacity-20" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-700 opacity-20" />
        </div>
      </div>

      {/* ─── MODALES & DRAWERS ──────────────────────────────── */}
      <VentaManualModal open={ventaModalOpen} onClose={() => setVentaModalOpen(false)} onSuccess={() => loadAll(dateRange)} />
      <GastosFijosModal open={gastosOpen} onClose={() => setGastosOpen(false)} dateFrom={dateRange.from} dateTo={dateRange.to} onGastoCreado={() => loadAll(dateRange)} />
      <ProveedoresModal open={proveedoresOpen} onClose={() => setProveedoresOpen(false)} />
      <EditarVentaModal venta={ventaEditando} onClose={() => setVentaEditando(null)} onSuccess={() => loadAll(dateRange)} />
      <AgregarProductoModal open={agregarProductoOpen} onClose={() => setAgregarProductoOpen(false)} onSuccess={() => loadAll(dateRange)} />
      <GestionarStockModal open={gestionarStockOpen} onClose={() => setGestionarStockOpen(false)} />
      {/* ─── ALERTA NUEVAS VENTAS ────────────────────────────── */}
      <AnimatePresence>
        {nuevasVentasAlert.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setNuevasVentasAlert([])} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-950 border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.15)] p-8 max-w-md w-full flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-green-500/30 animate-ping" />
                <BellRing className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">¡Nueva Venta Web!</h2>
              <p className="text-sm font-mono text-zinc-400 mb-8">
                Tenés {nuevasVentasAlert.length} nueva{nuevasVentasAlert.length !== 1 ? 's' : ''} venta{nuevasVentasAlert.length !== 1 ? 's' : ''} ingresada{nuevasVentasAlert.length !== 1 ? 's' : ''} desde la tienda online.
              </p>

              <button 
                onClick={() => {
                  setNuevasVentasAlert([]);
                  setShowVentas(true);
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }}
                className="w-full bg-green-500 text-black font-black uppercase tracking-widest py-4 hover:bg-green-400 transition-colors"
              >
                Ver Detalles
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page con ToastProvider envolviendo todo ──────────────────
export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <AdminDashboardInner />
    </ToastProvider>
  );
}
