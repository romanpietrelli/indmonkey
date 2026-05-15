"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, MessageCircle, Mail, Loader2, RefreshCw } from "lucide-react";
import { crearProveedor, getProveedores, eliminarProveedor } from "@/lib/actions";
import type { Proveedor, ProveedorPayload } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

const EMPTY_FORM: ProveedorPayload = {
  nombre: "",
  marca_que_proveen: "",
  email: "",
  whatsapp: "",
  descripcion_detalle: "",
};

interface ProveedoresModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProveedoresModal({ open, onClose }: ProveedoresModalProps) {
  const { toast } = useToast();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [form, setForm] = useState<ProveedorPayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  function refresh() {
    setLoading(true);
    getProveedores().then((data) => {
      setProveedores(data as Proveedor[]);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (open) {
      refresh();
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSearch("");
    }
  }, [open]);

  function set<K extends keyof ProveedorPayload>(key: K, value: ProveedorPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.nombre.trim()) {
      toast("error", "El nombre del proveedor es obligatorio.");
      return;
    }
    startTransition(async () => {
      const res = await crearProveedor(form);
      if (res.ok) {
        toast("success", "Proveedor agregado.");
        setForm(EMPTY_FORM);
        setShowForm(false);
        refresh();
      } else {
        toast("error", res.error ?? "Error al guardar.");
      }
    });
  }

  function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Borrar proveedor "${nombre}"?`)) return;
    startTransition(async () => {
      const res = await eliminarProveedor(id);
      if (res.ok) {
        toast("success", `Proveedor "${nombre}" eliminado.`);
        refresh();
      } else {
        toast("error", res.error ?? "Error al eliminar.");
      }
    });
  }

  // Limpieza de número para WhatsApp URL (solo dígitos)
  function cleanPhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  const filtered = proveedores.filter(
    (p) => {
      const q = search.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.marca_que_proveen ?? "").toLowerCase().includes(q) ||
        (p.descripcion_detalle ?? "").toLowerCase().includes(q)
      );
    }
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="prov-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            key="prov-modal"
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
                  Proveedores
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refresh} className="p-1.5 transition-opacity hover:opacity-60" style={{ color: "var(--color-muted-foreground)" }}>
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={onClose} className="p-1.5 transition-opacity hover:opacity-60" style={{ color: "var(--color-muted-foreground)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {/* Search */}
              <input
                type="search"
                placeholder="Buscar proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold"
                style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              />

              {/* Add toggle */}
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ border: "1px dashed var(--color-border)", padding: "10px 16px", color: "var(--color-muted-foreground)" }}
              >
                <Plus className="w-3.5 h-3.5" />
                {showForm ? "Cancelar" : "Agregar Proveedor"}
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
                      className="p-4 flex flex-col gap-3"
                      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    >
                      {[
                        { key: "nombre" as const, label: "Nombre *", placeholder: "Proveedor SA" },
                        { key: "marca_que_proveen" as const, label: "Marca que proveen", placeholder: "Nike, Adidas..." },
                        { key: "email" as const, label: "Email", placeholder: "contacto@proveedor.com" },
                        { key: "whatsapp" as const, label: "WhatsApp", placeholder: "+549 11 1234-5678" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-muted-foreground)" }}>
                            {label}
                          </p>
                          <input
                            type="text"
                            value={form[key]}
                            onChange={(e) => set(key, e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 text-xs font-bold"
                            style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                          />
                        </div>
                      ))}
                      {/* Detalle de productos/insumos */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-muted-foreground)" }}>
                          Detalle de productos/insumos
                        </p>
                        <textarea
                          value={form.descripcion_detalle}
                          onChange={(e) => set("descripcion_detalle", e.target.value)}
                          placeholder="Ej: Telas premium 450gsm, cordones técnicos, etiquetas de marca..."
                          rows={3}
                          className="w-full px-3 py-2 text-xs font-bold resize-none"
                          style={{
                            background: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-foreground)",
                            lineHeight: 1.6,
                          }}
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-black uppercase tracking-widest transition-opacity disabled:opacity-40 mt-1"
                        style={{ background: "var(--color-foreground)", color: "var(--color-primary-foreground)" }}
                      >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Guardar Proveedor
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Directorio */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-muted-foreground)" }} />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
                  {search ? "Sin resultados." : "No hay proveedores aún."}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-start justify-between p-4"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase">{p.nombre}</p>
                        {p.marca_que_proveen && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                            {p.marca_que_proveen}
                          </p>
                        )}
                        {p.descripcion_detalle && (
                          <p
                            className="text-xs mt-1.5 leading-relaxed"
                            style={{ color: "var(--color-muted-foreground)", opacity: 0.75 }}
                          >
                            {p.descripcion_detalle}
                          </p>
                        )}
                        {/* Acciones de contacto */}
                        <div className="flex items-center gap-3 mt-3">
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/${cleanPhone(p.whatsapp)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70 px-2 py-1"
                              style={{ border: "1px solid rgba(74,222,128,0.35)", color: "#4ADE80" }}
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}
                          {p.email && (
                            <a
                              href={`mailto:${p.email}`}
                              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70 px-2 py-1"
                              style={{ border: "1px solid var(--color-border)", color: "var(--color-muted-foreground)" }}
                            >
                              <Mail className="w-3 h-3" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEliminar(p.id, p.nombre)}
                        disabled={isPending}
                        className="p-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 disabled:opacity-30 shrink-0"
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
