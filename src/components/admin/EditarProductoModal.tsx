"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Trash2, ChevronRight, ChevronLeft,
  Loader2, CheckCircle2, Package, Layers, ClipboardCheck,
  UploadCloud, Image as ImageIcon, Edit3
} from "lucide-react";
import { getCategorias, actualizarProductoConVariantes, crearCategoria, getProductoByIdAdmin, actualizarCategoria, eliminarCategoria } from "@/lib/actions";
import type { Categoria, CrearProductoPayload, VariantePayload, Moneda } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";
import { createClient } from "@/lib/supabase/client";

// ─── Slug generator ──────────────────────────────────────────
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Stepper config ──────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Info General", icon: Package },
  { id: 2, label: "Variantes", icon: Layers },
  { id: 3, label: "Confirmación", icon: ClipboardCheck },
];

const EMPTY_VARIANTE: VariantePayload = {
  talle: "",
  cantidad: 0,
  precio_venta: 0,
  precio_costo: 0,
  moneda_costo: "ARS",
};

interface EditarProductoModalProps {
  open: boolean;
  productoId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditarProductoModal({
  open,
  productoId,
  onClose,
  onSuccess,
}: EditarProductoModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  // Paso 1 — Info General
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  // Upload states
  type UnifiedImage = { url: string; file?: File };
  const [images, setImages] = useState<UnifiedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Categoría rápida states
  const [isAddingCategoria, setIsAddingCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [isCreatingCategoria, setIsCreatingCategoria] = useState(false);

  // Gestión de categorías existentes
  const [isEditingCategoria, setIsEditingCategoria] = useState(false);
  const [editCategoriaNombre, setEditCategoriaNombre] = useState("");
  const [isDeletingCategoria, setIsDeletingCategoria] = useState(false);

  // Paso 2 — Variantes
  const [variantes, setVariantes] = useState<VariantePayload[]>([{ ...EMPTY_VARIANTE }]);

  // ─ Reset & load on open ────────────────────────────────────
  useEffect(() => {
    if (!open || !productoId) return;
    setStep(1);
    setDone(false);
    setImages([]);
    setIsUploading(false);

    getProductoByIdAdmin(productoId).then(prod => {
      if (!prod) return;
      setNombre(prod.nombre || "");
      setSlug(prod.slug || "");
      setSlugManual(true);
      setDescripcion(prod.descripcion || "");
      setImagenUrl(prod.imagen_url || "");
      if (prod.imagenes) {
        setImages(prod.imagenes.map((url: string) => ({ url })));
      } else if (prod.imagen_url) {
        setImages([{ url: prod.imagen_url }]);
      }
      setCategoriaId(prod.categoria_id || null);
      if (prod.variantes && prod.variantes.length > 0) {
        setVariantes(prod.variantes);
      } else {
        setVariantes([{ ...EMPTY_VARIANTE }]);
      }
    });

    getCategorias().then(setCategorias);
  }, [open, productoId]);

  // ─ Auto-slug ────────────────────────────────────────────────
  useEffect(() => {
    if (!slugManual) setSlug(toSlug(nombre));
  }, [nombre, slugManual]);

  // ─ Variante helpers ─────────────────────────────────────────
  function addVariante() {
    setVariantes((prev) => [...prev, { ...EMPTY_VARIANTE }]);
  }
  function removeVariante(i: number) {
    setVariantes((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateVariante<K extends keyof VariantePayload>(
    i: number, key: K, value: VariantePayload[K]
  ) {
    setVariantes((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v))
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = files.map(f => ({
        url: URL.createObjectURL(f),
        file: f
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  }

  function removeFile(index: number) {
    setImages(prev => {
      const img = prev[index];
      if (img.file) URL.revokeObjectURL(img.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveFile(index: number, direction: 'left' | 'right') {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages(prev => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  }

  async function handleCrearCategoria() {
    if (!nuevaCategoriaNombre.trim()) return;
    setIsCreatingCategoria(true);
    const res = await crearCategoria(nuevaCategoriaNombre);
    if (res.ok && res.categoria) {
      const allCats = await getCategorias();
      setCategorias(allCats);
      setCategoriaId(res.categoria.id);
      setIsAddingCategoria(false);
      setNuevaCategoriaNombre("");
      toast("success", `Categoría '${nuevaCategoriaNombre}' creada`);
    } else {
      toast("error", res.error ?? "Error al crear categoría");
    }
    setIsCreatingCategoria(false);
  }

  async function handleActualizarCategoria() {
    if (!categoriaId || !editCategoriaNombre.trim()) return;
    setIsCreatingCategoria(true);
    const res = await actualizarCategoria(categoriaId, editCategoriaNombre);
    if (res.ok) {
      const allCats = await getCategorias();
      setCategorias(allCats);
      setIsEditingCategoria(false);
      toast("success", "Categoría actualizada");
    } else {
      toast("error", res.error ?? "Error al actualizar");
    }
    setIsCreatingCategoria(false);
  }

  async function handleEliminarCategoria() {
    if (!categoriaId) return;
    if (!confirm("¿Seguro que querés eliminar esta categoría? Los productos que la usan quedarán sin categoría.")) return;
    
    setIsDeletingCategoria(true);
    const res = await eliminarCategoria(categoriaId);
    if (res.ok) {
      const allCats = await getCategorias();
      setCategorias(allCats);
      setCategoriaId(null);
      toast("success", "Categoría eliminada");
    } else {
      toast("error", res.error ?? "Error al eliminar (puede tener productos vinculados)");
    }
    setIsDeletingCategoria(false);
  }

  // ─ Validation ───────────────────────────────────────────────
  function validateStep1(): string | null {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!slug.trim()) return "El slug es obligatorio.";
    return null;
  }
  function validateStep2(): string | null {
    if (variantes.length === 0) return "Agregá al menos una variante.";
    for (const v of variantes) {
      if (!v.talle.trim()) return "Todos los talles deben tener nombre.";
      if (v.precio_venta <= 0) return "El precio de venta debe ser mayor a 0.";
    }
    return null;
  }

  function handleNext() {
    if (step === 1) {
      const err = validateStep1();
      if (err) { toast("error", err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { toast("error", err); return; }
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  // ─ Submit ────────────────────────────────────────────────────
  function handleSubmit() {
    startTransition(async () => {
      let finalImageUrl = imagenUrl;
      let finalImagenesUrls: string[] = [];

      // ── Subida de Imagen ─────────────────────────────────────
      setIsUploading(true);
      try {
        const supabase = createClient();
        for (const img of images) {
          if (img.file) {
            const file = img.file;
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from("productos")
              .upload(fileName, file);

            if (uploadError) throw new Error(uploadError.message);

            const { data: { publicUrl } } = supabase.storage
              .from("productos")
              .getPublicUrl(fileName);

            finalImagenesUrls.push(publicUrl);
          } else {
            finalImagenesUrls.push(img.url);
          }
        }

        if (finalImagenesUrls.length > 0) {
          finalImageUrl = finalImagenesUrls[0];
        } else {
          finalImageUrl = "";
        }

      } catch (err: any) {
        toast("error", "Error procesando imágenes: " + err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);

      if (!productoId) return;

      const payload: CrearProductoPayload = {
        nombre,
        slug,
        descripcion,
        imagen_url: finalImageUrl,
        imagenes: finalImagenesUrls,
        categoria_id: categoriaId,
        variantes,
      };

      const res = await actualizarProductoConVariantes(productoId, payload);
      if (res.ok) {
        toast("success", "Cambios guardados con éxito");
        setDone(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1400);
      } else {
        toast("error", res.error ?? "Error al actualizar el producto.");
      }
    });
  }

  function formatARS(n: number) {
    return `$${n.toLocaleString("es-AR")}`;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ap-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)" }}
          />

          {/* Modal */}
          <motion.div
            key="ap-modal"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-4xl flex flex-col max-h-[90vh]"
              style={{
                pointerEvents: "all",
                background: "#09090b", // zinc-950
                border: "1px solid hsl(0 0% 18%)",
              }}
            >
              {/* ─── Header + Stepper ─────────────────────── */}
              <div
                className="px-6 pt-5 pb-4 shrink-0"
                style={{ borderBottom: "1px solid hsl(0 0% 14%)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 45%)" }}>
                      Inventario
                    </p>
                    <h2 className="text-lg font-black uppercase" style={{ letterSpacing: "-0.02em" }}>
                      Editar Producto
                    </h2>
                  </div>
                  <button onClick={onClose} className="p-1 transition-opacity hover:opacity-50" style={{ color: "hsl(0 0% 45%)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-0">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                      <div key={s.id} className="flex items-center flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 flex items-center justify-center shrink-0"
                            style={{
                              background: isDone ? "#4ADE80" : isActive ? "hsl(0 0% 98%)" : "hsl(0 0% 12%)",
                              border: `1px solid ${isDone ? "#4ADE80" : isActive ? "hsl(0 0% 98%)" : "hsl(0 0% 20%)"}`,
                              transition: "all 0.25s",
                            }}
                          >
                            {isDone
                              ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#09090b" }} />
                              : <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#09090b" : "hsl(0 0% 45%)" }} />
                            }
                          </div>
                          <span
                            className="text-xs font-bold uppercase tracking-widest hidden sm:block"
                            style={{ color: isActive ? "hsl(0 0% 98%)" : "hsl(0 0% 40%)", transition: "color 0.2s" }}
                          >
                            {s.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className="flex-1 h-px mx-3"
                            style={{ background: step > s.id ? "rgba(74,222,128,0.4)" : "hsl(0 0% 14%)", transition: "background 0.35s" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── Body ─────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                <AnimatePresence mode="wait">
                  {/* ── STEP 1: Info General ─────────────── */}
                  {step === 1 && !done && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-4"
                    >
                      <Field label="Nombre del Producto *">
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Ej: Hoodie Classic Drop 01"
                          className="w-full px-3 py-2.5 text-sm font-bold"
                          style={inputStyle}
                        />
                      </Field>

                      <Field label={`Slug (URL) ${slugManual ? "" : "— auto"}`}>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => { 
                              setSlugManual(true); 
                              setSlug(toSlug(e.target.value)); 
                            }}
                            placeholder="hoodie-classic-drop-01"
                            className="flex-1 px-3 py-2.5 text-sm font-mono"
                            style={inputStyle}
                          />
                          {slugManual && (
                            <button
                              onClick={() => { setSlugManual(false); setSlug(toSlug(nombre)); }}
                              className="px-3 text-xs font-bold uppercase tracking-widest"
                              style={{ border: "1px solid hsl(0 0% 22%)", color: "hsl(0 0% 55%)" }}
                            >
                              Auto
                            </button>
                          )}
                        </div>
                      </Field>

                      <Field label="Categoría">
                        <div className="flex gap-2">
                          {!isAddingCategoria && !isEditingCategoria ? (
                            <>
                              <select
                                value={categoriaId ?? ""}
                                onChange={(e) => setCategoriaId(e.target.value || null)}
                                className="flex-1 px-3 py-2.5 text-sm font-bold"
                                style={inputStyle}
                              >
                                <option value="" style={{ background: "#09090b" }}>— Sin categoría —</option>
                                {categorias.map((c) => (
                                  <option key={c.id} value={c.id} style={{ background: "#09090b" }}>
                                    {c.nombre}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setIsAddingCategoria(true)}
                                  className="w-10 flex items-center justify-center transition-opacity hover:opacity-70 bg-zinc-900 border border-zinc-800"
                                  title="Nueva Categoría"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                {categoriaId && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const cat = categorias.find(c => c.id === categoriaId);
                                        if (cat) {
                                          setEditCategoriaNombre(cat.nombre);
                                          setIsEditingCategoria(true);
                                        }
                                      }}
                                      className="w-10 flex items-center justify-center transition-opacity hover:opacity-70 bg-zinc-900 border border-zinc-800 text-zinc-400"
                                      title="Editar Nombre"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={handleEliminarCategoria}
                                      disabled={isDeletingCategoria}
                                      className="w-10 flex items-center justify-center transition-opacity hover:opacity-70 bg-zinc-900 border border-zinc-800 text-red-500/50 hover:text-red-500"
                                      title="Eliminar Categoría"
                                    >
                                      {isDeletingCategoria ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          ) : isAddingCategoria ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={nuevaCategoriaNombre}
                                onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                                placeholder="Nombre de nueva categoría..."
                                className="flex-1 px-3 py-2.5 text-sm"
                                style={inputStyle}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCrearCategoria();
                                  if (e.key === "Escape") setIsAddingCategoria(false);
                                }}
                              />
                              <button
                                onClick={handleCrearCategoria}
                                disabled={isCreatingCategoria}
                                className="px-3 flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                                style={{ border: "1px solid rgba(74, 222, 128, 0.2)" }}
                              >
                                {isCreatingCategoria ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setIsAddingCategoria(false)}
                                className="px-3 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                style={{ border: "1px solid hsl(0 0% 22%)" }}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={editCategoriaNombre}
                                onChange={(e) => setEditCategoriaNombre(e.target.value)}
                                placeholder="Nuevo nombre..."
                                className="flex-1 px-3 py-2.5 text-sm font-bold text-green-500"
                                style={inputStyle}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleActualizarCategoria();
                                  if (e.key === "Escape") setIsEditingCategoria(false);
                                }}
                              />
                              <button
                                onClick={handleActualizarCategoria}
                                disabled={isCreatingCategoria}
                                className="px-3 flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                                style={{ border: "1px solid rgba(74, 222, 128, 0.2)" }}
                              >
                                {isCreatingCategoria ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setIsEditingCategoria(false)}
                                className="px-3 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                style={{ border: "1px solid hsl(0 0% 22%)" }}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </Field>

                      <Field label={`Fotos del Producto (${images.length})`}>
                        <div
                          className="relative group cursor-pointer overflow-hidden p-2"
                          style={{
                            background: "hsl(0 0% 7%)",
                            border: "1px dashed hsl(0 0% 22%)",
                            minHeight: "120px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            transition: "border-color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(0 0% 40%)")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(0 0% 22%)")}
                          onClick={(e) => {
                             if ((e.target as HTMLElement).closest("button")) return;
                             document.getElementById("edit-file-upload")?.click()
                          }}
                        >
                          <input
                            id="edit-file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          {images.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto scroolbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
                              {images.map((img, idx) => (
                                <div key={idx} className="relative h-24 w-24 shrink-0 rounded overflow-hidden" style={{ border: "1px solid hsl(0 0% 20%)" }}>
                                  <img
                                    src={img.url}
                                    alt={`Preview ${idx + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute top-1 right-1 flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveFile(idx, 'left');
                                      }}
                                      disabled={idx === 0}
                                      className="p-1 rounded bg-black/60 hover:bg-black/80 transition-colors disabled:opacity-30"
                                      style={{ color: "white" }}
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveFile(idx, 'right');
                                      }}
                                      disabled={idx === images.length - 1}
                                      className="p-1 rounded bg-black/60 hover:bg-black/80 transition-colors disabled:opacity-30"
                                      style={{ color: "white" }}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(idx);
                                      }}
                                      className="p-1 rounded bg-black/60 hover:bg-black/80 transition-colors"
                                      style={{ color: "#FF4444" }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div 
                                className="h-24 w-24 shrink-0 rounded flex items-center justify-center cursor-pointer transition-colors" 
                                style={{ border: "1px dashed hsl(0 0% 30%)", background: "rgba(255,255,255,0.02)" }}
                                onClick={(e) => {
                                   e.stopPropagation();
                                   document.getElementById("edit-file-upload")?.click();
                                }}
                              >
                                <Plus className="w-6 h-6 text-zinc-500" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-6">
                              <UploadCloud className="w-8 h-8" style={{ color: "hsl(0 0% 30%)" }} />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: "hsl(0 0% 45%)" }}>
                                Click o arrastra las fotos del producto
                              </p>
                            </div>
                          )}
                        </div>
                      </Field>

                      <Field label="Descripción (opcional)">
                        <textarea
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Descripción del producto..."
                          rows={3}
                          className="w-full px-3 py-2.5 text-sm resize-none"
                          style={{ ...inputStyle, lineHeight: 1.6 }}
                        />
                      </Field>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Variantes ────────────────── */}
                  {step === 2 && !done && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-3"
                    >
                      {/* Column headers */}
                      <div className="grid grid-cols-[80px_80px_1fr_1fr_100px_32px] gap-3 px-1">
                        {["Talle", "Stock", "P. Venta", "P. Costo", "Moneda", ""].map((h) => (
                          <p key={h} className="text-[10px] font-black uppercase tracking-widest" style={{ color: "hsl(0 0% 40%)" }}>{h}</p>
                        ))}
                      </div>

                      <AnimatePresence>
                        {variantes.map((v, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-[80px_80px_1fr_1fr_100px_32px] gap-3 items-center"
                          >
                            <input
                              type="text"
                              value={v.talle}
                              onChange={(e) => updateVariante(i, "talle", e.target.value)}
                              placeholder="XL"
                              className="px-2 py-2 text-xs font-bold text-center"
                              style={inputStyle}
                            />
                            <input
                              type="number"
                              min={0}
                              value={v.cantidad || ""}
                              onChange={(e) => updateVariante(i, "cantidad", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="px-2 py-2 text-xs font-bold text-center"
                              style={inputStyle}
                            />
                            <input
                              type="number"
                              min={0}
                              value={v.precio_venta || ""}
                              onChange={(e) => updateVariante(i, "precio_venta", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="px-2 py-2 text-xs font-bold"
                              style={inputStyle}
                            />
                            <input
                              type="number"
                              min={0}
                              value={v.precio_costo || ""}
                              onChange={(e) => updateVariante(i, "precio_costo", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="px-2 py-2 text-xs font-bold"
                              style={inputStyle}
                            />
                            <select
                              value={v.moneda_costo}
                              onChange={(e) => updateVariante(i, "moneda_costo", e.target.value as Moneda)}
                              className="px-1 py-2 text-xs font-bold"
                              style={inputStyle}
                            >
                              <option value="ARS" style={{ background: "#09090b" }}>ARS</option>
                              <option value="USD" style={{ background: "#09090b" }}>USD</option>
                            </select>
                            <button
                              onClick={() => removeVariante(i)}
                              disabled={variantes.length === 1}
                              className="flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-70 disabled:opacity-20"
                              style={{ color: "#FF4444" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button
                        onClick={addVariante}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-1 px-3 py-2 transition-opacity hover:opacity-70"
                        style={{ border: "1px dashed hsl(0 0% 22%)", color: "hsl(0 0% 50%)" }}
                      >
                        <Plus className="w-3 h-3" /> Agregar Talle
                      </button>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Confirmación ─────────────── */}
                  {step === 3 && !done && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      {/* Producto */}
                      <div className="p-4" style={{ border: "1px solid hsl(0 0% 14%)" }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(0 0% 40%)" }}>
                          Producto
                        </p>
                        <p className="text-xl font-black uppercase">{nombre}</p>
                        <p className="text-xs font-mono mt-1" style={{ color: "hsl(0 0% 45%)" }}>/{slug}</p>
                        {categorias.find((c) => c.id === categoriaId) && (
                          <p className="text-xs mt-1" style={{ color: "hsl(0 0% 45%)" }}>
                            {categorias.find((c) => c.id === categoriaId)?.nombre}
                          </p>
                        )}
                        {images.length > 0 && (
                          <div className="p-2 mb-3 flex gap-2 overflow-x-auto scroolbar-hide" style={{ border: "1px solid hsl(0 0% 14%)", overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {images.map((img, idx) => (
                               <img key={idx} src={img.url} alt={`Preview ${idx}`} className="h-24 w-24 object-cover shrink-0 rounded-sm" />
                            ))}
                          </div>
                        )}
                        {descripcion && (
                          <p className="text-sm mt-2" style={{ color: "hsl(0 0% 60%)" }}>{descripcion}</p>
                        )}
                      </div>

                      {/* Variantes */}
                      <div className="p-4" style={{ border: "1px solid hsl(0 0% 14%)" }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(0 0% 40%)" }}>
                          {variantes.length} Variante{variantes.length !== 1 ? "s" : ""}
                        </p>
                        <div className="grid grid-cols-[80px_60px_1fr_1fr] gap-x-4 gap-y-2">
                          <p className="text-xs font-bold" style={{ color: "hsl(0 0% 40%)" }}>Talle</p>
                          <p className="text-xs font-bold" style={{ color: "hsl(0 0% 40%)" }}>Stock</p>
                          <p className="text-xs font-bold" style={{ color: "hsl(0 0% 40%)" }}>P. Venta</p>
                          <p className="text-xs font-bold" style={{ color: "hsl(0 0% 40%)" }}>P. Costo</p>
                          {variantes.map((v, i) => (
                            <>
                              <p key={`t-${i}`} className="text-sm font-black">{v.talle}</p>
                              <p key={`s-${i}`} className="text-sm">{v.cantidad}</p>
                              <p key={`pv-${i}`} className="text-sm">{formatARS(v.precio_venta)}</p>
                              <p key={`pc-${i}`} className="text-sm" style={{ color: "hsl(0 0% 55%)" }}>
                                {v.moneda_costo === "USD" ? `USD ${v.precio_costo}` : formatARS(v.precio_costo)}
                              </p>
                            </>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── DONE ─────────────────────────────── */}
                  {done && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 gap-3"
                    >
                      <CheckCircle2 className="w-12 h-12" style={{ color: "#4ADE80" }} />
                      <p className="text-sm font-black uppercase tracking-widest" style={{ color: "#4ADE80" }}>
                        Cambios guardados con éxito
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Footer nav ───────────────────────────── */}
              {!done && (
                <div
                  className="flex items-center justify-between px-6 py-4 shrink-0"
                  style={{ borderTop: "1px solid hsl(0 0% 14%)" }}
                >
                  <button
                    onClick={() => setStep((s) => Math.max(s - 1, 1))}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-20 hover:opacity-70"
                    style={{ border: "1px solid hsl(0 0% 22%)", color: "hsl(0 0% 70%)" }}
                  >
                    <ChevronLeft className="w-3 h-3" /> Atrás
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-6 py-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                      style={{ background: "hsl(0 0% 98%)", color: "#09090b" }}
                    >
                      Siguiente <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isPending || isUploading}
                      className="flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest transition-opacity disabled:opacity-30 hover:opacity-80"
                      style={{ background: "#4ADE80", color: "#09090b" }}
                    >
                      {isPending || isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          {isUploading ? "Subiendo..." : "Creando..."}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "hsl(0 0% 45%)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "hsl(0 0% 7%)",
  border: "1px solid hsl(0 0% 18%)",
  color: "hsl(0 0% 95%)",
  outline: "none",
};
